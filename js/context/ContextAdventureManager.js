/**
 * 上下文感知奇遇管理器 - 基于玩家上下文智能触发奇遇
 * 集成ContextAnalyzer、RelationshipAnalyzer和WeightCalculator
 */
class ContextAdventureManager {
    constructor(gameState, contextAnalyzer) {
        this.gameState = gameState;
        this.contextAnalyzer = contextAnalyzer;
        this.weightCalculator = new WeightCalculator(gameState);
        this.relationshipAnalyzer = new RelationshipAnalyzer(gameState);
        
        // 配置参数
        this.config = {
            baseTriggerChance: 0.15,
            minInterval: 300000, // 5分钟最小间隔
            maxInterval: 3600000, // 1小时最大间隔
            cooldownPeriod: 60000 // 1分钟冷却时间
        };
        
        this.lastTriggerTime = 0;
        this.triggerHistory = [];
        
        // 初始化错误处理
        this.errorHandler = new ErrorHandler('ContextAdventureManager');
    }

    /**
     * 判断是否应该触发奇遇
     * @returns {boolean} 是否应该触发
     */
    shouldTriggerAdventure() {
        try {
            // 检查冷却时间
            if (Date.now() - this.lastTriggerTime < this.config.cooldownPeriod) {
                return false;
            }
            
            // 获取玩家上下文
            const context = this.contextAnalyzer.getPlayerContext();
            
            // 计算触发概率
            const triggerChance = this.calculateTriggerChance(context);
            
            // 随机判断
            return Math.random() < triggerChance;
        } catch (error) {
            this.errorHandler.handle(error, 'shouldTriggerAdventure');
            return false;
        }
    }

    /**
     * 选择具体的奇遇类型
     * @returns {Object|null} 选择的奇遇类型配置
     */
    selectAdventure() {
        try {
            const context = this.contextAnalyzer.getPlayerContext();
            const weights = this.weightCalculator.calculateAllWeights(context);
            
            // 检查是否有权重
            const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
            if (totalWeight <= 0) {
                return null;
            }
            
            // 使用权重随机选择
            const selectedType = this.weightedRandomSelection(weights);
            
            if (!selectedType) {
                return null;
            }
            
            // 创建奇遇配置
            const adventure = this.createAdventureConfig(selectedType, context);
            
            // 记录触发历史
            this.recordTrigger(selectedType, adventure);
            
            return adventure;
        } catch (error) {
            this.errorHandler.handle(error, 'selectAdventure');
            return null;
        }
    }

    /**
     * 计算触发概率
     * @private
     */
    calculateTriggerChance(context) {
        let chance = this.config.baseTriggerChance;
        
        // 基于玩家状态调整概率
        const healthLevel = context.health;
        const wealthLevel = context.wealth;
        const cultivationLevel = context.cultivation;
        
        // 健康状态影响
        if (healthLevel === 'low') chance *= 0.7;
        else if (healthLevel === 'high') chance *= 1.2;
        
        // 财富状态影响
        if (wealthLevel === 'poor') chance *= 1.3;
        else if (wealthLevel === 'wealthy') chance *= 0.8;
        
        // 修为状态影响
        if (cultivationLevel === 'beginner') chance *= 1.2;
        else if (cultivationLevel === 'master') chance *= 0.7;
        
        // 历史模式影响
        const patterns = context.patterns;
        if (patterns) {
            if (patterns.explorationFrequency === 'high') chance *= 1.3;
            else if (patterns.explorationFrequency === 'low') chance *= 0.7;
            
            if (patterns.riskTolerance === 'high') chance *= 1.2;
            else if (patterns.riskTolerance === 'low') chance *= 0.8;
        }
        
        return Math.max(0.05, Math.min(chance, 0.5));
    }

    /**
     * 权重随机选择
     * @private
     */
    weightedRandomSelection(weights) {
        const types = Object.keys(weights);
        const values = Object.values(weights);
        const total = values.reduce((a, b) => a + b, 0);
        
        if (total <= 0) return null;
        
        let random = Math.random() * total;
        
        for (let i = 0; i < types.length; i++) {
            random -= values[i];
            if (random <= 0) {
                return types[i];
            }
        }
        
        return types[types.length - 1];
    }

    /**
     * 创建奇遇配置
     * @private
     */
    createAdventureConfig(adventureType, context) {
        const baseConfigs = {
            IMMORTAL: {
                name: '仙缘奇遇',
                description: '感受到一股神秘的仙气波动，似乎有仙缘降临',
                choices: [
                    {
                        text: '静心感悟',
                        effects: { cultivation: 50, insight: 20 },
                        probability: 0.7
                    },
                    {
                        text: '主动追寻',
                        effects: { cultivation: 100, health: -10 },
                        probability: 0.3
                    }
                ]
            },
            DEMON: {
                name: '魔障奇遇',
                description: '周围魔气弥漫，似乎有魔障即将出现',
                choices: [
                    {
                        text: '正面迎战',
                        effects: { cultivation: 30, health: -30 },
                        probability: 0.6
                    },
                    {
                        text: '暂避锋芒',
                        effects: { cultivation: 10, health: 10 },
                        probability: 0.8
                    }
                ]
            },
            OPPORTUNITY: {
                name: '机遇奇遇',
                description: '发现一处灵气充沛的秘境，似乎是难得的机遇',
                choices: [
                    {
                        text: '深入探索',
                        effects: { cultivation: 80, wealth: 50 },
                        probability: 0.5
                    },
                    {
                        text: '谨慎观察',
                        effects: { cultivation: 30, insight: 30 },
                        probability: 0.9
                    }
                ]
            },
            SOCIAL: {
                name: '社交奇遇',
                description: '遇到一位神秘的修士，似乎有意与你结交',
                choices: [
                    {
                        text: '热情结交',
                        effects: { relationship: 50, cultivation: 20 },
                        probability: 0.8
                    },
                    {
                        text: '保持距离',
                        effects: { insight: 10, cultivation: 10 },
                        probability: 1.0
                    }
                ]
            },
            WEALTH: {
                name: '财富奇遇',
                description: '发现一处宝藏的迹象，可能获得大量财富',
                choices: [
                    {
                        text: '全力搜寻',
                        effects: { wealth: 200, cultivation: -10 },
                        probability: 0.4
                    },
                    {
                        text: '随缘获取',
                        effects: { wealth: 50, cultivation: 10 },
                        probability: 0.8
                    }
                ]
            },
            CRISIS: {
                name: '危机奇遇',
                description: '感受到强烈的危机预感，似乎有劫难将至',
                choices: [
                    {
                        text: '迎难而上',
                        effects: { cultivation: 100, health: -50 },
                        probability: 0.3
                    },
                    {
                        text: '寻求庇护',
                        effects: { health: 20, cultivation: 10 },
                        probability: 0.7
                    }
                ]
            }
        };
        
        const baseConfig = baseConfigs[adventureType];
        if (!baseConfig) return null;
        
        // 基于上下文个性化配置
        const personalizedConfig = this.personalizeAdventure(baseConfig, context);
        
        return {
            ...personalizedConfig,
            type: adventureType,
            timestamp: Date.now(),
            context: {
                cultivationLevel: context.cultivation,
                healthLevel: context.health,
                wealthLevel: context.wealth
            }
        };
    }

    /**
     * 个性化奇遇配置
     * @private
     */
    personalizeAdventure(config, context) {
        const personalized = JSON.parse(JSON.stringify(config));
        
        // 基于修为调整奖励
        const cultivationMultiplier = this.getCultivationMultiplier(context.cultivation);
        
        // 基于财富调整奖励
        const wealthMultiplier = this.getWealthMultiplier(context.wealth);
        
        // 应用乘数到奖励
        personalized.choices.forEach(choice => {
            if (choice.effects.cultivation) {
                choice.effects.cultivation *= cultivationMultiplier;
            }
            if (choice.effects.wealth) {
                choice.effects.wealth *= wealthMultiplier;
            }
        });
        
        return personalized;
    }

    /**
     * 获取修为乘数
     * @private
     */
    getCultivationMultiplier(level) {
        const multipliers = {
            'beginner': 1.5,
            'intermediate': 1.2,
            'advanced': 1.0,
            'expert': 0.8,
            'master': 0.6
        };
        return multipliers[level] || 1.0;
    }

    /**
     * 获取财富乘数
     * @private
     */
    getWealthMultiplier(level) {
        const multipliers = {
            'poor': 1.3,
            'moderate': 1.0,
            'wealthy': 0.7
        };
        return multipliers[level] || 1.0;
    }

    /**
     * 记录触发历史
     * @private
     */
    recordTrigger(type, adventure) {
        this.lastTriggerTime = Date.now();
        this.triggerHistory.push({
            type: type,
            adventure: adventure,
            timestamp: this.lastTriggerTime
        });
        
        // 保持历史记录长度
        if (this.triggerHistory.length > 100) {
            this.triggerHistory = this.triggerHistory.slice(-50);
        }
    }

    /**
     * 获取触发统计
     * @returns {Object} 触发统计信息
     */
    getTriggerStats() {
        try {
            const stats = {
                totalTriggers: this.triggerHistory.length,
                lastTriggerTime: this.lastTriggerTime,
                typeDistribution: {},
                averageInterval: 0
            };
            
            // 计算类型分布
            this.triggerHistory.forEach(trigger => {
                const type = trigger.type;
                stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1;
            });
            
            // 计算平均间隔
            if (this.triggerHistory.length > 1) {
                const intervals = [];
                for (let i = 1; i < this.triggerHistory.length; i++) {
                    intervals.push(
                        this.triggerHistory[i].timestamp - this.triggerHistory[i-1].timestamp
                    );
                }
                stats.averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            }
            
            return stats;
        } catch (error) {
            this.errorHandler.handle(error, 'getTriggerStats');
            return { totalTriggers: 0, typeDistribution: {} };
        }
    }

    /**
     * 重置触发状态
     */
    reset() {
        this.lastTriggerTime = 0;
        this.triggerHistory = [];
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }
}