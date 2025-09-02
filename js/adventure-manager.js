/**
 * 奇遇系统管理器
 * 负责奇遇事件的触发、管理和奖励计算
 */

class AdventureManager {
    constructor() {
        this.config = window.AdventureConfig || require('./adventure-config.js');
        this.events = this.config.adventureEvents;
        this.rewards = this.config.adventureRewards;
        this.weights = this.config.triggerWeights;
    }

    /**
     * 检查是否可以触发奇遇
     * @param {string} eventId - 奇遇事件ID
     * @param {Object} state - 游戏状态
     * @param {string} location - 当前地点
     * @returns {boolean} - 是否可以触发
     */
    canTriggerEvent(eventId, state, location) {
        const event = this.events[eventId];
        if (!event) return false;

        const { trigger } = event;
        const now = Date.now();

        // 检查冷却时间
        if (state.adventure.cooldowns[eventId] && 
            now < state.adventure.cooldowns[eventId]) {
            return false;
        }

        // 检查是否已完成
        if (state.adventure.completedEvents.includes(eventId)) {
            return false;
        }

        // 检查境界要求
        if (trigger.minRealm && state.player.rankIndex < trigger.minRealm) {
            return false;
        }

        // 检查地点要求
        if (trigger.locations && !trigger.locations.includes('any') && 
            !trigger.locations.includes(location)) {
            return false;
        }

        // 检查婚姻状态要求
        if (trigger.requirements?.marriageStatus && 
            state.marriage.status !== trigger.requirements.marriageStatus) {
            return false;
        }

        // 检查属性要求
        const requirements = trigger.requirements || {};
        const attributes = state.attributes || {};
        
        if (requirements.minLuck && (attributes.气运 || 0) < requirements.minLuck) {
            return false;
        }
        
        if (requirements.minPerception && (attributes.感知 || 0) < requirements.minPerception) {
            return false;
        }

        if (requirements.maxEvil && (attributes.邪恶值 || 0) > requirements.maxEvil) {
            return false;
        }

        if (requirements.minKarma && (attributes.功德 || 0) < requirements.minKarma) {
            return false;
        }

        return true;
    }

    /**
     * 计算奇遇触发概率
     * @param {string} eventId - 奇遇事件ID
     * @param {Object} state - 游戏状态
     * @returns {number} - 实际触发概率
     */
    calculateTriggerProbability(eventId, state) {
        const event = this.events[eventId];
        if (!event) return 0;

        let probability = event.trigger.probability;
        const attributes = state.attributes || {};

        // 境界加成
        const realmMultiplier = this.weights.realmMultiplier;
        probability *= Math.pow(realmMultiplier, state.player.rankIndex);

        // 福缘加成
        const luck = attributes.气运 || 50;
        const luckMultiplier = this.weights.luckMultiplier;
        probability *= (luck / 100) * luckMultiplier;

        // 感知加成
        const perception = attributes.感知 || 50;
        const perceptionMultiplier = this.weights.perceptionMultiplier;
        probability *= (perception / 100) * perceptionMultiplier;

        // 功德加成
        const karma = attributes.功德 || 50;
        const karmaMultiplier = this.weights.karmaMultiplier;
        if (karma > 50) {
            probability *= (karma / 100) * karmaMultiplier;
        }

        // 邪恶值惩罚
        const evil = attributes.邪恶值 || 0;
        const evilPenalty = this.weights.evilPenalty;
        if (evil > 50) {
            probability *= evilPenalty;
        }

        return Math.min(probability, 0.8); // 最高80%概率
    }

    /**
     * 随机选择可触发的奇遇
     * @param {Object} state - 游戏状态
     * @param {string} location - 当前地点
     * @returns {string|null} - 选中的奇遇事件ID
     */
    selectRandomEvent(state, location) {
        const availableEvents = Object.keys(this.events).filter(eventId => 
            this.canTriggerEvent(eventId, state, location)
        );

        if (availableEvents.length === 0) return null;

        // 计算每个事件的实际概率
        const eventProbabilities = availableEvents.map(eventId => ({
            id: eventId,
            probability: this.calculateTriggerProbability(eventId, state)
        }));

        // 根据概率权重选择
        const totalProbability = eventProbabilities.reduce((sum, ep) => sum + ep.probability, 0);
        if (totalProbability <= 0) return null;

        let random = Math.random() * totalProbability;
        for (const ep of eventProbabilities) {
            random -= ep.probability;
            if (random <= 0) return ep.id;
        }

        return availableEvents[0]; // 保底选择
    }

    /**
     * 触发奇遇事件
     * @param {string} eventId - 奇遇事件ID
     * @param {Object} state - 游戏状态
     * @returns {Object} - 奇遇事件数据
     */
    triggerEvent(eventId, state) {
        const event = this.events[eventId];
        if (!event) return null;

        const adventureEvent = {
            id: eventId,
            type: event.type,
            name: event.name,
            description: event.description,
            startTime: Date.now(),
            stage: 'triggered',
            choicesMade: [],
            result: null
        };

        // 添加到激活事件列表
        state.adventure.activeEvents.push(adventureEvent);
        
        // 设置冷却时间
        state.adventure.cooldowns[eventId] = Date.now() + event.trigger.cooldown;

        return adventureEvent;
    }

    /**
     * 完成奇遇事件
     * @param {string} eventId - 奇遇事件ID
     * @param {Object} state - 游戏状态
     * @param {Object} choice - 选择结果
     */
    completeEvent(eventId, state, choice) {
        const activeEvent = state.adventure.activeEvents.find(e => e.id === eventId);
        if (!activeEvent) return;

        // 计算奖励
        const rewards = this.calculateRewards(choice.rewards || {});
        
        // 应用奖励到状态
        this.applyRewards(state, rewards);
        
        // 应用惩罚
        if (choice.punishments) {
            this.applyPunishments(state, choice.punishments);
        }

        // 更新事件状态
        activeEvent.stage = 'completed';
        activeEvent.result = {
            choice: choice.text,
            rewards: rewards,
            punishments: choice.punishments || {}
        };

        // 移动到完成列表
        state.adventure.completedEvents.push(eventId);
        state.adventure.activeEvents = state.adventure.activeEvents.filter(e => e.id !== eventId);
        
        // 更新统计
        state.adventure.triggerCount++;
        this.updateRewardStats(state, rewards);
    }

    /**
     * 计算奖励值
     * @param {Object} rewardConfig - 奖励配置
     * @returns {Object} - 实际奖励值
     */
    calculateRewards(rewardConfig) {
        const rewards = {};
        
        for (const [key, value] of Object.entries(rewardConfig)) {
            if (typeof value === 'object' && value.min !== undefined) {
                // 随机范围奖励
                rewards[key] = Math.floor(Math.random() * (value.max - value.min + 1)) + value.min;
            } else {
                // 固定奖励
                rewards[key] = value;
            }
        }

        return rewards;
    }

    /**
     * 应用奖励到游戏状态
     * @param {Object} state - 游戏状态
     * @param {Object} rewards - 奖励对象
     */
    applyRewards(state, rewards) {
        const attributes = state.attributes || {};
        
        for (const [key, value] of Object.entries(rewards)) {
            switch (key) {
                case 'cultivation':
                    attributes.修为 = (attributes.修为 || 0) + value;
                    break;
                case 'realmExp':
                    attributes.境界经验 = (attributes.境界经验 || 0) + value;
                    break;
                case 'spiritStones':
                    attributes.财富 = (attributes.财富 || 0) + value;
                    break;
                case 'luck':
                    attributes.气运 = Math.min((attributes.气运 || 50) + value, 100);
                    break;
                case 'fate':
                    attributes.机缘 = (attributes.机缘 || 0) + value;
                    break;
                case 'romance':
                    // 婚姻相关奖励
                    if (state.marriage && state.marriage.status === 'single') {
                        attributes.姻缘 = (attributes.姻缘 || 0) + value;
                    }
                    break;
                case 'technique':
                    // 添加功法
                    if (!state.skills) state.skills = [];
                    state.skills.push(`高级功法${value}本`);
                    break;
                case 'artifact':
                    // 添加法宝
                    if (!state.items) state.items = [];
                    state.items.push(`神秘法宝${value}件`);
                    break;
                case 'pills':
                    // 添加丹药
                    if (!state.items) state.items = [];
                    state.items.push(`珍贵丹药${value}颗`);
                    break;
                default:
                    // 其他属性直接添加
                    attributes[key] = (attributes[key] || 0) + value;
            }
        }

        state.attributes = attributes;
    }

    /**
     * 应用惩罚效果
     * @param {Object} state - 游戏状态
     * @param {Object} punishments - 惩罚对象
     */
    applyPunishments(state, punishments) {
        const attributes = state.attributes || {};
        
        for (const [key, value] of Object.entries(punishments)) {
            switch (key) {
                case 'reputation':
                    attributes.声望 = Math.max((attributes.声望 || 0) + value, 0);
                    break;
                case 'health':
                    attributes.健康 = Math.max((attributes.健康 || 100) + value, 1);
                    break;
                case 'realmExp':
                    attributes.境界经验 = Math.max((attributes.境界经验 || 0) + value, 0);
                    break;
                default:
                    attributes[key] = Math.max((attributes[key] || 0) + value, 0);
            }
        }

        state.attributes = attributes;
    }

    /**
     * 更新奖励统计
     * @param {Object} state - 游戏状态
     * @param {Object} rewards - 奖励对象
     */
    updateRewardStats(state, rewards) {
        const stats = state.adventure.totalRewards;
        
        for (const [key, value] of Object.entries(rewards)) {
            switch (key) {
                case 'cultivation':
                case 'realmExp':
                    stats.cultivation += value;
                    break;
                case 'spiritStones':
                    stats.spiritStones += value;
                    break;
                case 'artifact':
                    stats.artifacts += value;
                    break;
                case 'technique':
                    stats.techniques += value;
                    break;
            }
        }
    }

    /**
     * 获取可用的奇遇事件
     * @param {Object} state - 游戏状态
     * @param {string} location - 当前地点
     * @returns {Array} - 可用奇遇列表
     */
    getAvailableEvents(state, location) {
        return Object.keys(this.events)
            .filter(eventId => this.canTriggerEvent(eventId, state, location))
            .map(eventId => this.events[eventId]);
    }

    /**
     * 获取奇遇事件详情
     * @param {string} eventId - 奇遇事件ID
     * @returns {Object} - 事件详情
     */
    getEventDetails(eventId) {
        return this.events[eventId] || null;
    }

    /**
     * 清理过期的冷却时间
     * @param {Object} state - 游戏状态
     */
    cleanupCooldowns(state) {
        const now = Date.now();
        const cooldowns = state.adventure.cooldowns;
        
        for (const [eventId, cooldownTime] of Object.entries(cooldowns)) {
            if (now >= cooldownTime) {
                delete cooldowns[eventId];
            }
        }
    }
}

// 导出管理器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdventureManager;
} else {
    // 浏览器环境
    window.AdventureManager = AdventureManager;
}