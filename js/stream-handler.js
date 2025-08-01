// 流式响应处理器
class StreamHandler {
    constructor(onDelta, onComplete, onError) {
        this.content = '';
        this.onDelta = onDelta || ((delta) => {});
        this.onComplete = onComplete || ((content) => {});
        this.onError = onError || ((error) => {});
    }

    // 处理流式响应
    async handleStream(prompt, baseUrl, apiKey, model) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt,
                    baseUrl,
                    apiKey,
                    model
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} - ${errorText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        
                        if (data === '[DONE]') {
                            // 流式响应结束
                            this.onComplete(this.content);
                            return;
                        }

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.delta || '';
                            this.content += delta;
                            this.onDelta(delta);
                        } catch (e) {
                            // 忽略解析错误，继续处理下一行
                            console.log('跳过无效的JSON行:', data);
                        }
                    }
                }
            }

            // 确保在流结束时调用完成回调
            this.onComplete(this.content);
        } catch (error) {
            console.error('流式处理失败:', error);
            this.onError(error);
        }
    }

    // 测试连接
    async testConnection(baseUrl, apiKey, model) {
        try {
            console.log('开始测试连接:', { baseUrl, model });
            
            const response = await fetch('/api/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    baseUrl,
                    apiKey,
                    model
                })
            });

            // 无论响应状态如何，都尝试解析JSON
            const responseText = await response.text();
            console.log('测试连接响应:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('解析响应JSON失败:', e);
                throw new Error(`无法解析服务器响应: ${responseText}`);
            }
            
            if (!response.ok) {
                const errorMessage = result.error || `连接测试失败！状态码: ${response.status}`;
                throw new Error(errorMessage);
            }

            return result;
        } catch (error) {
            console.error('连接测试失败:', error);
            throw error;
        }
    }
}

// 导出流处理器
window.StreamHandler = StreamHandler;