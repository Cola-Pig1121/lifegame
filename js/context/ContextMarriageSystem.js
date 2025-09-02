/**
 * 婚姻系统引擎 - 管理婚姻关系的发展和触发
 * 基于关系强度、兼容性和上下文条件智能触发婚姻事件
 */
class ContextMarriageSystem {
    constructor(gameState, contextAnalyzer, relationshipAnalyzer) {
        this.gameState = gameState;
        this.contextAnalyzer = contextAnalyzer;
        this.relationshipAnalyzer = relationshipAnalyzer;
        
        // 婚姻状态
        this.marriageState = {
            status: 'single', // single, dating, engaged, married
            partner: null,
            relationshipLevel: 0,
            marriageDate: null,
            anniversaryEvents: []
        };
        
        // 配置参数
        this.config = {
            minRelationshipStrength: 80,
            minCompatibility: 70,
            datingThreshold: 60,
            engagementThreshold: 75,
            marriageThreshold: 90,
            romanceChance: 0.1,
            cooldownPeriod: 1800000 // 30分钟
        };
        
        this.lastRomanceTrigger = 0;
        this.romanceHistory = [];
        
        // 初始化错误处理
        this.errorHandler = new ErrorHandler('ContextMarriageSystem');
    }

    /**
     * 检查是否应该触发浪漫奇遇
     * @returns {boolean} 是否应该触发
     */
    shouldTriggerRomance() {
        try {
            // 检查冷却时间
            if (Date.now() - this.lastRomanceTrigger < this.config.cooldownPeriod) {
                return false;
            }
            
            // 检查当前状态
            if (this.marriageState.status !== 'single') {
                return false;
            }
            
            // 获取候选列表
            const candidates = this.getMarriageCandidates();
            if (candidates.length === 0) {
                return false;
            }
            
            // 随机判断
            return Math.random() < this.config.romanceChance;
        } catch (error) {
            this.errorHandler.handle(error, 'shouldTriggerRomance');
            return false;
        }
    }

    /**
     * 获取婚姻候选列表
     * @returns {Array} 排序后的候选列表
     */
    getMarriageCandidates() {
        try {
            return this.relationshipAnalyzer.getMarriageCandidates('player');
        } catch (error) {
            this.errorHandler.handle(error, 'getMarriageCandidates');
            return [];
        }
    }

    /**
     * 选择浪漫奇遇
     * @returns {Object|null} 浪漫奇遇配置
     */
    selectRomanceAdventure() {
        try {
            const candidates = this.getMarriageCandidates();
            if (candidates.length === 0) {
                return null;
            }
            
            // 选择最佳候选
            const bestCandidate = candidates[0];
            
            // 创建浪漫奇遇
            const romance = this.createRomanceAdventure(bestCandidate);
            
            // 记录触发历史
            this.recordRomanceTrigger(romance);
            
            return romance;
        } catch (error) {
            this.errorHandler.handle(error, 'selectRomanceAdventure');
            return null;
        }
    }

    /**
     * 创建浪漫奇遇配置
     * @private
     */
    createRomanceAdventure(candidate) {
        const romanceTypes = [
            {
                type: 'MEETING',
                name: '邂逅奇缘',
                description: `在一次偶然的相遇中，你遇到了${candidate.name}，似乎有种特别的感觉`,
                choices: [
                    {
                        text: '主动搭讪',
                        effects: { relationship: 20, intimacy: 10 },
                        nextStage: 'DATING'
                    },
                    {
                        text: '礼貌点头',
                        effects: { relationship: 5, insight: 5 },
                        nextStage: 'ACQUAINTANCE'
                    }
                ]
            },
            {
                type: 'HELPING',
                name: '相助之缘',
                description: `${candidate.name}遇到了困难，你决定伸出援手`,
                choices: [
                    {
                        text: '全力相助',
                        effects: { relationship: 30, trust: 15 },
                        nextStage: 'DATING'
                    },
                    {
                        text: '量力而行',
                        effects: { relationship: 15, wisdom: 10 },
                        nextStage: 'FRIENDSHIP'
                    }
                ]
            },
            {
                type: 'SHARED_EXPERIENCE',
                name: '共患难',
                description: `与${candidate.name}共同经历了一场危机，感情似乎有所升温`,
                choices: [
                    {
                        text: '表达心意',
                        effects: { relationship: 40, intimacy: 20 },
                        nextStage: 'ENGAGEMENT'
                    },
                    {
                        text: '保持友谊',
                        effects: { relationship: 25, friendship: 15 },
                        nextStage: 'CLOSE_FRIEND'
                    }
                ]
            }
        ];
        
        // 根据关系强度选择合适的浪漫类型
        let selectedType;
        if (candidate.strength < 70) {
            selectedType = romanceTypes[0]; // 初次相遇
        } else if (candidate.strength < 85) {
            selectedType = romanceTypes[1]; // 相助之缘
        } else {
            selectedType = romanceTypes[2]; // 共患难
        }
        
        return {
            ...selectedType,
            candidate: candidate,
            timestamp: Date.now(),
            relationshipLevel: candidate.strength
        };
    }

    /**
     * 更新婚姻关系状态
     * @param {string} action - 动作类型
     * @param {Object} params - 参数
     */
    updateMarriageStatus(action, params = {}) {
        try {
            switch (action) {
                case 'START_DATING':
                    this.marriageState.status = 'dating';
                    this.marriageState.partner = params.partner;
                    this.marriageState.relationshipLevel = 70;
                    break;
                    
                case 'PROPOSE_ENGAGEMENT':
                    if (this.marriageState.status === 'dating' && 
                        this.marriageState.relationshipLevel >= this.config.engagementThreshold) {
                        this.marriageState.status = 'engaged';
                        this.marriageState.relationshipLevel = 85;
                    }
                    break;
                    
                case 'GET_MARRIED':
                    if (this.marriageState.status === 'engaged' && 
                        this.marriageState.relationshipLevel >= this.config.marriageThreshold) {
                        this.marriageState.status = 'married';
                        this.marriageState.marriageDate = Date.now();
                        this.marriageState.relationshipLevel = 100;
                    }
                    break;
                    
                case 'INCREASE_RELATIONSHIP':
                    this.marriageState.relationshipLevel = Math.min(
                        this.marriageState.relationshipLevel + (params.amount || 5),
                        100
                    );
                    break;
                    
                case 'DECREASE_RELATIONSHIP':
                    this.marriageState.relationshipLevel = Math.max(
                        this.marriageState.relationshipLevel - (params.amount || 5),
                        0
                    );
                    break;
                    
                case 'BREAK_UP':
                    this.marriageState.status = 'single';
                    this.marriageState.partner = null;
                    this.marriageState.relationshipLevel = 0;
                    this.marriageState.marriageDate = null;
                    break;
            }
        } catch (error) {
            this.errorHandler.handle(error, 'updateMarriageStatus');
        }
    }

    /**
     * 检查是否可以求婚
     * @returns {Object} 求婚检查结果
     */
    checkProposalEligibility() {
        try {
            const result = {
                eligible: false,
                reason: '',
                requirements: {
                    relationshipLevel: this.marriageState.relationshipLevel,
                    minLevel: this.config.marriageThreshold,
                    partner: this.marriageState.partner
                }
            };
            
            if (this.marriageState.status !== 'engaged') {
                result.reason = '需要先订婚';
                return result;
            }
            
            if (this.marriageState.relationshipLevel < this.config.marriageThreshold) {
                result.reason = '感情还不够深厚';
                return result;
            }
            
            if (!this.marriageState.partner) {
                result.reason = '没有合适的伴侣';
                return result;
            }
            
            result.eligible = true;
            result.reason = '可以举行婚礼';
            return result;
        } catch (error) {
            this.errorHandler.handle(error, 'checkProposalEligibility');
            return { eligible: false, reason: '系统错误' };
        }
    }

    /**
     * 获取婚姻状态摘要
     * @returns {Object} 婚姻状态摘要
     */
    getMarriageSummary() {
        try {
            const summary = {
                status: this.marriageState.status,
                partner: this.marriageState.partner,
                relationshipLevel: this.marriageState.relationshipLevel,
                anniversaryEvents: this.marriageState.anniversaryEvents.length,
                daysSinceMarriage: 0
            };
            
            if (this.marriageState.marriageDate) {
                const days = Math.floor((Date.now() - this.marriageState.marriageDate) / (1000 * 60 * 60 * 24));
                summary.daysSinceMarriage = days;
            }
            
            return summary;
        } catch (error) {
            this.errorHandler.handle(error, 'getMarriageSummary');
            return { status: 'single', relationshipLevel: 0 };
        }
    }

    /**
     * 创建周年庆典事件
     * @returns {Object|null} 周年庆典配置
     */
    createAnniversaryEvent() {
        try {
            if (this.marriageState.status !== 'married' || !this.marriageState.marriageDate) {
                return null;
            }
            
            const daysSinceMarriage = Math.floor((Date.now() - this.marriageState.marriageDate) / (1000 * 60 * 60 * 24));
            
            if (daysSinceMarriage <= 0 || daysSinceMarriage % 365 !== 0) {
                return null;
            }
            
            const anniversaryYear = daysSinceMarriage / 365;
            
            const event = {
                type: 'ANNIVERSARY',
                name: `结婚${anniversaryYear}周年庆典`,
                description: `今天是你们结婚${anniversaryYear}周年的日子，${this.marriageState.partner}为你准备了特别的惊喜`,
                rewards: {
                    cultivation: 100 * anniversaryYear,
                    happiness: 50 * anniversaryYear,
                    relationship: 20 * anniversaryYear
                },
                year: anniversaryYear
            };
            
            this.marriageState.anniversaryEvents.push(event);
            
            return event;
        } catch (error) {
            this.errorHandler.handle(error, 'createAnniversaryEvent');
            return null;
        }
    }

    /**
     * 记录浪漫触发历史
     * @private
     */
    recordRomanceTrigger(romance) {
        this.lastRomanceTrigger = Date.now();
        this.romanceHistory.push({
            romance: romance,
            timestamp: this.lastRomanceTrigger
        });
        
        // 保持历史记录长度
        if (this.romanceHistory.length > 50) {
            this.romanceHistory = this.romanceHistory.slice(-25);
        }
    }

    /**
     * 获取浪漫触发统计
     * @returns {Object} 浪漫触发统计
     */
    getRomanceStats() {
        try {
            return {
                totalTriggers: this.romanceHistory.length,
                lastTriggerTime: this.lastRomanceTrigger,
                currentStatus: this.marriageState.status,
                partner: this.marriageState.partner,
                relationshipLevel: this.marriageState.relationshipLevel
            };
        } catch (error) {
            this.errorHandler.handle(error, 'getRomanceStats');
            return { totalTriggers: 0, currentStatus: 'single' };
        }
    }

    /**
     * 重置婚姻状态
     */
    reset() {
        this.marriageState = {
            status: 'single',
            partner: null,
            relationshipLevel: 0,
            marriageDate: null,
            anniversaryEvents: []
        };
        this.lastRomanceTrigger = 0;
        this.romanceHistory = [];
    }

    /**
     * 更新配置
     * @param {Object} newConfig - 新配置
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
    }
}