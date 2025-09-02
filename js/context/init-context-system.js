/**
 * 上下文感知系统初始化脚本
 * 在游戏启动时自动初始化和配置上下文感知奇遇与婚姻系统
 */

(function() {
    'use strict';
    
    // 等待游戏环境准备就绪
    function waitForGameReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (window.gameManager && window.gameManager.gameState) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    // 初始化上下文感知系统
    async function initContextSystem() {
        try {
            console.log('正在初始化上下文感知系统...');
            
            // 等待游戏环境准备
            await waitForGameReady();
            
            // 创建系统实例
            const gameState = window.gameManager.gameState;
            window.contextAdventureSystem = new ContextAdventureSystem(gameState);
            
            // 初始化系统
            const initSuccess = await window.contextAdventureSystem.init();
            
            if (initSuccess) {
                console.log('✅ 上下文感知系统初始化成功');
                
                // 设置事件监听
                setupEventHandlers();
                
                // 注册到游戏管理器
                registerWithGameManager();
                
                // 显示初始化成功消息
                showInitSuccess();
                
            } else {
                console.error('❌ 上下文感知系统初始化失败');
                fallbackToTraditionalSystem();
            }
            
        } catch (error) {
            console.error('上下文感知系统初始化错误:', error);
            fallbackToTraditionalSystem();
        }
    }
    
    // 设置事件处理器
    function setupEventHandlers() {
        if (typeof document === 'undefined') return;
        
        // 监听上下文奇遇事件
        document.addEventListener('contextAdventure', (event) => {
            handleContextAdventure(event.detail);
        });
        
        // 监听浪漫奇遇事件
        document.addEventListener('contextRomance', (event) => {
            handleContextRomance(event.detail);
        });
        
        // 监听系统错误
        document.addEventListener('systemError', (event) => {
            console.warn('上下文系统错误:', event.detail);
        });
    }
    
    // 处理上下文奇遇
    function handleContextAdventure(adventureData) {
        try {
            const adventure = adventureData.adventure;
            
            // 显示奇遇通知
            showAdventureNotification(adventure);
            
            // 启动奇遇
            if (window.gameManager.startAdventure) {
                window.gameManager.startAdventure({
                    type: 'context_adventure',
                    title: adventure.name,
                    description: adventure.description,
                    choices: adventure.choices,
                    context: adventure.context
                });
            }
            
        } catch (error) {
            console.error('处理上下文奇遇失败:', error);
        }
    }
    
    // 处理浪漫奇遇
    function handleContextRomance(romanceData) {
        try {
            const romance = romanceData.romance;
            
            // 显示浪漫通知
            showRomanceNotification(romance);
            
            // 启动浪漫奇遇
            if (window.gameManager.startRomanceEvent) {
                window.gameManager.startRomanceEvent({
                    type: 'romance_adventure',
                    title: romance.name,
                    description: romance.description,
                    choices: romance.choices,
                    candidate: romance.candidate
                });
            }
            
        } catch (error) {
            console.error('处理浪漫奇遇失败:', error);
        }
    }
    
    // 显示奇遇通知
    function showAdventureNotification(adventure) {
        const notification = {
            title: '奇遇触发',
            message: adventure.description,
            type: 'adventure',
            duration: 5000,
            actions: [
                {
                    text: '查看详情',
                    action: () => {
                        // 打开奇遇详情界面
                        if (window.gameManager.openAdventureDetail) {
                            window.gameManager.openAdventureDetail(adventure);
                        }
                    }
                }
            ]
        };
        
        if (window.gameManager.showNotification) {
            window.gameManager.showNotification(notification);
        }
    }
    
    // 显示浪漫通知
    function showRomanceNotification(romance) {
        const candidateName = romance.candidate ? romance.candidate.name : '神秘人';
        
        const notification = {
            title: '浪漫邂逅',
            message: `你与${candidateName}之间似乎有了特别的联系...`,
            type: 'romance',
            duration: 6000,
            actions: [
                {
                    text: '回应感情',
                    action: () => {
                        // 打开浪漫事件界面
                        if (window.gameManager.openRomanceEvent) {
                            window.gameManager.openRomanceEvent(romance);
                        }
                    }
                }
            ]
        };
        
        if (window.gameManager.showNotification) {
            window.gameManager.showNotification(notification);
        }
    }
    
    // 注册到游戏管理器
    function registerWithGameManager() {
        if (!window.gameManager) return;
        
        // 注册系统信息
        if (window.gameManager.registerSystem) {
            window.gameManager.registerSystem({
                name: 'ContextAdventureSystem',
                version: '1.0.0',
                description: '上下文感知奇遇与婚姻系统',
                status: 'active',
                getStats: () => {
                    return window.contextAdventureSystem.getStatistics();
                }
            });
        }
        
        // 添加调试命令
        if (window.gameManager.addDebugCommand) {
            window.gameManager.addDebugCommand('context-stats', () => {
                console.log('上下文系统统计:', window.contextAdventureSystem.getStatistics());
                console.log('当前上下文:', window.contextAdventureSystem.getContextSummary());
            });
            
            window.gameManager.addDebugCommand('force-adventure', () => {
                window.contextAdventureSystem.forceCheck();
                console.log('已强制检查奇遇');
            });
            
            window.gameManager.addDebugCommand('reset-context', () => {
                window.contextAdventureSystem.reset();
                console.log('上下文系统已重置');
            });
        }
    }
    
    // 显示初始化成功消息
    function showInitSuccess() {
        const message = {
            title: '系统升级',
            message: '上下文感知奇遇与婚姻系统已成功启动！\n系统将根据你的游戏行为智能触发奇遇和浪漫事件。',
            type: 'success',
            duration: 8000
        };
        
        if (window.gameManager.showMessage) {
            window.gameManager.showMessage(message);
        }
    }
    
    // 回退到传统系统
    function fallbackToTraditionalSystem() {
        console.warn('正在回退到传统奇遇系统...');
        
        // 显示回退消息
        if (window.gameManager.showMessage) {
            window.gameManager.showMessage({
                title: '系统提示',
                message: '上下文感知系统暂不可用，已启用传统奇遇模式。',
                type: 'warning',
                duration: 5000
            });
        }
    }
    
    // 自动启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContextSystem);
    } else {
        // 如果DOM已经加载完成
        initContextSystem();
    }
    
    // 导出全局访问
    window.initContextSystem = initContextSystem;
    
})();