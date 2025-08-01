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

async function generateAIStory(prompt, baseUrl, apiKey, model) {
    if (!apiKey || !baseUrl || !model) {
        throw new Error('API配置未设置');
    }

    console.log('API调用参数:', { baseUrl, model, promptLength: prompt.length });

    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt + "\n\n请以JSON格式返回结果，包含story和choices字段。确保JSON格式完整，不要截断。" }],
            max_tokens: 2000,
            temperature: 0.7,
            stream: false
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API请求失败:', response.status, errorText);
        throw new Error(`API请求失败: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('API返回数据:', data);
    
    // 检查不同的响应格式
    let content = null;
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        // OpenAI格式
        content = data.choices[0].message.content;
    } else if (data.choices && data.choices[0] && data.choices[0].text) {
        // 某些API的格式
        content = data.choices[0].text;
    } else if (data.response) {
        // 另一种格式
        content = data.response;
    } else if (data.output) {
        // ModelScope格式
        content = data.output.text || data.output;
    } else if (data.text) {
        // 简单格式
        content = data.text;
    }
    
    if (!content) {
        console.error('无法从API响应中提取内容:', data);
        throw new Error('AI返回内容为空或格式不正确');
    }
    
    console.log('提取的内容:', content);
    
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
            
            return parsed;
        } else {
            // 如果没有找到JSON，创建一个默认的响应
            console.log('未找到JSON格式，使用默认格式');
            return {
                story: content,
                choices: [
                    { text: "继续探索", effects: { "修为": 2 } },
                    { text: "休息片刻", effects: { "体质": 1 } },
                    { text: "查看状态", effects: {} }
                ]
            };
        }
    } catch (error) {
        console.error('JSON解析失败:', error, '原始内容:', content);
        // 返回一个默认的响应而不是抛出错误
        return {
            story: content || "探索过程中发生了一些意外...",
            choices: [
                { text: "继续探索", effects: { "修为": 2 } },
                { text: "休息片刻", effects: { "体质": 1 } },
                { text: "查看状态", effects: {} }
            ]
        };
    }
}

async function testConnection(baseUrl, apiKey, model) {
    if (!baseUrl || !apiKey || !model) {
        throw new Error('请先填写Base URL、选择模型和API Key');
    }

    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "你好，这是一个连接测试。" }],
            max_tokens: 50,
        }),
    });

    return response;
}