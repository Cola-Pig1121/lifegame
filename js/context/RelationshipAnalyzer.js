/**
 * 关系网络分析器 - 管理和分析NPC关系网络
 * 用于计算关系强度、兼容性和婚姻匹配
 */
class RelationshipAnalyzer {
    constructor(gameState) {
        this.gameState = gameState;
        this.relationships = gameState?.relationships || {};
        this.player = gameState?.player || {};
        
        // 初始化错误处理
        this.errorHandler = new ErrorHandler('RelationshipAnalyzer');
    }

    /**
     * 计算两个角色之间的关系强度
     * @param {string} characterA - 角色A ID
     * @param {string} characterB - 角色B ID
     * @returns {number} 关系强度 (0-100)
     */
    calculateRelationshipStrength(characterA, characterB) {
        try {
            const key = this.getRelationshipKey(characterA, characterB);
            const relationship = this.relationships[key] || {};
            
            let strength = 0;
            
            // 基础亲密度
            const intimacy = relationship.intimacy || 0;
            strength += intimacy * 0.4;
            
            // 互动频率
            const interactions = relationship.interactions || 0;
            strength += Math.min(interactions * 2, 30);
            
            // 共同经历
            const sharedEvents = relationship.sharedEvents || 0;
            strength += Math.min(sharedEvents * 5, 20);
            
            // 礼物赠送
            const gifts = relationship.gifts || 0;
            strength += Math.min(gifts * 3, 10);
            
            return Math.min(Math.max(strength, 0), 100);
        } catch (error) {
            this.errorHandler.handle(error, 'calculateRelationshipStrength');
            return 0;
        }
    }

    /**
     * 计算两个角色的兼容性
     * @param {string} characterA - 角色A ID
     * @param {string} characterB - 角色B ID
     * @returns {Object} 兼容性分析结果
     */
    calculateCompatibility(characterA, characterB) {
        try {
            const charA = this.getCharacterData(characterA);
            const charB = this.getCharacterData(characterB);
            
            if (!charA || !charB) {
                return { overall: 0, details: {} };
            }
            
            const compatibility = {
                overall: 0,
                details: {
                    personality: this.calculatePersonalityMatch(charA, charB),
                    goals: this.calculateGoalMatch(charA, charB),
                    cultivation: this.calculateCultivationMatch(charA, charB),
                    background: this.calculateBackgroundMatch(charA, charB)
                }
            };
            
            // 计算总体兼容性
            const weights = {
                personality: 0.3,
                goals: 0.25,
                cultivation: 0.25,
                background: 0.2
            };
            
            let total = 0;
            for (const [key, value] of Object.entries(compatibility.details)) {
                total += value * weights[key];
            }
            
            compatibility.overall = Math.min(Math.max(total, 0), 100);
            
            return compatibility;
        } catch (error) {
            this.errorHandler.handle(error, 'calculateCompatibility');
            return { overall: 0, details: {} };
        }
    }

    /**
     * 获取婚姻候选列表
     * @param {string} characterId - 主角ID
     * @returns {Array} 候选列表，按兼容性排序
     */
    getMarriageCandidates(characterId) {
        try {
            const candidates = [];
            const allCharacters = this.getAllCharacters();
            
            for (const charId of allCharacters) {
                if (charId === characterId) continue;
                
                const strength = this.calculateRelationshipStrength(characterId, charId);
                const compatibility = this.calculateCompatibility(characterId, charId);
                
                // 关系强度阈值
                if (strength < 60) continue;
                
                candidates.push({
                    id: charId,
                    name: this.getCharacterName(charId),
                    strength: strength,
                    compatibility: compatibility.overall,
                    details: compatibility.details
                });
            }
            
            // 按兼容性排序
            candidates.sort((a, b) => b.compatibility - a.compatibility);
            
            return candidates;
        } catch (error) {
            this.errorHandler.handle(error, 'getMarriageCandidates');
            return [];
        }
    }

    /**
     * 计算性格匹配度
     * @private
     */
    calculatePersonalityMatch(charA, charB) {
        const personalityA = charA.personality || {};
        const personalityB = charB.personality || {};
        
        let match = 0;
        let factors = 0;
        
        const traits = ['introversion', 'agreeableness', 'conscientiousness', 'openness'];
        
        for (const trait of traits) {
            if (personalityA[trait] !== undefined && personalityB[trait] !== undefined) {
                const diff = Math.abs(personalityA[trait] - personalityB[trait]);
                match += (100 - diff * 10);
                factors++;
            }
        }
        
        return factors > 0 ? match / factors : 50;
    }

    /**
     * 计算目标匹配度
     * @private
     */
    calculateGoalMatch(charA, charB) {
        const goalsA = charA.goals || [];
        const goalsB = charB.goals || [];
        
        if (goalsA.length === 0 || goalsB.length === 0) return 50;
        
        const commonGoals = goalsA.filter(goal => goalsB.includes(goal));
        return (commonGoals.length / Math.max(goalsA.length, goalsB.length)) * 100;
    }

    /**
     * 计算修为匹配度
     * @private
     */
    calculateCultivationMatch(charA, charB) {
        const cultivationA = charA.cultivation || 0;
        const cultivationB = charB.cultivation || 0;
        
        const diff = Math.abs(cultivationA - cultivationB);
        const maxCultivation = Math.max(cultivationA, cultivationB, 1);
        
        // 修为差距越小匹配度越高
        return Math.max(100 - (diff / maxCultivation) * 100, 0);
    }

    /**
     * 计算背景匹配度
     * @private
     */
    calculateBackgroundMatch(charA, charB) {
        const backgroundA = charA.background || {};
        const backgroundB = charB.background || {};
        
        let match = 0;
        let factors = 0;
        
        // 宗门匹配
        if (backgroundA.sect && backgroundB.sect) {
            match += backgroundA.sect === backgroundB.sect ? 80 : 20;
            factors++;
        }
        
        // 出身匹配
        if (backgroundA.origin && backgroundB.origin) {
            match += backgroundA.origin === backgroundB.origin ? 70 : 30;
            factors++;
        }
        
        return factors > 0 ? match / factors : 50;
    }

    /**
     * 获取关系键
     * @private
     */
    getRelationshipKey(charA, charB) {
        return [charA, charB].sort().join('_');
    }

    /**
     * 获取角色数据
     * @private
     */
    getCharacterData(characterId) {
        // 这里应该从游戏状态中获取角色数据
        // 简化实现，实际应用中需要更复杂的数据获取
        if (characterId === 'player') {
            return this.player;
        }
        return this.gameState.npcs?.[characterId] || null;
    }

    /**
     * 获取角色名称
     * @private
     */
    getCharacterName(characterId) {
        const char = this.getCharacterData(characterId);
        return char?.name || characterId;
    }

    /**
     * 获取所有角色ID
     * @private
     */
    getAllCharacters() {
        const characters = ['player'];
        if (this.gameState.npcs) {
            characters.push(...Object.keys(this.gameState.npcs));
        }
        return characters;
    }

    /**
     * 更新关系数据
     * @param {string} charA - 角色A
     * @param {string} charB - 角色B
     * @param {Object} updates - 更新数据
     */
    updateRelationship(charA, charB, updates) {
        try {
            const key = this.getRelationshipKey(charA, charB);
            
            if (!this.relationships[key]) {
                this.relationships[key] = {
                    intimacy: 0,
                    interactions: 0,
                    sharedEvents: 0,
                    gifts: 0,
                    createdAt: Date.now()
                };
            }
            
            Object.assign(this.relationships[key], updates);
            this.relationships[key].updatedAt = Date.now();
            
        } catch (error) {
            this.errorHandler.handle(error, 'updateRelationship');
        }
    }

    /**
     * 获取关系网络摘要
     * @param {string} characterId - 角色ID
     * @returns {Object} 关系网络摘要
     */
    getRelationshipSummary(characterId) {
        try {
            const allCharacters = this.getAllCharacters();
            const relationships = [];
            
            for (const charId of allCharacters) {
                if (charId === characterId) continue;
                
                const strength = this.calculateRelationshipStrength(characterId, charId);
                if (strength > 0) {
                    relationships.push({
                        id: charId,
                        name: this.getCharacterName(charId),
                        strength: strength
                    });
                }
            }
            
            return {
                totalRelationships: relationships.length,
                strongestRelationship: relationships.length > 0 ? 
                    relationships.reduce((max, r) => r.strength > max.strength ? r : max) : null,
                relationships: relationships.sort((a, b) => b.strength - a.strength)
            };
        } catch (error) {
            this.errorHandler.handle(error, 'getRelationshipSummary');
            return { totalRelationships: 0, relationships: [] };
        }
    }
}