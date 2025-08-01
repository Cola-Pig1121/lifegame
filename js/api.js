// 智能修复被截断的JSON
function repairTruncatedJSON(jsonStr) {
    console.log('原始JSON:', jsonStr);
    
    // 移除末尾的逗号和不完整的内容
    jsonStr = jsonStr.replace(/,\s*$/, '');
    
    // 检查是否在effects对象中被截断
    if (jsonStr.includes('"effects"') && jsonStr.includes('"悟性')) {
        console.log('检测到在effects中被截断');
        
        // 找到最后一个完整的属性
        const effectsMatch = jsonStr.match(/"effects"\s*:\s*\{([^}]*)/);
        if (effectsMatch) {
            let effectsContent = effectsMatch[1];
            
            // 移除不完整的最后一个属性
            const lastCommaIndex = effectsContent.lastIndexOf(',');
            if (lastCommaIndex > 0) {
                effectsContent = effectsContent.substring(0, lastCommaIndex);
            }
            
            // 重新构建effects对象
            const beforeEffects = jsonStr.substring(0, jsonStr.indexOf('"effects"'));
            const afterEffectsStart = jsonStr.indexOf('{', jsonStr.indexOf('"effects"'));
            
            jsonStr = beforeEffects + '"effects": {' + effectsContent + '}';
            
            // 检查是否需要补全choices数组和主对象
            if (!jsonStr.includes('}]')) {
                jsonStr += '}]';
            }
            if (!jsonStr.endsWith('}')) {
                jsonStr += '}';
            }
        }
    }
    // 检查是否在choices数组中被截断
    else if (jsonStr.includes('"choices"') && !jsonStr.includes(']}')) {
        console.log('检测到在choices数组中被截断');
        
        // 找到最后一个完整的choice对象
        const choicesStart = jsonStr.indexOf('[', jsonStr.indexOf('"choices"'));
        if (choicesStart > 0) {
            let choicesContent = jsonStr.substring(choicesStart + 1);
            
            // 移除不完整的最后一个对象
            const lastBraceIndex = choicesContent.lastIndexOf('}');
            if (lastBraceIndex > 0) {
                choicesContent = choicesContent.substring(0, lastBraceIndex + 1);
            }
            
            // 重新构建
            const beforeChoices = jsonStr.substring(0, choicesStart + 1);
            jsonStr = beforeChoices + choicesContent + ']}';
        }
    }
    // 简单的大括号平衡修复
    else {
        console.log('执行简单的大括号平衡修复');
        
        let openBraces = 0;
        let closeBraces = 0;
        
        for (let char of jsonStr) {
            if (char === '{') openBraces++;
            else if (char === '}') closeBraces++;
        }
        
        // 补全缺失的右大括号
        while (closeBraces < openBraces) {
            jsonStr += '}';
            closeBraces++;
        }
    }
    
    console.log('修复后的JSON:', jsonStr);
    return jsonStr;
}

// 将函数暴露到全局作用域，以便其他模块可以访问
window.generateAIStory = async function(prompt, baseUrl, apiKey, model, playerState, userChoice) {
    if (!apiKey || !baseUrl || !model) {
        throw new Error('API配置未设置');
    }

    // 使用提示词模板生成完整提示词
    let fullPrompt = prompt;
    if (window.getPromptTemplate && playerState) {
        fullPrompt = window.getPromptTemplate(
            playerState.name || '修仙者',
            playerState.system || '修真',
            playerState,
            playerState.history || []
        );
    }
    
    // 如果有用户选择，将其添加到提示词中
    if (userChoice) {
        fullPrompt += `\n\n## 用户上一次的选择\n${userChoice}\n`;
    }

    console.log('API调用参数:', { baseUrl, model, promptLength: fullPrompt.length });

    // 创建一个Promise来处理流式响应
    return new Promise(async (resolve, reject) => {
        try {
            // 创建StreamHandler实例
            const streamHandler = new StreamHandler(
                // 处理每个增量内容
                (delta) => {
                    // 收到第一个响应时，更新加载文本
                    if (window.loadingManager && window.loadingManager.isLoading()) {
                        window.loadingManager.updateText('正在接收天机回应...');
                    }
                    // console.log('收到增量内容:', delta);
                },
                // 处理完整内容
                (content) => {
                    // 隐藏加载动画
                    if (window.loadingManager) {
                        window.loadingManager.hide();
                    }
                    
                    console.log('流式响应完整内容:', content);
                
                    if (!content) {
                        reject(new Error('AI返回内容为空'));
                        return;
                    }
                
                    // 解析JSON内容
                    try {
                        // 尝试解析JSON
                        let jsonMatch = content.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            let jsonStr = jsonMatch[0];
                            
                            // 尝试修复常见的JSON截断问题
                            if (!jsonStr.endsWith('}')) {
                                console.log('检测到JSON可能被截断，尝试修复...');
                                
                                // 智能修复JSON截断
                                jsonStr = repairTruncatedJSON(jsonStr);
                            }
                            
                            // 移除数字值前面的加号，修复无效的JSON
                            jsonStr = jsonStr.replace(/:\s*\+(\d+)/g, ': $1');

                            console.log('修复后的JSON:', jsonStr);
                            const parsed = JSON.parse(jsonStr);
                            console.log('解析的JSON:', parsed);
                            
                            // 验证必要字段
                            if (!parsed.story) {
                                parsed.story = "探索过程中发生了一些意外...";
                            }
                            if (!parsed.choices || !Array.isArray(parsed.choices)) {
                                parsed.choices = [
                                    { text: "继续探索", effects: { "修为": 2 } },
                                    { text: "休息片刻", effects: { "体质": 1 } },
                                    { text: "查看状态", effects: {} }
                                ];
                            }
                            
                            resolve(parsed);
                        } else {
                            // 如果没有找到JSON，创建一个默认的响应
                            console.log('未找到JSON格式，使用默认格式');
                            resolve({
                                story: content,
                                choices: [
                                    { text: "继续探索", effects: { "修为": 2 } },
                                    { text: "休息片刻", effects: { "体质": 1 } },
                                    { text: "查看状态", effects: {} }
                                ]
                            });
                        }
                    } catch (error) {
                        console.error('JSON解析失败:', error, '原始内容:', content);
                        // 返回一个默认的响应而不是抛出错误
                        resolve({
                            story: content || "探索过程中发生了一些意外...",
                            choices: [
                                { text: "继续探索", effects: { "修为": 2 } },
                                { text: "休息片刻", effects: { "体质": 1 } },
                                { text: "查看状态", effects: {} }
                            ]
                        });
                    }
                },
                // 处理错误
                (error) => {
                    console.error('流式API调用失败:', error);
                    reject(new Error(`API调用失败: ${error.message}`));
                }
            );

        // 开始处理流
        streamHandler.handleStream(fullPrompt, baseUrl, apiKey, model);
        } catch (error) {
            console.error('初始化流处理器失败:', error);
            if (window.loadingManager) {
                window.loadingManager.hide();
            }
            reject(new Error(`初始化失败: ${error.message}`));
        }
    });
}

// 将测试连接函数暴露到全局作用域
window.testConnection = async function(baseUrl, apiKey, model) {
    if (!baseUrl || !apiKey || !model) {
        throw new Error('请先填写Base URL、选择模型和API Key');
    }

    // 使用StreamHandler进行连接测试
    const streamHandler = new StreamHandler();
    return streamHandler.testConnection(baseUrl, apiKey, model);
};
