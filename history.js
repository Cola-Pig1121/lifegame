class HistoryManager {
    constructor() {
        this.elements = {
            historyList: document.getElementById('history-list'),
            backToGameBtn: document.getElementById('back-to-game-btn'),
            clearAllBtn: document.getElementById('clear-all-btn')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadHistoryList();
    }

    setupEventListeners() {
        this.elements.backToGameBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        this.elements.clearAllBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有历史记录吗？此操作不可恢复！')) {
                this.clearAllHistory();
            }
        });
    }

    // 加载历史记录列表
    loadHistoryList() {
        const historyKey = 'cultivationGameHistory';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        this.elements.historyList.innerHTML = '';
        
        if (history.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'empty-history';
            emptyDiv.innerHTML = '暂无历史记录<br>开始你的修仙之旅吧！';
            this.elements.historyList.appendChild(emptyDiv);
            return;
        }

        // 按保存时间倒序排列
        history.sort((a, b) => new Date(b.saveTime) - new Date(a.saveTime));

        history.forEach(record => {
            const card = document.createElement('div');
            card.className = 'history-card';
            
            const playerSystem = cultivationSystems.find(s => s.systemName === record.player.system);
            const rankName = playerSystem ? playerSystem.ranks[record.player.rankIndex].name : '未知';
            
            card.innerHTML = `
                <div class="history-card-title">${record.title}</div>
                <div class="history-card-info">
                    <div>修炼体系：${record.player.system}</div>
                    <div>当前境界：${rankName}</div>
                    <div>修炼年龄：${record.player.age}岁</div>
                    <div>所在地点：${record.world.location}</div>
                    <div>保存时间：${record.saveTime}</div>
                </div>
                <div class="history-card-actions">
                    <button class="continue-btn" data-game-id="${record.id}">继续游戏</button>
                    <button class="delete-btn" data-game-id="${record.id}">删除记录</button>
                </div>
            `;

            // 添加事件监听器
            const continueBtn = card.querySelector('.continue-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            
            continueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.continueGame(record.id);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个历史记录吗？')) {
                    this.deleteHistoryRecord(record.id);
                    this.loadHistoryList(); // 重新加载列表
                }
            });

            this.elements.historyList.appendChild(card);
        });
    }

    // 继续游戏
    continueGame(gameId) {
        const historyKey = 'cultivationGameHistory';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const gameRecord = history.find(record => record.id === gameId);
        
        if (gameRecord) {
            // 将完整的游戏状态设置到localStorage，与game.js的loadFromContinueState方法匹配
            const gameState = {
                player: gameRecord.player,
                world: gameRecord.world,
                storyHistory: gameRecord.storyHistory || [],
                gameId: gameRecord.id,
                choices: [{ text: "继续探索", event: 'explore' }],
                // 保持其他可能的状态数据
                background: gameRecord.background,
                attributes: gameRecord.attributes
            };
            
            // 设置继续游戏的标记
            localStorage.setItem('continueGameState', JSON.stringify(gameState));
            
            // 跳转到游戏页面
            window.location.href = 'index.html';
        }
    }

    // 删除历史记录
    deleteHistoryRecord(gameId) {
        const historyKey = 'cultivationGameHistory';
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history = history.filter(record => record.id !== gameId);
        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    // 清空所有历史记录
    clearAllHistory() {
        // 只清除历史记录，其他数据保持不变
        localStorage.removeItem('cultivationGameHistory');
        
        // 重新加载历史记录列表
        this.loadHistoryList();
        
        // 显示清空成功提示
        alert('✅ 历史记录已清空！');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HistoryManager();
});