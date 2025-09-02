/**
 * 上下文感知奇遇与婚姻系统主入口
 * 整合所有上下文分析、关系网络、权重计算、奇遇管理和婚姻系统功能
 */

class ContextAdventureSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.initialized = false;
        
        // 初始化所有子系统
        this.errorHandler = new ErrorHandler('ContextAdventureSystem');
        this.contextAnalyzer = new ContextAnalyzer(gameState);
        this.relationshipAnalyzer = new RelationshipAnalyzer(gameState);
        this.weightCalculator = new WeightCalculator();
        this.adventureManager = new ContextAdventureManager(gameState, this.contextAnalyzer, this.weightCalculator);
        this.marriageSystem = new ContextMarriageSystem(gameState, this.contextAnalyzer, this.relationshipAnalyzer);
        
        // 系统状态
        this.systemState = {
            lastCheck: 0,
            checkInterval: 60000, // 1分钟检查一次
            enabled: true,
            stats: {
                totalChecks: 0,
                adventuresTriggered: 0,
                romancesTriggered: 0,
                errors: 0
            }
        };
        
        // 事件监听
        this.setupEventListeners();
    }

    /**
     * 初始化系统
     */
    async init() {
        try {
            if (this.initialized) {
                return true;
            }
            
            // 验证必要组件
            this.validateComponents();
            
            // 加载历史数据
            await this.loadHistoricalData();
            
            // 启动定时检查
            this.startPeriodicCheck();
            
            this.initialized = true;
            
            console.log('上下文感知奇遇与婚姻系统初始化完成');
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'init');
            return false;
        }
    }

    /**
     * 验证必要组件
     * @private
     */
    validateComponents() {
        const requiredComponents = [
            this.contextAnalyzer,
            this.relationshipAnalyzer,
            this.weightCalculator,
            this.adventureManager,
            this.marriageSystem
        ];
        
        for (const component of requiredComponents) {
            if (!component) {
                throw new Error(`Missing required component: ${component}`);
            }
        }
    }

    /**
     * 加载历史数据
     * @private
     */
    async loadHistoricalData() {
        try {
            // 从游戏状态加载历史数据
            const savedData = this.gameState.getData('contextAdventureSystem');
            if (savedData) {
                this.systemState.stats = { ...this.systemState.stats, ...savedData.stats };
            }
        } catch (error) {
            this.errorHandler.handle(error, 'loadHistoricalData');
        }
    }

    /**
     * 设置事件监听器
     * @private
     */
    setupEventListeners() {
        // 监听游戏状态变化
        if (typeof document !== 'undefined') {
            document.addEventListener('gameStateChange', (event) => {
                this.onGameStateChange(event.detail);
            });
            
            document.addEventListener('playerAction', (event) => {
                this.onPlayerAction(event.detail);
            });
        }
    }

    /**
     * 游戏状态变化处理
     * @private
     */
    onGameStateChange(change) {
        try {
            // 重置分析器缓存
            this.contextAnalyzer.invalidateCache();
            this.relationshipAnalyzer.invalidateCache();
            
            // 立即检查是否需要触发奇遇
            this.checkForAdventures();
        } catch (error) {
            this.errorHandler.handle(error, 'onGameStateChange');
        }
    }

    /**
     * 玩家动作处理
     * @private
     */
    onPlayerAction(action) {
        try {
            // 某些动作可能增加奇遇触发概率
            if (action.type === 'social_interaction') {
                this.checkForRomance();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'onPlayerAction');
        }
    }

    /**
     * 启动定时检查
     * @private
     */
    startPeriodicCheck() {
        setInterval(() => {
            if (this.systemState.enabled) {
                this.periodicCheck();
            }
        }, this.systemState.checkInterval);
    }

    /**
     * 定时检查
     * @private
     */
    periodicCheck() {
        try {
            this.systemState.lastCheck = Date.now();
            this.systemState.stats.totalChecks++;
            
            this.checkForAdventures();
            this.checkForRomance();
            
            // 保存系统状态
            this.saveSystemState();
        } catch (error) {
            this.systemState.stats.errors++;
            this.errorHandler.handle(error, 'periodicCheck');
        }
    }

    /**
     * 检查奇遇触发
     */
    checkForAdventures() {
        try {
            if (this.adventureManager.shouldTriggerAdventure()) {
                const adventure = this.adventureManager.selectAdventure();
                if (adventure) {
                    this.triggerAdventure(adventure);
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'checkForAdventures');
        }
    }

    /**
     * 检查浪漫触发
     */
    checkForRomance() {
        try {
            if (this.marriageSystem.shouldTriggerRomance()) {
                const romance = this.marriageSystem.selectRomanceAdventure();
                if (romance) {
                    this.triggerRomance(romance);
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'checkForRomance');
        }
    }

    /**
     * 触发奇遇
     * @param {Object} adventure - 奇遇配置
     */
    triggerAdventure(adventure) {
        try {
            this.systemState.stats.adventuresTriggered++;
            
            // 创建奇遇事件
            const event = new CustomEvent('contextAdventure', {
                detail: {
                    type: 'adventure',
                    adventure: adventure,
                    timestamp: Date.now(),
                    source: 'ContextAdventureSystem'
                }
            });
            
            if (typeof document !== 'undefined') {
                document.dispatchEvent(event);
            }
            
            // 记录到游戏日志
            this.logAdventure(adventure);
            
        } catch (error) {
            this.errorHandler.handle(error, 'triggerAdventure');
        }
    }

    /**
     * 触发浪漫奇遇
     * @param {Object} romance - 浪漫奇遇配置
     */
    triggerRomance(romance) {
        try {
            this.systemState.stats.romancesTriggered++;
            
            // 创建浪漫事件
            const event = new CustomEvent('contextRomance', {
                detail: {
                    type: 'romance',
                    romance: romance,
                    timestamp: Date.now(),
                    source: 'ContextAdventureSystem'
                }
            });
            
            if (typeof document !== 'undefined') {
                document.dispatchEvent(event);
            }
            
            // 记录到游戏日志
            this.logRomance(romance);
            
        } catch (error) {
            this.errorHandler.handle(error, 'triggerRomance');
        }
    }

    /**
     * 记录奇遇到游戏日志
     * @private
     */
    logAdventure(adventure) {
        try {
            const logEntry = {
                type: 'adventure',
                name: adventure.name,
                description: adventure.description,
                timestamp: Date.now(),
                context: this.contextAnalyzer.getCurrentContext()
            };
            
            // 添加到游戏日志
            if (this.gameState.addLogEntry) {
                this.gameState.addLogEntry(logEntry);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'logAdventure');
        }
    }

    /**
     * 记录浪漫奇遇到游戏日志
     * @private
     */
    logRomance(romance) {
        try {
            const logEntry = {
                type: 'romance',
                name: romance.name,
                description: romance.description,
                timestamp: Date.now(),
                partner: romance.candidate ? romance.candidate.name : null
            };
            
            // 添加到游戏日志
            if (this.gameState.addLogEntry) {
                this.gameState.addLogEntry(logEntry);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'logRomance');
        }
    }

    /**
     * 保存系统状态
     * @private
     */
    saveSystemState() {
        try {
            const stateToSave = {
                stats: this.systemState.stats,
                lastCheck: this.systemState.lastCheck
            };
            
            this.gameState.setData('contextAdventureSystem', stateToSave);
        } catch (error) {
            this.errorHandler.handle(error, 'saveSystemState');
        }
    }

    /**
     * 获取系统统计信息
     * @returns {Object} 系统统计信息
     */
    getStatistics() {
        return {
            ...this.systemState.stats,
            initialized: this.initialized,
            enabled: this.systemState.enabled,
            lastCheck: this.systemState.lastCheck,
            marriageStatus: this.marriageSystem.getMarriageSummary(),
            errorStats: this.errorHandler.getStatistics()
        };
    }

    /**
     * 手动触发奇遇检查
     */
    forceCheck() {
        this.periodicCheck();
    }

    /**
     * 获取当前上下文摘要
     * @returns {Object} 上下文摘要
     */
    getContextSummary() {
        return {
            playerContext: this.contextAnalyzer.getCurrentContext(),
            relationships: this.relationshipAnalyzer.getAllRelationships(),
            marriageCandidates: this.marriageSystem.getMarriageCandidates(),
            systemStats: this.getStatistics()
        };
    }

    /**
     * 启用/禁用系统
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.systemState.enabled = enabled;
    }

    /**
     * 更新配置
     * @param {Object} config - 新配置
     */
    updateConfig(config) {
        try {
            if (config.checkInterval) {
                this.systemState.checkInterval = config.checkInterval;
            }
            
            this.adventureManager.updateConfig(config.adventure || {});
            this.marriageSystem.updateConfig(config.marriage || {});
            
        } catch (error) {
            this.errorHandler.handle(error, 'updateConfig');
        }
    }

    /**
     * 重置系统
     */
    reset() {
        try {
            this.contextAnalyzer.reset();
            this.relationshipAnalyzer.reset();
            this.adventureManager.reset();
            this.marriageSystem.reset();
            
            this.systemState = {
                lastCheck: 0,
                checkInterval: 60000,
                enabled: true,
                stats: {
                    totalChecks: 0,
                    adventuresTriggered: 0,
                    romancesTriggered: 0,
                    errors: 0
                }
            };
            
            this.saveSystemState();
            
        } catch (error) {
            this.errorHandler.handle(error, 'reset');
        }
    }

    /**
     * 销毁系统
     */
    destroy() {
        try {
            this.setEnabled(false);
            this.saveSystemState();
            
            // 移除事件监听器
            if (typeof document !== 'undefined') {
                document.removeEventListener('gameStateChange', this.onGameStateChange);
                document.removeEventListener('playerAction', this.onPlayerAction);
            }
            
            this.initialized = false;
            
        } catch (error) {
            this.errorHandler.handle(error, 'destroy');
        }
    }
}

// 全局访问
if (typeof window !== 'undefined') {
    window.ContextAdventureSystem = ContextAdventureSystem;
}

// 导出给模块系统使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextAdventureSystem;
}