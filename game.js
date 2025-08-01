document.addEventListener('DOMContentLoaded', () => {
    const game = {
        state: {},
        elements: {
            eventLog: document.getElementById('event-log'),
            choicesContainer: document.getElementById('choices-container'),
            playerStatus: document.getElementById('player-status'),
            worldStatus: document.getElementById('world-status'),
            saveBtn: document.getElementById('save-btn'),
            loadBtn: document.getElementById('load-btn'),
            exportBtn: document.getElementById('export-btn'),
            importBtn: document.getElementById('import-btn'),
            importFile: document.getElementById('import-file'),
            newStoryBtn: document.getElementById('new-story-btn'),
            historyBtn: document.getElementById('history-btn'),
            referenceBtn: document.getElementById('reference-btn'),
            settingsBtn: document.getElementById('settings-btn'),
            confirmModal: document.getElementById('confirm-modal'),
            settingsModal: document.getElementById('settings-modal'),
            baseUrlInput: document.getElementById('base-url-input'),
            apiKeyInput: document.getElementById('api-key-input'),
            toggleKeyVisibility: document.getElementById('toggle-key-visibility'),
            currentBaseUrl: document.getElementById('current-base-url'),
            currentApiKey: document.getElementById('current-api-key'),
            saveSettingsBtn: document.getElementById('save-settings-btn'),
            testConnectionBtn: document.getElementById('test-connection-btn'),
            cancelSettingsBtn: document.getElementById('cancel-settings-btn'),
            saveAndStartBtn: document.getElementById('save-and-start-btn'),
            directStartBtn: document.getElementById('direct-start-btn'),
            cancelStartBtn: document.getElementById('cancel-start-btn'),
        },

        init() {
            this.setupEventListeners();
            
            // 检查是否有从历史记录页面传来的游戏状态
            const continueGameState = localStorage.getItem('continueGameState');
            if (continueGameState) {
                localStorage.removeItem('continueGameState');
                this.loadFromContinueState(JSON.parse(continueGameState));
            } else {
                this.loadGame(); // 尝试加载已有存档，否则开始新游戏
            }
        },

        // 从继续游戏状态加载
        loadFromContinueState(gameState) {
            // 保存当前的API配置
            const savedState = localStorage.getItem('randomCultivationGameSave');
            let currentApiKey = null;
            let currentBaseUrl = null;
            
            if (savedState) {
                const oldState = JSON.parse(savedState);
                currentApiKey = oldState.apiKey;
                currentBaseUrl = oldState.baseUrl;
            }

            // 恢复游戏状态
            this.state = {
                ...gameState,
                apiKey: currentApiKey,
                baseUrl: currentBaseUrl
            };

            // 确保必要的属性存在
            if (!this.state.storyHistory) {
                this.state.storyHistory = [];
            }
            if (!this.state.gameId) {
                this.state.gameId = Date.now();
            }
            if (!this.state.choices) {
                this.state.choices = [{ text: "继续探索", event: 'explore' }];
            }

            this.elements.eventLog.innerHTML = '';
            this.updateStatus();

            // 重新显示完整的故事历史
            if (this.state.storyHistory && this.state.storyHistory.length > 0) {
                this.state.storyHistory.forEach(entry => {
                    const p = document.createElement('p');
                    p.innerHTML = entry.event;
                    this.elements.eventLog.appendChild(p);
                });
                this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;
            }

            this.renderChoices(this.state.choices);
            this.displayEvent("【系统】游戏进度已从历史记录中恢复，欢迎回到修仙世界。", this.state.choices);
        },

        setupEventListeners() {
            this.elements.newStoryBtn.addEventListener('click', () => this.showNewGameConfirm());
            this.elements.saveBtn.addEventListener('click', () => this.saveGame());
            this.elements.loadBtn.addEventListener('click', () => this.loadGame());
            this.elements.historyBtn.addEventListener('click', () => this.openHistoryPage());
            this.elements.referenceBtn.addEventListener('click', () => this.openReferencePage());
            this.elements.settingsBtn.addEventListener('click', () => this.showSettingsModal());
            this.elements.exportBtn.addEventListener('click', () => this.exportProgress());
            this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
            this.elements.importFile.addEventListener('change', (e) => this.importProgress(e));
            
            // 确认弹窗事件
            this.elements.saveAndStartBtn.addEventListener('click', () => this.confirmNewGame(true));
            this.elements.directStartBtn.addEventListener('click', () => this.confirmNewGame(false));
            this.elements.cancelStartBtn.addEventListener('click', () => this.hideConfirmModal());
            
            // 设置弹窗事件
            this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            this.elements.testConnectionBtn.addEventListener('click', () => this.testConnection());
            this.elements.cancelSettingsBtn.addEventListener('click', () => this.hideSettingsModal());
            this.elements.toggleKeyVisibility.addEventListener('click', () => this.toggleApiKeyVisibility());
            
            // 预设按钮事件
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('preset-btn')) {
                    this.elements.baseUrlInput.value = e.target.dataset.url;
                }
            });
            
            this.elements.choicesContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('choice-button')) {
                    const choiceIndex = parseInt(e.target.dataset.index, 10);
                    this.handleChoice(choiceIndex);
                }
            });
        },

        // 打开历史记录页面
        openHistoryPage() {
            window.location.href = 'history.html';
        },

        // 打开体系参照页面
        openReferencePage() {
            window.location.href = 'reference.html';
        },

        // 显示设置弹窗
        showSettingsModal() {
            this.updateCurrentSettings();
            this.elements.baseUrlInput.value = this.state.baseUrl || '';
            this.elements.apiKeyInput.value = this.state.apiKey || '';
            this.elements.settingsModal.style.display = 'flex';
        },

        // 隐藏设置弹窗
        hideSettingsModal() {
            this.elements.settingsModal.style.display = 'none';
        },

        // 更新当前设置显示
        updateCurrentSettings() {
            this.elements.currentBaseUrl.textContent = this.state.baseUrl || '未设置';
            this.elements.currentApiKey.textContent = this.state.apiKey ? '已设置 (****)' : '未设置';
        },

        // 切换API Key可见性
        toggleApiKeyVisibility() {
            const input = this.elements.apiKeyInput;
            const button = this.elements.toggleKeyVisibility;
            
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        },

        // 保存设置
        saveSettings() {
            const baseUrl = this.elements.baseUrlInput.value.trim();
            const apiKey = this.elements.apiKeyInput.value.trim();

            if (!baseUrl) {
                alert('请输入Base URL');
                return;
            }

            if (!apiKey) {
                alert('请输入API Key');
                return;
            }

            this.state.baseUrl = baseUrl;
            this.state.apiKey = apiKey;
            this.saveGame();
            
            this.hideSettingsModal();
            this.displayEvent("【系统】API设置已保存。");
        },

        // 测试连接
        async testConnection() {
            const baseUrl = this.elements.baseUrlInput.value.trim();
            const apiKey = this.elements.apiKeyInput.value.trim();

            if (!baseUrl || !apiKey) {
                alert('请先填写Base URL和API Key');
                return;
            }

            this.elements.testConnectionBtn.textContent = '测试中...';
            this.elements.testConnectionBtn.disabled = true;

            try {
                const response = await fetch(baseUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: "moonshotai/Kimi-K2-Instruct:novita",
                        messages: [{ role: "user", content: "测试连接" }],
                        max_tokens: 10,
                        response_format: { type: "json_object" },
                    }),
                });

                if (response.ok) {
                    alert('✅ 连接测试成功！');
                } else {
                    alert(`❌ 连接测试失败！状态码: ${response.status}`);
                }
            } catch (error) {
                alert(`❌ 连接测试失败！错误: ${error.message}`);
            } finally {
                this.elements.testConnectionBtn.textContent = '测试连接';
                this.elements.testConnectionBtn.disabled = false;
            }
        },

        async typewriterEffect(element, text, speed = 50) {
            return new Promise(resolve => {
                element.innerHTML = '';
                let i = 0;
                function type() {
                    if (i < text.length) {
                        const char = text.charAt(i);
                        const span = document.createElement('span');
                        span.className = 'typewriter-char';
                        span.textContent = char;
                        element.appendChild(span);
                        i++;
                        setTimeout(type, speed);
                    } else {
                        element.innerHTML = text; // Replace with full text to allow selection
                        resolve();
                    }
                }
                type();
            });
        },

        async displayEvent(text, choices = []) {
            const p = document.createElement('p');
            this.elements.eventLog.appendChild(p);
            await this.typewriterEffect(p, text);
            this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;
            this.renderChoices(choices);
        },

        renderChoices(choices) {
            this.elements.choicesContainer.innerHTML = '';
            if (!choices || choices.length === 0) return;

            choices.forEach((choice, index) => {
                const button = document.createElement('button');
                button.className = 'choice-button';
                button.dataset.index = index;
                button.textContent = choice.text;
                this.elements.choicesContainer.appendChild(button);
            });
        },

        updateStatus() {
            const player = this.state.player;
            const world = this.state.world;
            const attributes = this.state.attributes;
            
            const playerSystem = cultivationSystems.find(s => s.systemName === player.system);
            const rankName = playerSystem.ranks[player.rankIndex].name;

            let playerStatusText = `姓名: ${player.name}\n体系: ${player.system}\n境界: ${rankName}\n年龄: ${player.age}`;
            
            // 如果有属性面板，添加到状态显示中
            if (attributes) {
                playerStatusText += '\n\n【属性面板】';
                Object.entries(attributes).forEach(([key, value]) => {
                    playerStatusText += `\n${key}: ${value}`;
                });
            }

            this.elements.playerStatus.innerText = playerStatusText;
            this.elements.worldStatus.innerText = `地点: ${world.location}\n时期: ${world.era}\n年份: ${world.year}`;
        },

        // 显示新游戏确认弹窗
        showNewGameConfirm() {
            if (this.state.player && this.state.player.name !== "无名者") {
                this.elements.confirmModal.style.display = 'flex';
            } else {
                this.startNewGame();
            }
        },

        // 隐藏确认弹窗
        hideConfirmModal() {
            this.elements.confirmModal.style.display = 'none';
        },

        // 确认新游戏
        async confirmNewGame(shouldSave) {
            this.hideConfirmModal();
            if (shouldSave) {
                this.saveToHistory();
            }
            await this.startNewGame();
        },

        async startNewGame() {
            this.elements.eventLog.innerHTML = '';
            const system = this.getRandomElement(cultivationSystems);
            const locations = ["茅草屋", "山洞", "城市下水道", "皇家图书馆", "粪坑旁", "星际飞船驾驶舱", "断崖之巅"];
            const eras = ["太古洪荒", "上古神话", "中古魔法", "近古武侠", "现代都市", "未来纪元"];

            this.state = {
                player: {
                    name: "无名者",
                    age: 16,
                    system: system.systemName,
                    rankIndex: 0,
                },
                world: {
                    location: this.getRandomElement(locations),
                    era: this.getRandomElement(eras),
                    year: 1,
                },
                choices: [],
                apiKey: null,
                baseUrl: null,
                storyHistory: [],
                gameId: Date.now(),
            };
            
            // Try to load API key from previous save
            const savedState = localStorage.getItem('randomCultivationGameSave');
            if (savedState) {
                const oldState = JSON.parse(savedState);
                if (oldState.apiKey) {
                    this.state.apiKey = oldState.apiKey;
                }
                if (oldState.baseUrl) {
                    this.state.baseUrl = oldState.baseUrl;
                }
            }

            this.updateStatus();
            
            // 生成随机故事开头
            const initialEvent = await this.generateRandomStartEvent();
            const initialChoices = [{ text: "开始探索", event: 'explore' }];
            
            await this.displayEvent(initialEvent, initialChoices);
            this.state.choices = initialChoices;
            this.state.storyHistory.push({
                event: initialEvent,
                choices: initialChoices,
                timestamp: Date.now()
            });
        },

        // 生成随机故事开头
        async generateRandomStartEvent() {
            const { player, world } = this.state;
            
            // 随机生成角色背景
            const backgrounds = {
                出身: ["平民", "贵族", "孤儿", "商人之子", "武者后代", "学者世家", "神秘血脉"],
                金手指: ["系统", "老爷爷", "神秘功法", "特殊体质", "前世记忆", "神器", "无"],
                性格: ["谨慎", "冲动", "聪明", "憨厚", "狡猾", "正直", "冷漠"],
                世界: ["仙侠", "玄幻", "武侠", "都市修仙", "星际修真", "末世求生", "异界"]
            };

            const background = {
                出身: this.getRandomElement(backgrounds.出身),
                金手指: this.getRandomElement(backgrounds.金手指),
                性格: this.getRandomElement(backgrounds.性格),
                世界: this.getRandomElement(backgrounds.世界)
            };

            // 初始化属性
            const attributes = {
                气运: Math.floor(Math.random() * 50) + 25,
                修为: 10,
                声望: 0,
                财富: Math.floor(Math.random() * 100) + 50,
                人脉: Math.floor(Math.random() * 20) + 10
            };

            this.state.background = background;
            this.state.attributes = attributes;

            // 生成故事开头
            const startEvents = [
                `在${world.era}时期的${world.location}，一个${background.出身}出身的少年悄然苏醒。他拥有${background.金手指}的奇遇，性格${background.性格}。命运的齿轮开始转动...`,
                `${world.era}的风云变幻中，${world.location}里诞生了一个注定不凡的存在。${background.出身}的身份，${background.金手指}的机缘，${background.性格}的性情，一切都预示着传奇的开始。`,
                `时值${world.era}，${world.location}中一道身影缓缓睁开双眼。${background.出身}的过往，${background.金手指}的际遇，${background.性格}的本性，将如何书写这个${background.世界}世界的新篇章？`,
                `在这个${background.世界}的世界里，${world.era}时期的${world.location}见证了一个新的开始。一个${background.出身}少年，带着${background.金手指}的秘密，以${background.性格}的态度面对未知的修仙之路。`
            ];

            return this.getRandomElement(startEvents);
        },
        
        handleChoice(index) {
            const choice = this.state.choices[index];
            if (choice && this.eventHandlers[choice.event]) {
                this.eventHandlers[choice.event].call(this);
            }
        },

        eventHandlers: {
            async explore() {
                this.state.player.age += 1;
                this.state.world.year += 1;

                const playerSystem = cultivationSystems.find(s => s.systemName === this.state.player.system);
                const currentRank = playerSystem.ranks[this.state.player.rankIndex];

                // 构建AI生成故事的上下文，包含背景信息
                const prompt = this.createEnhancedAIPrompt(currentRank);
                
                // 显示加载状态
                this.renderChoices([]); // 清空选项
                const p = document.createElement('p');
                this.elements.eventLog.appendChild(p);
                await this.typewriterEffect(p, "命运的齿轮正在转动...");
                this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;

                try {
                    const storyResult = await this.generateAIStory(prompt);
                    
                    // 更新游戏状态和属性
                    this.updateGameStateFromStory(storyResult);
                    
                    if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                        this.state.player.rankIndex++;
                    }
                    
                    this.updateStatus();
                    
                    // 生成新的选择，包含自定义输入选项
                    const choices = this.generateDynamicChoices(storyResult);
                    await this.displayEvent(storyResult.eventText, choices);
                    this.state.choices = choices;

                    // 记录到故事历史
                    this.state.storyHistory.push({
                        event: storyResult.eventText,
                        choices: choices,
                        timestamp: Date.now(),
                        playerState: { ...this.state.player },
                        worldState: { ...this.state.world },
                        attributes: { ...this.state.attributes }
                    });

                    // 自动保存游戏进度
                    this.autoSaveGame();

                } catch (error) {
                    console.error("AI故事生成失败:", error);
                    // AI失败时的降级方案
                    this.fallbackExplore(playerSystem, currentRank);
                }
            },

            async custom_action() {
                const customAction = prompt("请输入你想要进行的行动：");
                if (!customAction || customAction.trim() === '') {
                    this.displayEvent("【系统】你取消了自定义行动。", this.state.choices);
                    return;
                }

                this.state.player.age += 1;
                this.state.world.year += 1;

                const playerSystem = cultivationSystems.find(s => s.systemName === this.state.player.system);
                const currentRank = playerSystem.ranks[this.state.player.rankIndex];

                // 构建包含自定义行动的AI提示
                const prompt_text = this.createCustomActionPrompt(currentRank, customAction);
                
                // 显示加载状态
                this.renderChoices([]);
                const p = document.createElement('p');
                this.elements.eventLog.appendChild(p);
                await this.typewriterEffect(p, `你决定：${customAction}...`);
                this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;

                try {
                    const storyResult = await this.generateAIStory(prompt_text);
                    
                    // 更新游戏状态和属性
                    this.updateGameStateFromStory(storyResult);
                    
                    if (storyResult.breakthrough && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                        this.state.player.rankIndex++;
                    }
                    
                    this.updateStatus();
                    
                    // 生成新的选择
                    const choices = this.generateDynamicChoices(storyResult);
                    await this.displayEvent(storyResult.eventText, choices);
                    this.state.choices = choices;

                    // 记录到故事历史
                    this.state.storyHistory.push({
                        event: `【自定义行动】${customAction}\n\n${storyResult.eventText}`,
                        choices: choices,
                        timestamp: Date.now(),
                        playerState: { ...this.state.player },
                        worldState: { ...this.state.world },
                        attributes: { ...this.state.attributes }
                    });

                    // 自动保存游戏进度
                    this.autoSaveGame();

                } catch (error) {
                    console.error("AI故事生成失败:", error);
                    // 降级方案
                    this.fallbackCustomAction(customAction, playerSystem, currentRank);
                }
            }
        },

        fallbackExplore(playerSystem, currentRank) {
            let text = `(AI连接失败，启用备用事件) 你花了一年时间探索，对【${currentRank.method}】有了更深的理解。`;
            let choices = [{ text: "继续修炼", event: 'explore' }];

            if (Math.random() < 0.3) {
                const otherSystem = this.getRandomElement(cultivationSystems);
                const otherRank = this.getRandomElement(otherSystem.ranks);
                text += `\n你遇到了一个修炼【${otherSystem.systemName}】的【${otherRank.name}】高手，对方似乎对你很感兴趣。`;
            }

            if (Math.random() < 0.2 && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                this.state.player.rankIndex++;
                const newRank = playerSystem.ranks[this.state.player.rankIndex];
                text += `\n\n【机缘】！你成功突破到了【${newRank.name}】境界！`;
            }

            this.updateStatus();
            this.displayEvent(text, choices);
            this.state.choices = choices;

            // 记录到故事历史
            this.state.storyHistory.push({
                event: text,
                choices: choices,
                timestamp: Date.now(),
                playerState: { ...this.state.player },
                worldState: { ...this.state.world }
            });

            // 自动保存游戏进度
            this.autoSaveGame();
        },

        // 增强的AI提示生成，包含背景信息和属性
        createEnhancedAIPrompt(currentRank) {
            const { player, world, storyHistory, background, attributes } = this.state;
            const otherSystem = this.getRandomElement(cultivationSystems);
            const otherRank = this.getRandomElement(otherSystem.ranks);

            // 获取最近的故事上下文
            const recentHistory = storyHistory.slice(-3).map(entry => entry.event).join('\n\n');
            const contextText = recentHistory ? `\n\n最近的故事发展:\n${recentHistory}` : '';

            // 背景信息
            const backgroundText = background ? `
            角色背景:
            - 出身: ${background.出身}
            - 金手指: ${background.金手指}
            - 性格: ${background.性格}
            - 世界类型: ${background.世界}
            ` : '';

            // 属性信息
            const attributesText = attributes ? `
            当前属性:
            ${Object.entries(attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
            ` : '';

            return `
            你是一个充满想象力的网络小说家，擅长创作光怪陆离、充满随机趣味的修仙故事。
            请根据以下设定和故事上下文，生成一段简短（150-200字）的年度经历。

            世界背景:
            - 时期: ${world.era}
            - 当前地点: ${world.location}
            - 修炼年份: 第${world.year}年
            - 这是一个允许任何修炼体系共存的荒诞世界。

            主角信息:
            - 姓名: ${player.name}
            - 年龄: ${player.age}岁
            - 修炼体系: ${player.system}
            - 当前境界: ${currentRank.name}
            - 修炼方式: ${currentRank.method}

            ${backgroundText}
            ${attributesText}

            随机事件元素（必须融入故事）:
            - 你会遇到一个修炼【${otherSystem.systemName}】的【${otherRank.name}】。
            - 随机决定主角今年是否突破，概率大约为20%。
            - 根据角色背景和性格特点安排合适的情节发展。

            ${contextText}

            要求:
            1. 故事必须符合角色的出身、性格和金手指设定。
            2. 情节发展要影响角色属性（气运、声望、修为等）。
            3. 与之前的故事情节保持连贯性。
            4. 以JSON格式返回结果，包含以下字段:
               - "breakthrough": 布尔值，表示是否突破
               - "eventText": 字符串，生成的年度经历故事
               - "attributeChanges": 对象，属性变化（如：{"气运": +10, "声望": -5}）
               - "choices": 数组，3个后续选择的文本
            
            JSON格式示例:
            {
                "breakthrough": false,
                "eventText": "你在修炼时遇到了一位【武侠体系】的【宗师】...",
                "attributeChanges": {"气运": 5, "修为": 2, "声望": -3},
                "choices": ["[1] 向宗师请教武学", "[2] 挑战宗师试试实力", "[3] 默默观察学习"]
            }
            `;
        },

        // 创建自定义行动的AI提示
        createCustomActionPrompt(currentRank, customAction) {
            const { player, world, storyHistory, background, attributes } = this.state;

            // 获取最近的故事上下文
            const recentHistory = storyHistory.slice(-3).map(entry => entry.event).join('\n\n');
            const contextText = recentHistory ? `\n\n最近的故事发展:\n${recentHistory}` : '';

            // 背景信息
            const backgroundText = background ? `
            角色背景:
            - 出身: ${background.出身}
            - 金手指: ${background.金手指}
            - 性格: ${background.性格}
            - 世界类型: ${background.世界}
            ` : '';

            // 属性信息
            const attributesText = attributes ? `
            当前属性:
            ${Object.entries(attributes).map(([key, value]) => `- ${key}: ${value}`).join('\n')}
            ` : '';

            return `
            你是一个充满想象力的网络小说家，擅长创作光怪陆离、充满随机趣味的修仙故事。
            请根据玩家的自定义行动和以下设定，生成一段简短（150-200字）的故事结果。

            世界背景:
            - 时期: ${world.era}
            - 当前地点: ${world.location}
            - 修炼年份: 第${world.year}年

            主角信息:
            - 姓名: ${player.name}
            - 年龄: ${player.age}岁
            - 修炼体系: ${player.system}
            - 当前境界: ${currentRank.name}
            - 修炼方式: ${currentRank.method}

            ${backgroundText}
            ${attributesText}

            玩家的自定义行动: ${customAction}

            ${contextText}

            要求:
            1. 根据玩家的自定义行动生成合理的故事结果。
            2. 故事要符合角色的背景设定和当前情况。
            3. 适当影响角色属性，并有20%概率突破境界。
            4. 以JSON格式返回结果，包含以下字段:
               - "breakthrough": 布尔值，表示是否突破
               - "eventText": 字符串，生成的故事结果
               - "attributeChanges": 对象，属性变化
               - "choices": 数组，3个后续选择的文本
            
            JSON格式示例:
            {
                "breakthrough": false,
                "eventText": "你尝试了这个行动，结果...",
                "attributeChanges": {"气运": 3, "修为": 1},
                "choices": ["[1] 继续这个方向", "[2] 改变策略", "[3] 寻求帮助"]
            }
            `;
        },

        // 自定义行动的降级处理
        fallbackCustomAction(customAction, playerSystem, currentRank) {
            let text = `你尝试了"${customAction}"，虽然过程有些波折，但还是有所收获。`;
            
            // 随机属性变化
            if (this.state.attributes) {
                const attributeKeys = Object.keys(this.state.attributes);
                const randomKey = this.getRandomElement(attributeKeys);
                const change = Math.floor(Math.random() * 10) - 3; // -3到+6的变化
                this.state.attributes[randomKey] = Math.max(0, this.state.attributes[randomKey] + change);
                
                if (change > 0) {
                    text += `\n你的${randomKey}提升了${change}点。`;
                } else if (change < 0) {
                    text += `\n你的${randomKey}下降了${Math.abs(change)}点。`;
                }
            }

            // 20%概率突破
            if (Math.random() < 0.2 && this.state.player.rankIndex < playerSystem.ranks.length - 1) {
                this.state.player.rankIndex++;
                const newRank = playerSystem.ranks[this.state.player.rankIndex];
                text += `\n\n【突破】！在这次行动中，你意外突破到了【${newRank.name}】境界！`;
            }

            this.updateStatus();
            const choices = [
                { text: "[1] 继续探索", event: 'explore', type: 'exploration' },
                { text: "[2] 总结经验", event: 'explore', type: 'reflection' },
                { text: "[3] 寻找新机会", event: 'explore', type: 'opportunity' },
                { text: "[4] 自定义行动", event: 'custom_action', type: 'custom' }
            ];
            
            this.displayEvent(text, choices);
            this.state.choices = choices;

            // 记录到故事历史
            this.state.storyHistory.push({
                event: `【自定义行动】${customAction}\n\n${text}`,
                choices: choices,
                timestamp: Date.now(),
                playerState: { ...this.state.player },
                worldState: { ...this.state.world },
                attributes: { ...this.state.attributes }
            });

            // 自动保存游戏进度
            this.autoSaveGame();
        },

        // 生成动态选择
        generateDynamicChoices(storyResult) {
            const choices = [];
            
            // 添加AI生成的选择
            if (storyResult.choices && storyResult.choices.length > 0) {
                storyResult.choices.forEach(choice => {
                    choices.push({ text: choice, event: 'explore' });
                });
            } else {
                // 默认选择
                choices.push({ text: "[1] 继续探索", event: 'explore' });
                choices.push({ text: "[2] 深入修炼", event: 'explore' });
                choices.push({ text: "[3] 寻找机缘", event: 'explore' });
            }
            
            // 总是添加自定义行动选项
            choices.push({ text: "[自定义] 输入自定义行动", event: 'custom_action' });
            
            return choices;
        },

        // 更新游戏状态
        updateGameStateFromStory(storyResult) {
            if (storyResult.attributeChanges && this.state.attributes) {
                Object.entries(storyResult.attributeChanges).forEach(([key, change]) => {
                    if (this.state.attributes.hasOwnProperty(key)) {
                        this.state.attributes[key] = Math.max(0, this.state.attributes[key] + change);
                    }
                });
            }
        },

        // AI故事生成
        async generateAIStory(prompt) {
            if (!this.state.apiKey || !this.state.baseUrl) {
                throw new Error('API配置未设置');
            }

            const response = await fetch(this.state.baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${this.state.apiKey}`,
                },
                body: JSON.stringify({
                    model: "moonshotai/Kimi-K2-Instruct:novita",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 1000,
                    response_format: { type: "json_object" },
                }),
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            try {
                return JSON.parse(content);
            } catch (error) {
                throw new Error('AI返回的JSON格式无效');
            }
        },

        saveGame() {
            // 确保保存当前的选项
            const gameState = {
                ...this.state,
                choices: this.state.choices || [{ text: "继续探索", event: 'explore' }]
            };
            localStorage.setItem('randomCultivationGameSave', JSON.stringify(gameState));
            this.displayEvent("【系统】游戏已保存。");
        },

        loadGame() {
            const savedState = localStorage.getItem('randomCultivationGameSave');
            if (savedState) {
                this.state = JSON.parse(savedState);
                
                // 确保必要的属性存在
                if (!this.state.storyHistory) {
                    this.state.storyHistory = [];
                }
                if (!this.state.gameId) {
                    this.state.gameId = Date.now();
                }
                if (!this.state.choices) {
                    this.state.choices = [{ text: "继续探索", event: 'explore' }];
                }
                
                this.elements.eventLog.innerHTML = '';
                this.updateStatus();

                // 重新显示完整的故事历史
                if (this.state.storyHistory && this.state.storyHistory.length > 0) {
                    this.state.storyHistory.forEach(entry => {
                        const p = document.createElement('p');
                        p.innerHTML = entry.event;
                        this.elements.eventLog.appendChild(p);
                    });
                    this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;
                }

                // 显示保存的选项
                this.renderChoices(this.state.choices);
                this.displayEvent("【系统】游戏进度已读取，欢迎回到修仙世界。", this.state.choices);
            } else {
                this.startNewGame();
            }
        },

        // 自动保存游戏进度
        autoSaveGame() {
            this.saveGame();
        },

        // 保存到历史记录
        saveToHistory() {
            if (!this.state.player || this.state.player.name === "无名者") {
                return;
            }

            const historyKey = 'cultivationGameHistory';
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            
            const gameRecord = {
                id: this.state.gameId,
                player: { ...this.state.player },
                world: { ...this.state.world },
                storyHistory: [...this.state.storyHistory],
                background: this.state.background,
                attributes: this.state.attributes,
                choices: this.state.choices || [{ text: "继续探索", event: 'explore' }],
                timestamp: Date.now(),
                title: `${this.state.player.name}的修仙之路`
            };

            // 检查是否已存在相同ID的记录
            const existingIndex = history.findIndex(record => record.id === this.state.gameId);
            if (existingIndex !== -1) {
                history[existingIndex] = gameRecord;
            } else {
                history.unshift(gameRecord);
            }

            // 限制历史记录数量
            if (history.length > 50) {
                history.splice(50);
            }

            localStorage.setItem(historyKey, JSON.stringify(history));
        },

        // 导出游戏进度
        exportProgress() {
            const gameData = {
                ...this.state,
                exportTime: new Date().toISOString(),
                version: "1.0"
            };
            
            const dataStr = JSON.stringify(gameData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `修仙存档_${this.state.player.name}_${new Date().toISOString().slice(0, 10)}.json`;
            link.click();
            
            this.displayEvent("【系统】游戏进度已导出。");
        },

        // 导入游戏进度
        importProgress(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const gameData = JSON.parse(e.target.result);
                    
                    // 验证数据完整性
                    if (!gameData.player || !gameData.world) {
                        throw new Error('存档文件格式不正确');
                    }
                    
                    // 保留当前API设置
                    const currentApiKey = this.state.apiKey;
                    const currentBaseUrl = this.state.baseUrl;
                    
                    this.state = {
                        ...gameData,
                        apiKey: currentApiKey,
                        baseUrl: currentBaseUrl
                    };
                    
                    // 确保必要属性存在
                    if (!this.state.choices) {
                        this.state.choices = [{ text: "继续探索", event: 'explore' }];
                    }
                    
                    this.elements.eventLog.innerHTML = '';
                    this.updateStatus();
                    
                    // 重新显示故事历史
                    if (this.state.storyHistory && this.state.storyHistory.length > 0) {
                        this.state.storyHistory.forEach(entry => {
                            const p = document.createElement('p');
                            p.innerHTML = entry.event;
                            this.elements.eventLog.appendChild(p);
                        });
                        this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;
                    }
                    
                    this.renderChoices(this.state.choices);
                    this.displayEvent("【系统】游戏进度已导入。", this.state.choices);
                    
                } catch (error) {
                    alert(`导入失败: ${error.message}`);
                }
            };
            
            reader.readAsText(file);
            event.target.value = ''; // 清空文件输入
        },

        // 工具函数
        getRandomElement(array) {
            return array[Math.floor(Math.random() * array.length)];
        }
    };

    // 初始化游戏
    game.init();
});
