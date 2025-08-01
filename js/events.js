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
        const choiceIndex = this.lastChoiceIndex || 0;
        const choice = this.state.choices[choiceIndex];
        
        if (choice && choice.effects) {
            // 应用属性变化
            const changes = [];
            Object.entries(choice.effects).forEach(([attribute, change]) => {
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
                    choices: [], // No choices here
                    timestamp: Date.now(),
                    playerState: { ...this.state.player },
                    worldState: { ...this.state.world },
                    attributes: { ...this.state.attributes }
                });
                // 在主窗口显示属性变化，然后再继续
                await displayEvent(this.elements, effectsText, []);
            }
            
            // 直接继续探索，而不是显示新选项
            await eventHandlers.explore.call(this, choice.text);
            
        } else {
            // 如果没有属性变化，直接继续探索
            await eventHandlers.explore.call(this, choice ? choice.text : undefined);
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
                this.state.world.location, // Pass location
                this.state.world.year      // Pass year
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
            // 在这里添加加载动画和等待
            if (window.loadingManager) {
                await window.loadingManager.show('正在感应天机变化...', 30000); // 等待30秒
                window.loadingManager.updateText('正在沟通冥冥之中的大道...');
            }

            const storyResult = await generateAIStory(
                prompt, 
                this.state.baseUrl, 
                this.state.apiKey, 
                this.state.model
            );
            
            updateGameStateFromStory(this.state, storyResult);
            
            if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                this.state.player.rankIndex++;
            }
            
            updateStatus(this.elements, this.state);
            
            const choices = generateDynamicChoices(storyResult);
            this.state.choices = choices;
            
            // 先显示事件文本和选项
            await displayEvent(this.elements, storyResult.story || storyResult.eventText, choices);

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
            console.error("AI故事生成失败:", error);
            fallbackExplore.call(this, playerSystem, currentRank);
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
                this.state.world.location, // Pass location
                this.state.world.year      // Pass year
            );
            
            // 添加用户自定义行动到提示词
            prompt_text += `\n\n## 用户行动\n${customAction}`;
        } else {
            // 如果找不到prompt-template.js，回退到原来的提示词
            prompt_text = createCustomActionPrompt(this.state, currentRank, customAction);
        }
        
        try {
            // 在这里添加加载动画和等待
            if (window.loadingManager) {
                await window.loadingManager.show('正在感应天机变化...', 30000); // 等待30秒
                window.loadingManager.updateText('正在沟通冥冥之中的大道...');
            }
            
            const storyResult = await generateAIStory(
                prompt_text, 
                this.state.baseUrl, 
                this.state.apiKey, 
                this.state.model
            );
            
            updateGameStateFromStory(this.state, storyResult);
            
            if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                this.state.player.rankIndex++;
            }
            
            updateStatus(this.elements, this.state);
            
            const choices = generateDynamicChoices(storyResult);
            this.state.choices = choices;
            
            // 先显示事件文本和选项
            await displayEvent(this.elements, storyResult.story || storyResult.eventText, choices);

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
            fallbackCustomAction.call(this, customAction, playerSystem, currentRank);
        }
    }
};

// Helper functions for events
function fallbackExplore(playerSystem, currentRank) {
    let text = `(AI连接失败，启用备用事件) 你花了一年时间探索，对【${currentRank.method}】有了更深的理解。`;
    let choices = [{ text: "继续修炼", event: 'explore' }];

    if (Math.random() < 0.3) {
        const otherSystem = getRandomElement(cultivationSystems);
        const otherRank = getRandomElement(otherSystem.ranks);
        text += `\n你遇到了一个修炼【${otherSystem.systemName}】的【${otherRank.name}】高手，对方似乎对你很感兴趣。`;
    }

    if (Math.random() < 0.2 && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
        this.state.player.rankIndex++;
        const newRank = playerSystem.ranks[this.state.player.rankIndex];
        text += `\n\n【机缘】！你成功突破到了【${newRank.name}】境界！`;
    }

    updateStatus(this.elements, this.state);
    displayEvent(this.elements, text, choices);
    this.state.choices = choices;

    this.state.storyHistory.push({
        event: text,
        choices: choices,
        timestamp: Date.now(),
        playerState: { ...this.state.player },
        worldState: { ...this.state.world }
    });

    // 延迟保存，避免覆盖用户正在查看的选项框
    this.scheduleAutoSave();
}

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

function fallbackCustomAction(customAction, playerSystem, currentRank) {
    let text = `你尝试了"${customAction}"，虽然过程有些波折，但还是有所收获。`;
    if (this.state.attributes) {
        const attributeKeys = Object.keys(this.state.attributes);
        const randomKey = getRandomElement(attributeKeys);
        const change = Math.floor(Math.random() * 10) - 3;
        this.state.attributes[randomKey] = Math.max(0, this.state.attributes[randomKey] + change);
        if (change > 0) text += `\n你的${randomKey}提升了${change}点。`;
        else if (change < 0) text += `\n你的${randomKey}下降了${Math.abs(change)}点。`;
    }
    if (Math.random() < 0.2 && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
        this.state.player.rankIndex++;
        const newRank = playerSystem.ranks[this.state.player.rankIndex];
        text += `\n\n【突破】！在这次行动中，你意外突破到了【${newRank.name}】境界！`;
    }
    updateStatus(this.elements, this.state);
    const choices = [
        { text: "[1] 继续探索", event: 'explore' },
        { text: "[2] 总结经验", event: 'explore' },
        { text: "[3] 寻找新机会", event: 'explore' },
        { text: "[4] 自定义行动", event: 'custom_action' }
    ];
    displayEvent(this.elements, text, choices);
    this.state.choices = choices;
    this.state.storyHistory.push({
        event: `【自定义行动】${customAction}\n\n${text}`,
        choices: choices,
        timestamp: Date.now(),
        playerState: { ...this.state.player },
        worldState: { ...this.state.world },
        attributes: { ...this.state.attributes }
    });
    // 延迟保存，避免覆盖用户正在查看的选项框
    this.scheduleAutoSave();
}

function generateDynamicChoices(storyResult) {
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