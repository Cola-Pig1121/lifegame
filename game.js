// 所有模块现在都作为全局变量加载，无需导入

document.addEventListener('DOMContentLoaded', () => {
    const game = {
        elements: getElementsById(elementIds),
        state: {},

        async init() {
            this.setupEventListeners();
            this.autoSaveTimer = null; // 添加自动保存定时器
            
            const continueGameState = localStorage.getItem('continueGameState');
            if (continueGameState) {
                localStorage.removeItem('continueGameState');
                this.loadFromContinueState(JSON.parse(continueGameState));
            } else {
                const loadedState = loadGame();
                if (loadedState && loadedState.player) {
                    // 有完整的游戏状态
                    this.state = loadedState;
                    this.fullDisplayUpdate();
                    await displayEvent(this.elements, "【系统】游戏进度已读取，欢迎回到修仙世界。", this.state.choices);
                } else if (loadedState && loadedState.baseUrl && loadedState.apiKey) {
                    // 只有API配置，没有游戏进度
                    this.state = createNewGameState();
                    this.state.baseUrl = loadedState.baseUrl;
                    this.state.apiKey = loadedState.apiKey;
                    this.state.model = loadedState.model;
                    await this.startNewGame();
                } else {
                    // 完全没有保存数据
                    await this.startNewGame();
                }
            }
        },

        async startNewGame() {
            const savedState = localStorage.getItem('randomCultivationGameSave');
            this.state = createNewGameState(savedState);
            
            // 检查是否有临时API配置需要继承
            const tempConfig = localStorage.getItem('tempApiConfig');
            if (tempConfig) {
                const config = JSON.parse(tempConfig);
                this.state.baseUrl = config.baseUrl;
                this.state.model = config.model;
                this.state.apiKey = config.apiKey;
                this.state.playerName = config.playerName;
                this.state.player.name = config.playerName;
            }
            
            // 清空对话框
            this.elements.eventLog.innerHTML = '';
            
            const initialEvent = generateRandomStartEvent(this.state);
            updateStatus(this.elements, this.state);
            
            const initialChoices = [{ text: "开始探索", event: 'start_explore' }];
            await displayEvent(this.elements, initialEvent, initialChoices);
            
            this.state.choices = initialChoices;
            this.state.storyHistory.push({
                event: initialEvent,
                choices: initialChoices,
                timestamp: Date.now()
            });
            
            // 保存游戏状态，确保API配置被持久化
            this.saveGame();
        },

        setupEventListeners() {
            this.elements.newStoryBtn.addEventListener('click', () => {
                // 总是显示设置界面，让用户可以设置角色名字，并指定这是新故事模式
                showSettingsModal(this.elements, this.state, true, true);
            });
            this.elements.saveBtn.addEventListener('click', () => this.saveGame());
            this.elements.historyBtn.addEventListener('click', () => window.location.href = 'history.html');
            this.elements.referenceBtn.addEventListener('click', () => window.location.href = 'reference.html');
            this.elements.settingsBtn.addEventListener('click', () => showSettingsModal(this.elements, this.state, false));
            this.elements.startExploreBtn.addEventListener('click', () => this.handleStartExplore());
            this.elements.exportBtn.addEventListener('click', () => exportProgress(this.state));
            this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
            this.elements.importFile.addEventListener('change', (e) => this.importGame(e));
            
            this.elements.saveAndStartBtn.addEventListener('click', () => this.confirmNewGame(true));
            this.elements.directStartBtn.addEventListener('click', () => this.confirmNewGame(false));
            this.elements.cancelStartBtn.addEventListener('click', () => hideConfirmModal(this.elements));
            
            this.elements.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
            this.elements.testConnectionBtn.addEventListener('click', () => this.runTestConnection());
            this.elements.cancelSettingsBtn.addEventListener('click', () => hideSettingsModal(this.elements));
            this.elements.toggleKeyVisibility.addEventListener('click', () => toggleApiKeyVisibility(this.elements));
            this.elements.randomNameBtn.addEventListener('click', () => this.generateRandomPlayerName());
            
            // 添加预设按钮事件监听
            this.setupPresetButtons();
            
            // 添加Base URL变化监听，更新模型选项
            this.elements.baseUrlInput.addEventListener('input', () => {
                updateModelOptions(this.elements, this.elements.baseUrlInput.value);
            });
            
            // 添加Base URL变化监听（change事件，用于预设按钮）
            this.elements.baseUrlInput.addEventListener('change', () => {
                updateModelOptions(this.elements, this.elements.baseUrlInput.value);
            });
            
            this.elements.choicesContainer.addEventListener('click', async (e) => {
                if (e.target.classList.contains('choice-button')) {
                    const button = e.target;
                    const choiceIndex = parseInt(button.dataset.index, 10);
                    const choice = this.state.choices[choiceIndex];
                    
                    // 立即禁用按钮并显示处理状态
                    button.classList.add('clicked', 'processing');
                    button.disabled = true;
                    
                    // 禁用所有其他按钮
                    const allButtons = this.elements.choicesContainer.querySelectorAll('.choice-button');
                    allButtons.forEach(btn => {
                        if (btn !== button) {
                            btn.disabled = true;
                            btn.style.opacity = '0.3';
                        }
                    });
                    
                    // 短暂延迟后处理选择
                    setTimeout(async () => {
                        // 清空选择按钮
                        this.elements.choicesContainer.innerHTML = '';
                        
                        // 如果是开始探索选项，先检查API设置
                        if (choice && choice.event === 'explore' && choice.text === "开始探索") {
                            this.checkApiAndExplore();
                        } else {
                            await this.handleChoiceWithDelay(choiceIndex, choice);
                        }
                    }, 300);
                }
            });
        },

        async confirmNewGame(shouldSave) {
            hideConfirmModal(this.elements);
            if (shouldSave) {
                saveToHistory(this.state);
            }
            await this.startNewGame();
        },
        
        saveGame() {
            // 使用全局函数 saveGame 而不是 saveGameState
            saveGame(this.state);
            // 系统保存命令直接弹窗提示，不发送到对话框
            alert("✅ 游戏已保存");
        },

        importGame(event) {
            importProgress(event, this.state, (newState) => {
                this.state = newState;
                this.fullDisplayUpdate();
                displayEvent(this.elements, "【系统】游戏进度已导入。", this.state.choices);
            });
        },

        saveSettings() {
            const baseUrl = this.elements.baseUrlInput.value.trim();
            const model = this.elements.modelSelect.value.trim();
            const apiKey = this.elements.apiKeyInput.value.trim();
            const playerName = this.elements.playerNameInput.value.trim();
            
            if (!baseUrl || !model || !apiKey) {
                alert('请输入Base URL、选择模型和API Key');
                return;
            }
            
            this.state.baseUrl = baseUrl;
            this.state.model = model;
            this.state.apiKey = apiKey;
            
            // 如果设置了角色名字，也保存
            if (playerName && this.state.player) {
                this.state.playerName = playerName;
                this.state.player.name = playerName;
                updateStatus(this.elements, this.state);
            }
            
            // 保存游戏状态
            saveGame(this.state);
            
            // 将设置保存操作添加到历史记录中
            const settingsMessage = "【系统】设置已保存";
            this.state.storyHistory.push({
                event: settingsMessage,
                choices: this.state.choices || [],
                timestamp: Date.now(),
                playerState: { ...this.state.player },
                worldState: { ...this.state.world },
                attributes: { ...this.state.attributes }
            });
            
            hideSettingsModal(this.elements);
            
            // 在对话框中显示设置保存信息，替换当前对话
            displayEvent(this.elements, settingsMessage, this.state.choices);
        },

        async runTestConnection() {
            const btn = this.elements.testConnectionBtn;
            btn.textContent = '测试中...';
            btn.disabled = true;
            try {
                const response = await testConnection(
                    this.elements.baseUrlInput.value, 
                    this.elements.apiKeyInput.value,
                    this.elements.modelSelect.value
                );
                alert(response.ok ? '✅ 连接测试成功！' : `❌ 连接测试失败！状态码: ${response.status}`);
            } catch (error) {
                alert(`❌ 连接测试失败！错误: ${error.message}`);
            } finally {
                btn.textContent = '测试连接';
                btn.disabled = false;
            }
        },

        loadFromContinueState(gameState) {
            const savedState = localStorage.getItem('randomCultivationGameSave');
            let currentApiKey = null;
            let currentBaseUrl = null;
            if (savedState) {
                const oldState = JSON.parse(savedState);
                currentApiKey = oldState.apiKey;
                currentBaseUrl = oldState.baseUrl;
            }
            this.state = { ...gameState, apiKey: currentApiKey, baseUrl: currentBaseUrl };
            this.fullDisplayUpdate();
            displayEvent(this.elements, "【系统】游戏进度已从历史记录中恢复。", this.state.choices);
        },

        fullDisplayUpdate() {
            this.elements.eventLog.innerHTML = '';
            updateStatus(this.elements, this.state);
            if (this.state.storyHistory && this.state.storyHistory.length > 0) {
                this.state.storyHistory.forEach(entry => {
                    const p = document.createElement('p');
                    p.innerHTML = entry.event;
                    this.elements.eventLog.appendChild(p);
                });
                this.elements.eventLog.scrollTop = this.elements.eventLog.scrollHeight;
            }
        },

        // 延迟自动保存方法，避免在用户交互时立即保存
        scheduleAutoSave() {
            // 清除之前的定时器
            if (this.autoSaveTimer) {
                clearTimeout(this.autoSaveTimer);
            }
            
            // 设置5秒后自动保存，给用户足够时间查看和选择选项
            this.autoSaveTimer = setTimeout(async () => {
                // 保存游戏状态
                saveGame(this.state);
                
                // 将自动保存操作添加到历史记录中
                const autoSaveMessage = "【系统】游戏已自动保存";
                this.state.storyHistory.push({
                    event: autoSaveMessage,
                    choices: this.state.choices || [],
                    timestamp: Date.now(),
                    playerState: { ...this.state.player },
                    worldState: { ...this.state.world },
                    attributes: { ...this.state.attributes }
                });
                
                // 在对话框中显示自动保存信息，替换当前对话
                await displayEvent(this.elements, autoSaveMessage, this.state.choices);
                
                this.autoSaveTimer = null;
            }, 5000);
        },

        // 检查API设置并开始探索
        checkApiAndExplore() {
            // 检查是否已配置API
            if (!this.state.baseUrl || !this.state.apiKey) {
                // 强制显示API设置界面
                showSettingsModal(this.elements, this.state, true);
            } else {
                // API已配置，直接开始探索
                this.proceedWithExplore();
            }
        },

        // 处理从设置界面开始探索
        async handleStartExplore() {
            const baseUrl = this.elements.baseUrlInput.value.trim();
            const model = this.elements.modelSelect.value.trim();
            const apiKey = this.elements.apiKeyInput.value.trim();
            const playerName = this.elements.playerNameInput.value.trim();
            
            if (!baseUrl || !model || !apiKey) {
                alert('请先填写Base URL、选择模型和API Key才能开始探索！');
                return;
            }
            
            if (!playerName) {
                alert('请先填写角色名字才能开始探索！');
                return;
            }
            
            // 保存API设置和角色名字到游戏状态
            this.state.baseUrl = baseUrl;
            this.state.model = model;
            this.state.apiKey = apiKey;
            this.state.playerName = playerName;
            
            // 检查是否是新故事模式（通过检查设置界面是否有特殊标记）
            const isNewStoryMode = this.elements.settingsModal.dataset.newStory === 'true';
            
            if (isNewStoryMode) {
                // 新故事模式：更新角色名字并重新开始
                this.state.player.name = playerName;
                
                // 先保存API配置到localStorage，确保新游戏能继承这些设置
                const tempConfig = {
                    baseUrl: baseUrl,
                    model: model,
                    apiKey: apiKey,
                    playerName: playerName
                };
                localStorage.setItem('tempApiConfig', JSON.stringify(tempConfig));
                
                hideSettingsModal(this.elements);
                
                // 开始新游戏
                await this.startNewGame();
                
                // 清除临时配置
                localStorage.removeItem('tempApiConfig');
            } else {
                // 普通模式：只更新设置
                this.state.player.name = playerName;
                this.saveGame();
                updateStatus(this.elements, this.state);
                hideSettingsModal(this.elements);
                this.proceedWithExplore();
            }
        },

        // 生成随机角色名字
        generateRandomPlayerName() {
            const randomName = this.generateRandomName();
            this.elements.playerNameInput.value = randomName;
        },

        // 随机名字生成逻辑
        generateRandomName() {
            const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
            const names = ['逍遥', '无极', '天行', '破军', '星河', '凌云', '飞羽', '剑心', '道玄', '无尘', '清风', '明月', '紫霄', '青云', '玄机', '天启', '神武', '圣手', '绝影', '惊鸿'];
            
            const surname = surnames[Math.floor(Math.random() * surnames.length)];
            const name = names[Math.floor(Math.random() * names.length)];
            
            return surname + name;
        },

        // 执行探索逻辑
        proceedWithExplore() {
            // 找到探索选项的索引
            const exploreIndex = this.state.choices.findIndex(choice => choice.event === 'explore');
            if (exploreIndex !== -1) {
                const choice = this.state.choices[exploreIndex];
                this.handleChoiceWithDelay(exploreIndex, choice);
            }
        },

        // 处理选择的延迟逻辑
        async handleChoiceWithDelay(choiceIndex, choice) {
            if (!choice) return;
            
            // 处理事件
            if (eventHandlers[choice.event]) {
                await eventHandlers[choice.event].call(this, this.elements, choice);
            } else {
                console.error('未找到事件处理器:', choice.event);
            }
        },

        // 设置预设按钮事件监听
        // 设置预设按钮事件监听
        setupPresetButtons() {
            // 使用事件委托处理预设按钮点击
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('preset-btn')) {
                    const url = e.target.getAttribute('data-url');
                    if (url && this.elements.baseUrlInput) {
                        this.elements.baseUrlInput.value = url;
                        // 手动触发模型选项更新
                        updateModelOptions(this.elements, url);
                    }
                }
            });
        }
    };

    game.init();
});