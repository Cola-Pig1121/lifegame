// Main event handler router
async function handleChoice(index, game) {
    // 保存选择索引，供后续使用
    game.lastChoiceIndex = index;
    const choice = game.state.choices[index];
    if (choice && eventHandlers[choice.event]) {
        await eventHandlers[choice.event].call(game);
    }
}

// Specific event handlers
const eventHandlers = {
    // 婚姻事件处理器
    async encounter_romance() {
        const encounterMessage = `在${this.state.world.location}，你邂逅了一位让你心动的修士...`;
        await displayEvent(this.elements, encounterMessage, [
            { text: "主动搭讪", event: 'romance_proposal', effects: { 魅力: +2, 情缘: +5 } },
            { text: "暗中观察", event: 'romance_proposal', effects: { 悟性: +1, 情缘: +2 } },
            { text: "转身离开", event: 'explore', effects: { 气运: -1 } }
        ]);
    },

    async romance_proposal() {
        const choiceIndex = this.lastChoiceIndex || 0;
        const choice = this.state.choices[choiceIndex];
        
        if (this.state.player.charm >= 50 && this.state.player.romance >= 30) {
            await displayEvent(this.elements, "对方接受了你的提亲！你们决定结为道侣。", [
                { text: "举行双修大典", event: 'dual_cultivation' },
                { text: "先培养感情", event: 'explore', effects: { 情缘: +10 } }
            ]);
        } else {
            await displayEvent(this.elements, "对方婉拒了你，表示需要更多时间了解。", [
                { text: "继续努力追求", event: 'romance_proposal', effects: { 魅力: +1 } },
                { text: "放弃追求", event: 'explore' }
            ]);
        }
    },

    async dual_cultivation() {
        const partnerName = "道侣" + (Math.random() > 0.5 ? "仙子" : "真人");
        const cultivationGain = Math.floor(Math.random() * 20) + 10;
        
        this.state.attributes.修为 += cultivationGain;
        this.state.player.romance += 15;
        
        await displayEvent(this.elements, 
            `与${partnerName}双修后，你们的修为都有所精进，感情也更加深厚。`, 
            [
                { text: "继续双修", event: 'dual_cultivation', effects: { 修为: +10, 情缘: +5 } },
                { text: "考虑孕育子嗣", event: 'have_child' },
                { text: "外出历练", event: 'explore' }
            ]
        );
        
        updateStatus(this.elements, this.state);
    },

    async have_child() {
        const childGender = Math.random() > 0.5 ? "男婴" : "女婴";
        const childTalent = Math.floor(Math.random() * 100) + 1;
        
        const childMessage = `你们迎来了爱情的结晶——一个天赋${childTalent > 80 ? '极佳' : childTalent > 50 ? '尚可' : '普通'}的${childGender}！`;
        
        this.state.player.children = this.state.player.children || [];
        this.state.player.children.push({
            gender: childGender,
            talent: childTalent,
            age: 0
        });
        
        await displayEvent(this.elements, childMessage, [
            { text: "悉心培养子嗣", event: 'explore', effects: { 声望: +5 } },
            { text: "继续与道侣游历", event: 'dual_cultivation' }
        ]);
        
        updateStatus(this.elements, this.state);
    },

    // 奇遇事件处理器
    async encounter_treasure() {
        const treasures = [
            { name: "神秘玉简", effect: { 悟性: 8, 修为: 12 } },
            { name: "上古丹药", effect: { 体质: 10, 修为: 15 } },
            { name: "灵石矿脉", effect: { 财富: 20, 声望: 5 } }
        ];
        const treasure = treasures[Math.floor(Math.random() * treasures.length)];
        
        await displayEvent(this.elements, 
            `你在${this.state.world.location}意外发现【${treasure.name}】！`, [
            { text: "立即炼化", event: 'apply_effects', effects: treasure.effect },
            { text: "谨慎研究", event: 'explore', effects: { 悟性: 3 } },
            { text: "上缴宗门", event: 'explore', effects: { 声望: 10, 人脉: 5 } }
        ]);
    },

    async encounter_master() {
        const masters = [
            { name: "云游子", specialty: "剑修", effect: { 修为: 10, 声望: 8 } },
            { name: "丹辰子", specialty: "炼丹师", effect: { 体质: 8, 财富: 12 } },
            { name: "玄机老人", specialty: "阵法师", effect: { 悟性: 15, 气运: 5 } }
        ];
        const master = masters[Math.floor(Math.random() * masters.length)];
        
        await displayEvent(this.elements, 
            `你遇到了隐世高人【${master.name}】(${master.specialty})，他对你似乎很感兴趣...`, [
            { text: "拜师求教", event: 'apply_effects', effects: master.effect },
            { text: "切磋交流", event: 'explore', effects: { 修为: 5, 人脉: 3 } },
            { text: "婉言谢绝", event: 'explore', effects: { 气运: 2 } }
        ]);
    },

    async encounter_danger() {
        const dangers = [
            { name: "妖兽袭击", penalty: { 体质: -5, 修为: -3 } },
            { name: "心魔入侵", penalty: { 悟性: -3, 气运: -5 } },
            { name: "宗门试炼", penalty: { 声望: -10, 人脉: -5 } }
        ];
        const danger = dangers[Math.floor(Math.random() * dangers.length)];
        
        await displayEvent(this.elements, 
            `突然遭遇【${danger.name}】！情况十分危急！`, [
            { text: "全力应战", event: 'apply_effects', effects: danger.penalty },
            { text: "智取化解", event: 'explore', effects: { 悟性: 5 } },
            { text: "遁逃保命", event: 'explore', effects: { 气运: -2 } }
        ]);
    },

// 开始探索事件处理器
    async start_explore() {
        const startMessage = `游戏开始。你的名字是${this.state.player.name}，你选择的修炼体系是【${this.state.player.system}】。你踏出了修仙之路的第一步...`;
        await displayEvent(this.elements, startMessage, []);
        
        // 保存开始探索的事件到历史记录
        this.state.storyHistory.push({
            event: startMessage,
            choices: [],
            timestamp: Date.now(),
            playerState: { ...this.state.player },
            worldState: { ...this.state.world },
            attributes: { ...this.state.attributes }
        });
        
        // 开始真正的探索
        await eventHandlers.explore.call(this);
    },

    // 应用属性变化的事件处理器
    async apply_effects() {
        // 防止重复点击
        if (this.state.processingChoice) {
            return;
        }
        this.state.processingChoice = true;
        
        // 禁用所有选项按钮
        const choiceButtons = document.querySelectorAll('.choice-btn');
        choiceButtons.forEach(btn => btn.disabled = true);
        
        try {
            const choiceIndex = this.lastChoiceIndex || 0;
            const choice = this.state.choices[choiceIndex];
            
            if (choice && choice.effects) {
                // 记录选择的effects，但不立即应用
                this.state.pendingEffects = choice.effects;
                this.state.pendingChoiceText = choice.text;
                
                // 直接继续探索，等待AI回复后再应用属性变化
                await eventHandlers.explore.call(this, choice.text);
                
            } else {
                // 如果没有属性变化，直接继续探索
                await eventHandlers.explore.call(this, choice ? choice.text : undefined);
            }
        } finally {
            // 恢复状态
            this.state.processingChoice = false;
        }
    },

    async explore(userChoice) {
        this.state.player.age += 1;
        this.state.world.year += 1;

        const playerSystem = cultivationSystems.find(s => s.systemName === this.state.player.system);
        const currentRank = playerSystem.ranks[this.state.player.rankIndex];
        
        // 使用prompt-template.js中的提示词模板
        let prompt;
        if (window.getPromptTemplate) {
            const playerStateForPrompt = {
                ...this.state.player,
                level: currentRank.name,
                attributes: this.state.attributes || {}
            };
            prompt = window.getPromptTemplate(
                this.state.player.name,
                this.state.player.system,
                playerStateForPrompt,
                this.state.storyHistory.map(h => h.event),
                this.state.world.location || '未知之地', // 传递地点信息
                this.state.world.year || '开元之年'      // 传递年份信息
            );
        } else {
            // 如果找不到prompt-template.js，回退到原来的提示词
            prompt = createEnhancedAIPrompt(this.state, currentRank);
        }

        // 如果有用户选择，将其添加到提示词中
        if (userChoice) {
            prompt += `\n\n## 用户上一次的选择\n${userChoice}\n`;
        }

        try {
            // 在这里添加加载动画
            if (window.loadingManager) {
                window.loadingManager.show('正在感应天机变化...', 60000); // 显示加载动画，最长60秒
                window.loadingManager.updateText('正在沟通冥冥之中的大道...');
            }

            // 等待30秒后再发送请求
            await new Promise(resolve => setTimeout(resolve, 30000));

            const storyResult = await generateAIStory(
                prompt,
                this.state.baseUrl,
                this.state.apiKey,
                this.state.model
            );

            // 成功后隐藏加载动画
            if (window.loadingManager) {
                window.loadingManager.hide();
            }

            // 如果AI回复成功，先应用之前记录的属性变化
            if (this.state.pendingEffects) {
                await eventHandlers.applyPendingEffects.call(this);
            }

            updateGameStateFromStory(this.state, storyResult);

            if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                this.state.player.rankIndex++;
            }

            updateStatus(this.elements, this.state);

            // 检查是否触发奇遇
            const ADVENTURE_CHANCE = 0.15;
            let choices = [];
            if (Math.random() < ADVENTURE_CHANCE) {
                await this.triggerAdventureEvent();
                choices = this.state.choices || [];
            } else {
                choices = generateDynamicChoices(storyResult, this.state);
                this.state.choices = choices;

                // 先显示事件文本和选项，并显示重试按钮
                await displayEvent(this.elements, storyResult.story || storyResult.eventText, choices, true);
            }

            this.state.storyHistory.push({
                event: storyResult.story || storyResult.eventText,
                choices: choices,
                timestamp: Date.now(),
                playerState: { ...this.state.player },
                worldState: { ...this.state.world },
                attributes: { ...this.state.attributes }
            });

            // 延迟保存，避免覆盖用户正在查看的选项框
            this.scheduleAutoSave();
        } catch (error) {
            console.error('AI回复失败:', error);
            // 如果AI回复失败，重新显示选项但不修改属性
            if (this.state.choices && this.state.choices.length > 0) {
                await displayEvent(this.elements, "【系统】连接失败，请重新选择：", this.state.choices, true);
            }
        }
    },

    // 应用待处理的属性变化
    async applyPendingEffects() {
        if (!this.state.pendingEffects) return;
        
        // 先隐藏所有选项按钮
        this.elements.choicesContainer.innerHTML = '';
        
        const changes = [];
        Object.entries(this.state.pendingEffects).forEach(([attribute, change]) => {
            if (this.state.attributes && this.state.attributes.hasOwnProperty(attribute)) {
                const oldValue = this.state.attributes[attribute];
                this.state.attributes[attribute] = Math.max(0, oldValue + change);
                
                // 记录变化
                const changeText = change > 0 ? `+${change}` : `${change}`;
                changes.push(`${attribute}: ${oldValue} → ${this.state.attributes[attribute]} (${changeText})`);
            }
        });
        
        // 更新状态显示
        updateStatus(this.elements, this.state);
        
        // 显示属性变化结果
        if (changes.length > 0) {
            const effectsText = `【属性变化】\n${changes.join('\n')}`;
            // 保存到历史记录
            this.state.storyHistory.push({
                event: effectsText,
                choices: [],
                timestamp: Date.now(),
                playerState: { ...this.state.player },
                worldState: { ...this.state.world },
                attributes: { ...this.state.attributes }
            });
            // 在主窗口显示属性变化
            await displayEvent(this.elements, effectsText, []);
        }
        
        // 清除待处理的效果
        this.state.pendingEffects = null;
        this.state.pendingChoiceText = null;
    },

    async triggerAdventureEvent() {
        if (window.contextAdventureSystem && window.contextAdventureSystem.initialized) {
            // 使用上下文感知系统
            await window.contextAdventureSystem.forceCheck();
        } else {
            // 使用传统奇遇管理器
            if (window.contextAdventureManager) {
                const result = await window.contextAdventureManager.shouldTriggerAdventure();
                if (result.shouldTrigger) {
                    await window.contextAdventureManager.triggerSelectedAdventure(result.selectedAdventure);
                    return;
                }
            }
            
            // 回退到随机奇遇
            const adventureKeys = Object.keys(adventureHandlers);
            const randomAdventure = adventureKeys[Math.floor(Math.random() * adventureKeys.length)];
            await adventureHandlers[randomAdventure].call(this);
        }
    },

        async custom_action() {
            const customAction = prompt("请输入你想要进行的行动：");
            if (!customAction || customAction.trim() === '') {
                await displayEvent(this.elements, "【系统】你取消了自定义行动。", this.state.choices);
                return;
            }

            this.state.player.age += 1;
            this.state.world.year += 1;

            const playerSystem = cultivationSystems.find(s => s.systemName === this.state.player.system);
            const currentRank = playerSystem.ranks[this.state.player.rankIndex];
            
            // 使用prompt-template.js中的提示词模板
            let prompt_text;
            if (window.getPromptTemplate) {
                const playerStateForPrompt = {
                    ...this.state.player,
                    level: currentRank.name,
                    attributes: this.state.attributes || {}
                };
                prompt_text = window.getPromptTemplate(
                    this.state.player.name,
                    this.state.player.system,
                    playerStateForPrompt,
                    this.state.storyHistory.map(h => h.event),
                    this.state.world.location || '未知之地', // 传递地点信息
                    this.state.world.year || '开元之年'      // 传递年份信息
                );
                
                // 添加用户自定义行动到提示词
                prompt_text += `\n\n## 用户行动\n${customAction}`;
            } else {
                // 如果找不到prompt-template.js，回退到原来的提示词
                prompt_text = createCustomActionPrompt(this.state, currentRank, customAction);
            }
            
            try {
                // 在这里添加加载动画
                if (window.loadingManager) {
                    window.loadingManager.show('正在感应天机变化...', 60000); // 显示加载动画，最长60秒
                    window.loadingManager.updateText('正在沟通冥冥之中的大道...');
                }

                // 等待30秒后再发送请求
                await new Promise(resolve => setTimeout(resolve, 30000));

                const storyResult = await generateAIStory(
                    prompt_text,
                    this.state.baseUrl,
                    this.state.apiKey,
                    this.state.model
                );

                // 成功后隐藏加载动画
                if (window.loadingManager) {
                    window.loadingManager.hide();
                }

                updateGameStateFromStory(this.state, storyResult);

                if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                    this.state.player.rankIndex++;
                }

                updateStatus(this.elements, this.state);

                const choices = generateDynamicChoices(storyResult, this.state);
                this.state.choices = choices;

                // 先显示事件文本和选项，并显示重试按钮
                await displayEvent(this.elements, storyResult.story || storyResult.eventText, choices, true);

                this.state.storyHistory.push({
                    event: `【自定义行动】${customAction}\n\n${storyResult.story || storyResult.eventText}`,
                    choices: choices,
                    timestamp: Date.now(),
                    playerState: { ...this.state.player },
                    worldState: { ...this.state.world },
                    attributes: { ...this.state.attributes }
                });

                // 延迟保存，避免覆盖用户正在查看的选项框
                this.scheduleAutoSave();
            } catch (error) {
                console.error("AI故事生成失败:", error);
                // 停止加载动画
                if (window.loadingManager) {
                    window.loadingManager.hide();
                }
                // 弹出提示
                alert(`天机感应失败，似乎与上界的连接中断了。\n错误: ${error.message}\n\n请检查网络或API设置后重试。`);
                
                // 恢复之前的事件和选项，让用户可以重试
                const lastEvent = this.state.storyHistory.length > 0 ? this.state.storyHistory[this.state.storyHistory.length - 1].event : "你站在原地，不知何去何从。";
                await displayEvent(this.elements, lastEvent, this.state.choices);
            }
        },


    async triggerAdventureEvent() {
        // 优先使用上下文感知奇遇系统
        if (window.contextAdventureManager) {
            const result = await window.contextAdventureManager.shouldTriggerAdventure();
            if (result.shouldTrigger) {
                await window.contextAdventureManager.triggerSelectedAdventure(result.selectedAdventure);
                return;
            }
        }
        
        // 回退到随机奇遇
        const adventureEvents = ['encounter_treasure', 'encounter_master', 'encounter_danger'];
        const randomAdventure = adventureEvents[Math.floor(Math.random() * adventureEvents.length)];
        await eventHandlers[randomAdventure].call(this);
    }
};

// Helper functions for events
function createEnhancedAIPrompt(state, currentRank) {
    const { player, storyHistory } = state;
    const lastEvent = storyHistory.length > 0 ? storyHistory[storyHistory.length - 1].event : '';
    
    return `修仙故事生成器。角色：${player.name}，功法：${currentRank.name}(${currentRank.method})。
上次：${lastEvent}

生成50字故事+3选项，JSON格式：
{
  "story": "50字故事",
  "choices": [
    {
      "text": "选项1",
      "effects": {
        "修为": ±1~15,
        "气运": ±1~10,
        "体质": ±1~10,
        "悟性": ±1~10,
        "财富": ±1~10,
        "人脉": ±1~10,
        "声望": ±1~10
      }
    }
  ]
}`;
}

function createCustomActionPrompt(state, currentRank, customAction) {
    const { player, storyHistory } = state;
    const lastEvent = storyHistory.length > 0 ? storyHistory[storyHistory.length - 1].event : '';
    
    return `修仙故事生成器。角色：${player.name}，功法：${currentRank.name}(${currentRank.method})。
上次：${lastEvent}
玩家行动：${customAction}

生成50字故事+3选项，JSON格式：
{
  "story": "50字故事",
  "choices": [
    {
      "text": "选项1",
      "effects": {
        "修为": ±1~15,
        "气运": ±1~10,
        "体质": ±1~10,
        "悟性": ±1~10,
        "财富": ±1~10,
        "人脉": ±1~10,
        "声望": ±1~10
      }
    }
  ]
}`;
}

function generateDynamicChoices(storyResult, state) {
    const choices = [];
    if (storyResult.choices && storyResult.choices.length > 0) {
        storyResult.choices.forEach((choice, index) => {
            // 处理新格式的选项（包含effects字段）
            if (typeof choice === 'object' && choice.text) {
                choices.push({ 
                    text: choice.text, 
                    event: 'apply_effects',
                    effects: choice.effects || {}
                });
            } else {
                // 兼容旧格式的选项（纯文本）
                choices.push({ text: choice, event: 'explore' });
            }
        });
    } else {
        choices.push({ text: "[1] 继续探索", event: 'explore' });
        choices.push({ text: "[2] 深入修炼", event: 'explore' });
        choices.push({ text: "[3] 寻找机缘", event: 'explore' });
    }
    choices.push({ text: "[自定义] 输入自定义行动", event: 'custom_action' });
    
    // 随机添加婚姻相关选项
    if (state && state.marriage) {
        if (Math.random() < 0.3 && state.marriage.status === 'single') {
            choices.unshift({ text: "[机缘] 邂逅道侣", event: 'encounter_romance' });
        } else if (state.marriage.status === 'married' && state.player.romance >= 50 && Math.random() < 0.2) {
            choices.unshift({ text: "[情缘] 与道侣双修", event: 'dual_cultivation' });
        }
    }
    
    return choices;
}

function updateGameStateFromStory(state, storyResult) {
    if (storyResult.attributeChanges && state.attributes) {
        Object.entries(storyResult.attributeChanges).forEach(([key, change]) => {
            if (state.attributes.hasOwnProperty(key)) {
                state.attributes[key] = Math.max(0, state.attributes[key] + change);
            }
        });
    }
}