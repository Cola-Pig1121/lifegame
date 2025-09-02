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
                            
                            // 检查是否是错误消息
                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                            
                            const delta = parsed.delta || '';
                            this.content += delta;
                            this.onDelta(delta);
                        } catch (e) {
                            // 如果是错误对象，抛出错误
                            if (e.message && e.message !== 'Unexpected token') {
                                throw e;
                            }
                            // 否则忽略解析错误，继续处理下一行
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


}

// 导出流处理器
window.StreamHandler = StreamHandler;