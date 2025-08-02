/**
 * 权重计算器 - 计算奇遇类型的上下文权重
 * 基于玩家状态、历史行为和关系网络动态调整权重
 */
class WeightCalculator {
    constructor(gameState) {
        this.gameState = gameState;
        this.weights = this.loadDefaultWeights();
        this.cache = new Map();
        
        // 初始化错误处理
        this.errorHandler = new ErrorHandler('WeightCalculator');
    }

    /**
     * 加载默认权重配置
     * @returns {Object} 默认权重配置
     */
    loadDefaultWeights() {
        return {
            IMMORTAL: {
                base: 30,
                factors: {
                    cultivation: { high: 1.5, medium: 1.2, low: 0.8 },
                    health: { high: 1.2, medium: 1.0, low: 0.7 },
                    wealth: { high: 1.1, medium: 1.0, low: 0.9 },
                    riskTolerance: { high: 1.3, medium: 1.0, low: 0.8 }
                }
            },
            DEMON: {
                base: 20,
                factors: {
                    cultivation: { high: 1.2, medium: 1.0, low: 1.5 },
                    health: { high: 1.0, medium: 1.2, low: 1.5 },
                    wealth: { high: 0.9, medium: 1.0, low: 1.2 },
                    riskTolerance: { high: 1.5, medium: 1.0, low: 0.7 }
                }
            },
            OPPORTUNITY: {
                base: 25,
                factors: {
                    cultivation: { high: 1.0, medium: 1.2, low: 1.5 },
                    wealth: { high: 0.8, medium: 1.0, low: 1.3 },
                    health: { high: 1.1, medium: 1.0, low: 0.9 },
                    explorationFrequency: { high: 1.3, medium: 1.0, low: 0.8 }
                }
            },
            SOCIAL: {
                base: 15,
                factors: {
                    socialEngagement: { high: 1.5, medium: 1.0, low: 0.7 },
                    relationshipStrength: { high: 1.4, medium: 1.0, low: 0.8 },
                    cultivation: { high: 1.1, medium: 1.0, low: 0.9 },
                    wealth: { high: 1.0, medium: 1.1, low: 0.9 }
                }
            },
            WEALTH: {
                base: 20,
                factors: {
                    wealth: { high: 0.7, medium: 1.0, low: 1.5 },
                    cultivation: { high: 1.2, medium: 1.0, low: 0.8 },
                    riskTolerance: { high: 1.4, medium: 1.0, low: 0.7 },
                    explorationFrequency: { high: 1.1, medium: 1.0, low: 0.9 }
                }
            },
            CRISIS: {
                base: 15,
                factors: {
                    health: { high: 0.6, medium: 0.8, low: 1.5 },
                    wealth: { high: 0.7, medium: 1.0, low: 1.4 },
                    cultivation: { high: 0.8, medium: 1.0, low: 1.3 },
                    riskTolerance: { high: 1.2, medium: 1.0, low: 0.8 }
                }
            }
        };
    }

    /**
     * 计算奇遇类型的上下文权重
     * @param {string} adventureType - 奇遇类型
     * @param {PlayerContext} context - 玩家上下文
     * @returns {number} 计算后的权重
     */
    calculateWeight(adventureType, context) {
        try {
            // 检查缓存
            const cacheKey = `${adventureType}_${JSON.stringify(context)}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const config = this.weights[adventureType];
            if (!config) {
                return 0;
            }

            let weight = config.base;
            
            // 应用上下文因子
            const factors = config.factors;
            for (const [factorName, factorConfig] of Object.entries(factors)) {
                const factorValue = this.getFactorValue(factorName, context);
                const multiplier = factorConfig[factorValue] || 1.0;
                weight *= multiplier;
            }

            // 应用衰减机制
            weight = this.applyDecay(adventureType, weight, context);
            
            // 边界检查
            weight = Math.max(0, Math.min(weight, 100));
            
            // 缓存结果
            this.cache.set(cacheKey, weight);
            
            return weight;
        } catch (error) {
            this.errorHandler.handle(error, 'calculateWeight');
            return 0;
        }
    }

    /**
     * 获取因子值
     * @private
     */
    getFactorValue(factorName, context) {
        switch (factorName) {
            case 'cultivation':
                return context.cultivation;
            case 'health':
                return context.health;
            case 'wealth':
                return context.wealth;
            case 'riskTolerance':
                return context.patterns?.riskTolerance || 'medium';
            case 'socialEngagement':
                return context.patterns?.socialEngagement || 'medium';
            case 'explorationFrequency':
                return context.patterns?.explorationFrequency || 'medium';
            case 'relationshipStrength':
                return this.calculateRelationshipStrength(context);
            default:
                return 'medium';
        }
    }

    /**
     * 计算关系强度因子
     * @private
     */
    calculateRelationshipStrength(context) {
        const relationships = context.relationships || {};
        const strengths = Object.values(relationships).map(r => r.strength || 0);
        
        if (strengths.length === 0) return 'low';
        
        const avgStrength = strengths.reduce((a, b) => a + b, 0) / strengths.length;
        
        if (avgStrength > 70) return 'high';
        if (avgStrength > 40) return 'medium';
        return 'low';
    }

    /**
     * 应用权重衰减机制
     * @private
     */
    applyDecay(adventureType, weight, context) {
        // 获取该类型奇遇的最近触发时间
        const recentTriggers = this.getRecentTriggers(adventureType);
        
        if (recentTriggers.length === 0) {
            return weight;
        }
        
        const lastTrigger = Math.max(...recentTriggers);
        const hoursSinceLastTrigger = (Date.now() - lastTrigger) / (1000 * 60 * 60);
        
        // 衰减公式：每24小时衰减50%
        const decayFactor = Math.pow(0.5, hoursSinceLastTrigger / 24);
        
        return weight * decayFactor;
    }

    /**
     * 获取最近触发的同类奇遇
     * @private
     */
    getRecentTriggers(adventureType) {
        // 这里应该从游戏状态中读取历史数据
        // 简化实现，实际应用中需要更复杂的数据管理
        const history = this.gameState.history || [];
        return history
            .filter(event => event.type === 'adventure' && event.adventureType === adventureType)
            .map(event => event.timestamp || 0);
    }

    /**
     * 获取所有奇遇类型的权重
     * @param {PlayerContext} context - 玩家上下文
     * @returns {Object} 所有类型的权重映射
     */
    calculateAllWeights(context) {
        try {
            const weights = {};
            const adventureTypes = Object.keys(this.weights);
            
            for (const type of adventureTypes) {
                weights[type] = this.calculateWeight(type, context);
            }
            
            return weights;
        } catch (error) {
            this.errorHandler.handle(error, 'calculateAllWeights');
            return {};
        }
    }

    /**
     * 更新权重配置
     * @param {string} adventureType - 奇遇类型
     * @param {Object} newConfig - 新的权重配置
     */
    updateWeightConfig(adventureType, newConfig) {
        try {
            if (this.weights[adventureType]) {
                Object.assign(this.weights[adventureType], newConfig);
                this.cache.clear(); // 清除缓存
            }
        } catch (error) {
            this.errorHandler.handle(error, 'updateWeightConfig');
        }
    }

    /**
     * 重置权重配置为默认值
     */
    resetWeights() {
        this.weights = this.loadDefaultWeights();
        this.cache.clear();
    }

    /**
     * 获取权重统计信息
     * @param {PlayerContext} context - 玩家上下文
     * @returns {Object} 权重统计
     */
    getWeightStats(context) {
        try {
            const allWeights = this.calculateAllWeights(context);
            const weights = Object.values(allWeights);
            
            return {
                weights: allWeights,
                total: weights.reduce((a, b) => a + b, 0),
                max: Math.max(...weights),
                min: Math.min(...weights),
                average: weights.reduce((a, b) => a + b, 0) / weights.length
            };
        } catch (error) {
            this.errorHandler.handle(error, 'getWeightStats');
            return { weights: {}, total: 0, max: 0, min: 0, average: 0 };
        }
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 导出权重配置
     * @returns {Object} 当前权重配置
     */
    exportConfig() {
        return JSON.parse(JSON.stringify(this.weights));
    }

    /**
     * 导入权重配置
     * @param {Object} config - 权重配置
     */
    importConfig(config) {
        try {
            this.weights = JSON.parse(JSON.stringify(config));
            this.cache.clear();
        } catch (error) {
            this.errorHandler.handle(error, 'importConfig');
        }
    }
}