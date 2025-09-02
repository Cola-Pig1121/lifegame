// 导入必要的模块
const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const path = require('path');

// 简单的请求限制器
class RequestLimiter {
  constructor(maxRequestsPerMinute = 10) {
    this.maxRequestsPerMinute = maxRequestsPerMinute;
    this.requests = new Map(); // IP -> [timestamp1, timestamp2, ...]
  }

  canMakeRequest(clientIp) {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // 获取该IP的请求记录
    const requestTimes = this.requests.get(clientIp) || [];
    
    // 清理一分钟前的请求记录
    const recentRequests = requestTimes.filter(time => time > oneMinuteAgo);
    
    // 检查是否超过限制
    return recentRequests.length < this.maxRequestsPerMinute;
  }

  recordRequest(clientIp) {
    const now = Date.now();
    const requestTimes = this.requests.get(clientIp) || [];
    
    // 添加新请求时间
    requestTimes.push(now);
    
    // 只保留最近一分钟的请求
    const oneMinuteAgo = now - 60000;
    const recentRequests = requestTimes.filter(time => time > oneMinuteAgo);
    
    this.requests.set(clientIp, recentRequests);
  }
}

// 创建Express应用
const app = express();
const port = process.env.PORT || 3000;

// 创建请求限制器实例
const requestLimiter = new RequestLimiter(5); // 每分钟最多5个请求

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 创建OpenAI客户端
const createOpenAIClient = (baseURL, apiKey) => {
  return new OpenAI({
    baseURL: baseURL.replace('/v1/chat/completions', '/v1').replace('/chat/completions', ''),
    apiKey: apiKey,
  });
};

// API路由
app.post('/api/generate', async (req, res) => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    
    // 检查请求限制
    if (!requestLimiter.canMakeRequest(clientIp)) {
      return res.status(429).json({ 
        error: '请求过于频繁，请稍后再试',
        retryAfter: '60秒'
      });
    }
    
    // 记录请求
    requestLimiter.recordRequest(clientIp);
    
    const { prompt, baseUrl, apiKey, model } = req.body;
    
    if (!prompt || !baseUrl || !apiKey || !model) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const client = createOpenAIClient(baseUrl, apiKey);
    
    // 设置响应头以支持流式传输
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 重试机制
    let retries = 0;
    const maxRetries = 3;
    let stream;
    
    while (retries <= maxRetries) {
      try {
        // 创建流式请求
        stream = await client.chat.completions.create({
          model: model,
          messages: [{ 
            role: "user", 
            content: prompt + "\n\n请以JSON格式返回结果，包含story和choices字段。story字段内容约100字左右，choices字段只包含3个选项。确保JSON格式完整，不要截断。" 
          }],
          max_tokens: 1000,
          temperature: 0.7,
          stream: true,
        });
        
        // 如果成功获取流，跳出重试循环
        break;
      } catch (error) {
        // 如果是速率限制错误且未达到最大重试次数，则等待后重试
        if (error.status === 429 && retries < maxRetries) {
          retries++;
          console.log(`API请求受限，第${retries}次重试...`);
          
          // 指数退避策略，等待时间随重试次数增加
          const waitTime = 1000 * Math.pow(2, retries);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          // 其他错误或已达到最大重试次数，抛出错误
          throw error;
        }
      }
    }

    // 处理流式响应
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        // 发送数据到客户端
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }

    // 结束响应
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('API调用失败:', error);
    
    // 如果响应头已经设置为流式传输，需要以流式格式返回错误
    if (res.headersSent || res.getHeader('Content-Type') === 'text/event-stream') {
      res.write(`data: ${JSON.stringify({ error: `API调用失败: ${error.message}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.status(500).json({ error: `API调用失败: ${error.message}` });
    }
  }
});



// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log('修仙人生游戏服务已启动！');
});