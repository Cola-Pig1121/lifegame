/**
 * 奇遇系统配置文件
 * 定义所有奇遇事件的触发条件、剧情模板和奖励配置
 */

// 奇遇事件类型枚举
const AdventureTypes = {
    IMMORTAL_FATE: '仙缘奇遇',      // 仙人指路、洞天福地
    DEMON_TRIAL: '魔障奇遇',       // 心魔入侵、魔修拦路
    OPPORTUNITY: '机遇奇遇',       // 上古遗迹、天地异宝
    SOCIAL_FATE: '社交奇遇',       // 道侣奇缘、高人收徒
    COMBAT_FATE: '战斗奇遇',       // 妖兽袭击、修士斗法
    LUCK_FATE: '福缘奇遇'          // 意外收获、天降祥瑞
};

// 奇遇事件配置
const adventureEvents = {
    // 仙缘奇遇
    'immortal_guidance': {
        id: 'immortal_guidance',
        type: AdventureTypes.IMMORTAL_FATE,
        name: '仙人指路',
        description: '偶遇仙人，获得指点迷津',
        trigger: {
            minRealm: 2,                    // 最低境界要求
            locations: ['mountain', 'forest', 'temple'],
            probability: 0.05,            // 5%基础概率
            cooldown: 24 * 60 * 60 * 1000,  // 24小时冷却
            requirements: {
                minLuck: 70,
                maxEvil: 30
            }
        },
        story: {
            template: '仙人指路模板',
            choices: [
                {
                    text: '恭敬请教',
                    effects: { wisdom: 20, reputation: 10 },
                    rewards: { technique: 1, pills: 3 }
                },
                {
                    text: '求取法宝',
                    effects: { greed: 10 },
                    rewards: { artifact: 1 },
                    punishments: { reputation: -5 }
                },
                {
                    text: '婉言谢绝',
                    effects: { composure: 15 },
                    rewards: { meditation: 50 }
                }
            ]
        }
    },

    // 洞天福地
    'blessed_land': {
        id: 'blessed_land',
        type: AdventureTypes.IMMORTAL_FATE,
        name: '洞天福地',
        description: '发现灵气浓郁的修炼圣地',
        trigger: {
            minRealm: 1,
            locations: ['mountain', 'valley', 'cave'],
            probability: 0.08,
            cooldown: 12 * 60 * 60 * 1000,
            requirements: {
                minPerception: 60
            }
        },
        story: {
            template: '洞天福地模板',
            choices: [
                {
                    text: '立即修炼',
                    effects: { cultivation: 100, luck: 5 },
                    rewards: { realmExp: 200 }
                },
                {
                    text: '仔细探索',
                    effects: { perception: 15 },
                    rewards: { spiritStones: 100, herbs: 5 }
                },
                {
                    text: '布下阵法',
                    effects: { wisdom: 20 },
                    rewards: { formation: 1, cultivation: 50 }
                }
            ]
        }
    },

    // 心魔入侵
    'heart_demon': {
        id: 'heart_demon',
        type: AdventureTypes.DEMON_TRIAL,
        name: '心魔入侵',
        description: '内心魔障浮现，考验道心',
        trigger: {
            minRealm: 3,
            locations: ['any'],
            probability: 0.03,
            cooldown: 6 * 60 * 60 * 1000,
            requirements: {
                minKarma: 50,
                realmBreakthrough: true  // 突破境界时触发
            }
        },
        story: {
            template: '心魔考验模板',
            choices: [
                {
                    text: '正面迎战',
                    effects: { courage: 20, willpower: 15 },
                    rewards: { realmExp: 100, mentalStrength: 30 },
                    punishments: { realmExp: -50 }
                },
                {
                    text: '静心化解',
                    effects: { wisdom: 25, composure: 20 },
                    rewards: { meditation: 100, mentalStrength: 20 }
                },
                {
                    text: '逃避退让',
                    effects: { fear: 15 },
                    punishments: { realmExp: -100, confidence: -20 }
                }
            ]
        }
    },

    // 道侣奇缘
    'destined_love': {
        id: 'destined_love',
        type: AdventureTypes.SOCIAL_FATE,
        name: '道侣奇缘',
        description: '邂逅命中注定的道侣',
        trigger: {
            minRealm: 2,
            locations: ['garden', 'lake', 'mountain', 'temple'],
            probability: 0.04,
            cooldown: 48 * 60 * 60 * 1000,
            requirements: {
                marriageStatus: 'single',
                minCharm: 60,
                minFate: 50
            }
        },
        story: {
            template: '道侣奇缘模板',
            choices: [
                {
                    text: '主动结识',
                    effects: { charm: 10, boldness: 15 },
                    rewards: { romance: 80, partner: 'random' }
                },
                {
                    text: '暗中观察',
                    effects: { cautious: 10 },
                    rewards: { romance: 30, information: true }
                },
                {
                    text: '擦肩而过',
                    effects: { regret: 5 },
                    rewards: { fate: -10 }
                }
            ]
        }
    },

    // 上古遗迹
    'ancient_ruins': {
        id: 'ancient_ruins',
        type: AdventureTypes.OPPORTUNITY,
        name: '上古遗迹',
        description: '发现古老修士遗留的洞府',
        trigger: {
            minRealm: 3,
            locations: ['ruins', 'cave', 'desert'],
            probability: 0.06,
            cooldown: 36 * 60 * 60 * 1000,
            requirements: {
                minLuck: 65,
                minPerception: 70
            }
        },
        story: {
            template: '上古遗迹模板',
            choices: [
                {
                    text: '深入探索',
                    effects: { bravery: 15, perception: 10 },
                    rewards: { artifacts: 2, spiritStones: 500 },
                    punishments: { health: -20 }
                },
                {
                    text: '谨慎搜寻',
                    effects: { cautious: 20 },
                    rewards: { herbs: 10, pills: 5, materials: 3 }
                },
                {
                    text: '邀请同道',
                    effects: { sociable: 15 },
                    rewards: { reputation: 20, sharedLoot: true }
                }
            ]
        }
    },

    // 天降祥瑞
    'heavenly_omen': {
        id: 'heavenly_omen',
        type: AdventureTypes.LUCK_FATE,
        name: '天降祥瑞',
        description: '紫气东来，天降福缘',
        trigger: {
            minRealm: 1,
            locations: ['any'],
            probability: 0.02,
            cooldown: 72 * 60 * 60 * 1000,
            requirements: {
                minKarma: 80,
                maxEvil: 20
            }
        },
        story: {
            template: '天降祥瑞模板',
            choices: [
                {
                    text: '沐浴祥瑞',
                    effects: { blessed: 30 },
                    rewards: { luck: 20, cultivation: 200, fate: 15 }
                },
                {
                    text: '感悟天道',
                    effects: { enlightenment: 25 },
                    rewards: { wisdom: 15, realmExp: 150 }
                },
                {
                    text: '收集祥瑞之气',
                    effects: { greedy: 10 },
                    rewards: { spiritStones: 300 },
                    punishments: { karma: -10 }
                }
            ]
        }
    }
};

// 奇遇奖励配置
const adventureRewards = {
    cultivation: { min: 50, max: 500 },
    realmExp: { min: 100, max: 1000 },
    spiritStones: { min: 100, max: 1000 },
    herbs: { min: 1, max: 10 },
    pills: { min: 1, max: 5 },
    artifacts: { min: 1, max: 3 },
    techniques: { min: 1, max: 2 },
    formation: 1,
    luck: { min: 5, max: 20 },
    fate: { min: 5, max: 15 },
    romance: { min: 10, max: 100 }
};

// 奇遇触发权重表
const triggerWeights = {
    realmMultiplier: 1.2,     // 境界加成
    luckMultiplier: 1.5,      // 福缘加成
    perceptionMultiplier: 1.3,  // 感知加成
    karmaMultiplier: 1.4,       // 功德加成
    evilPenalty: 0.8            // 邪恶值惩罚
};

// 奇遇UI配置
const adventureUI = {
    colors: {
        [AdventureTypes.IMMORTAL_FATE]: '#FFD700',
        [AdventureTypes.DEMON_TRIAL]: '#8B0000',
        [AdventureTypes.OPPORTUNITY]: '#32CD32',
        [AdventureTypes.SOCIAL_FATE]: '#FF69B4',
        [AdventureTypes.COMBAT_FATE]: '#FF4500',
        [AdventureTypes.LUCK_FATE]: '#9370DB'
    },
    icons: {
        [AdventureTypes.IMMORTAL_FATE]: '✨',
        [AdventureTypes.DEMON_TRIAL]: '👹',
        [AdventureTypes.OPPORTUNITY]: '💎',
        [AdventureTypes.SOCIAL_FATE]: '💝',
        [AdventureTypes.COMBAT_FATE]: '⚔️',
        [AdventureTypes.LUCK_FATE]: '🍀'
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AdventureTypes,
        adventureEvents,
        adventureRewards,
        triggerWeights,
        adventureUI
    };
} else {
    // 浏览器环境
    window.AdventureConfig = {
        AdventureTypes,
        adventureEvents,
        adventureRewards,
        triggerWeights,
        adventureUI
    };
}