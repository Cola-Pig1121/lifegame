/**
 * 上下文分析器 - 分析玩家状态和行为模式
 * 用于为上下文感知的奇遇和婚姻系统提供智能决策支持
 */
class ContextAnalyzer {
    constructor(gameState) {
        this.gameState = gameState;
        this.player = gameState?.player || {};
        this.history = gameState?.history || [];
        this.relationships = gameState?.relationships || {};
        
        // 初始化错误处理
        this.errorHandler = new ErrorHandler('ContextAnalyzer');
    }

    /**
     * 获取玩家当前健康等级
     * @returns {string} 'low'|'medium'|'high'
     */
    getHealthLevel() {
        try {
            const health = this.player.health || 100;
            const maxHealth = this.player.maxHealth || 100;
            const ratio = health / maxHealth;
            
            if (ratio < 0.3) return 'low';
            if (ratio < 0.7) return 'medium';
            return 'high';
        } catch (error) {
            this.errorHandler.handle(error, 'getHealthLevel');
            return 'medium';
        }
    }

    /**
     * 获取玩家财富等级
     * @returns {string} 'poor'|'moderate'|'wealthy'
     */
    getWealthLevel() {
        try {
            const wealth = this.player.wealth || 0;
            
            if (wealth < 1000) return 'poor';
            if (wealth < 10000) return 'moderate';
            return 'wealthy';
        } catch (error) {
            this.errorHandler.handle(error, 'getWealthLevel');
            return 'moderate';
        }
    }

    /**
     * 获取玩家修为等级
     * @returns {string} 'beginner'|'intermediate'|'advanced'|'expert'|'master'
     */
    getCultivationLevel() {
        try {
            const cultivation = this.player.cultivation || 0;
            
            if (cultivation < 100) return 'beginner';
            if (cultivation < 500) return 'intermediate';
            if (cultivation < 1000) return 'advanced';
            if (cultivation < 5000) return 'expert';
            return 'master';
        } catch (error) {
            this.errorHandler.handle(error, 'getCultivationLevel');
            return 'beginner';
        }
    }

    /**
     * 分析历史事件模式
     * @returns {Object} 事件模式分析结果
     */
    getEventPatterns() {
        try {
            const patterns = {
                riskTolerance: this.calculateRiskTolerance(),
                socialEngagement: this.calculateSocialEngagement(),
                explorationFrequency: this.calculateExplorationFrequency(),
                combatPreference: this.calculateCombatPreference()
            };
            
            return patterns;
        } catch (error) {
            this.errorHandler.handle(error, 'getEventPatterns');
            return {
                riskTolerance: 'medium',
                socialEngagement: 'medium',
                explorationFrequency: 'medium',
                combatPreference: 'balanced'
            };
        }
    }

    /**
     * 计算风险承受能力
     * @private
     */
    calculateRiskTolerance() {
        const recentEvents = this.history.slice(-10);
        if (recentEvents.length === 0) return 'medium';
        
        const riskyChoices = recentEvents.filter(event => 
            event.type === 'adventure' && event.choice === 'risky'
        ).length;
        
        const ratio = riskyChoices / recentEvents.length;
        
        if (ratio > 0.7) return 'high';
        if (ratio > 0.3) return 'medium';
        return 'low';
    }

    /**
     * 计算社交参与度
     * @private
     */
    calculateSocialEngagement() {
        const socialEvents = this.history.filter(event => 
            event.type === 'social' || event.type === 'marriage'
        ).length;
        
        const totalEvents = this.history.length || 1;
        const ratio = socialEvents / totalEvents;
        
        if (ratio > 0.5) return 'high';
        if (ratio > 0.2) return 'medium';
        return 'low';
    }

    /**
     * 计算探索频率
     * @private
     */
    calculateExplorationFrequency() {
        const explorationEvents = this.history.filter(event => 
            event.type === 'explore' || event.type === 'adventure'
        ).length;
        
        // 简化的频率计算，实际应用中可能需要时间窗口
        if (explorationEvents > 20) return 'high';
        if (explorationEvents > 10) return 'medium';
        return 'low';
    }

    /**
     * 计算战斗偏好
     * @private
     */
    calculateCombatPreference() {
        const combatEvents = this.history.filter(event => 
            event.type === 'combat' || (event.type === 'adventure' && event.combat)
        ).length;
        
        const totalEvents = this.history.length || 1;
        const ratio = combatEvents / totalEvents;
        
        if (ratio > 0.6) return 'combat';
        if (ratio > 0.3) return 'balanced';
        return 'peaceful';
    }

    /**
     * 获取完整的玩家上下文信息
     * @returns {PlayerContext} 玩家上下文对象
     */
    getPlayerContext() {
        return {
            health: this.getHealthLevel(),
            wealth: this.getWealthLevel(),
            cultivation: this.getCultivationLevel(),
            patterns: this.getEventPatterns(),
            relationships: this.relationships,
            timestamp: Date.now()
        };
    }
}

/**
 * 玩家上下文接口定义
 * @typedef {Object} PlayerContext
 * @property {string} health - 健康等级
 * @property {string} wealth - 财富等级
 * @property {string} cultivation - 修为等级
 * @property {Object} patterns - 行为模式
 * @property {Object} relationships - 关系网络
 * @property {number} timestamp - 时间戳
 */