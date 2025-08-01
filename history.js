class HistoryManager {
    constructor() {
        this.elements = {
            historyList: document.getElementById('history-list'),
            backToGameBtn: document.getElementById('back-to-game-btn'),
            clearAllBtn: document.getElementById('clear-all-btn'),
            detailsModal: document.getElementById('details-modal'),
            modalTitle: document.getElementById('modal-title'),
            modalBody: document.getElementById('modal-body'),
            closeButton: document.querySelector('.close-button')
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

        this.elements.closeButton.addEventListener('click', () => {
            this.hideDetailsModal();
        });

        window.addEventListener('click', (event) => {
            if (event.target == this.elements.detailsModal) {
                this.hideDetailsModal();
            }
        });
    }

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

        history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        history.forEach(record => {
            const card = document.createElement('div');
            card.className = 'history-card';
            
            const playerSystem = cultivationSystems.find(s => s.systemName === record.player.system);
            const rankName = playerSystem ? playerSystem.ranks[record.player.rankIndex].name : '未知';
            
            card.innerHTML = `
                <div class="history-card-title">${record.title || `${record.player.name}的修仙之路`}</div>
                <div class="history-card-info">
                    <div>修炼体系：${record.player.system}</div>
                    <div>当前境界：${rankName}</div>
                    <div>修炼年龄：${record.player.age}岁</div>
                    <div>所在地点：${record.world.location}</div>
                    <div>保存时间：${new Date(record.timestamp).toLocaleString()}</div>
                </div>
                <div class="history-card-actions">
                    <button class="continue-btn" data-game-id="${record.id}">继续游戏</button>
                    <button class="details-btn" data-game-id="${record.id}">查看详情</button>
                    <button class="delete-btn" data-game-id="${record.id}">删除记录</button>
                </div>
            `;

            const continueBtn = card.querySelector('.continue-btn');
            const deleteBtn = card.querySelector('.delete-btn');
            const detailsBtn = card.querySelector('.details-btn');
            
            continueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.continueGame(record.id);
            });

            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个历史记录吗？')) {
                    this.deleteHistoryRecord(record.id);
                    this.loadHistoryList();
                }
            });

            detailsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDetailsModal(record);
            });

            this.elements.historyList.appendChild(card);
        });
    }

    showDetailsModal(record) {
        this.elements.modalTitle.textContent = `${record.title || `${record.player.name}的修仙之路`} - 事件详情`;
        this.elements.modalBody.innerHTML = '';

        if (record.storyHistory && record.storyHistory.length > 0) {
            record.storyHistory.forEach(entry => {
                const p = document.createElement('p');
                p.innerHTML = entry.event;
                this.elements.modalBody.appendChild(p);
            });
        } else {
            this.elements.modalBody.innerHTML = '<p>此存档无详细事件记录。</p>';
        }

        this.elements.detailsModal.style.display = 'block';
    }

    hideDetailsModal() {
        this.elements.detailsModal.style.display = 'none';
    }

    continueGame(gameId) {
        const historyKey = 'cultivationGameHistory';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const gameRecord = history.find(record => record.id === gameId);
        
        if (gameRecord) {
            const gameState = {
                player: gameRecord.player,
                world: gameRecord.world,
                storyHistory: gameRecord.storyHistory || [],
                gameId: gameRecord.id,
                choices: [{ text: "继续探索", event: 'explore' }],
                background: gameRecord.background,
                attributes: gameRecord.attributes
            };
            
            localStorage.setItem('continueGameState', JSON.stringify(gameState));
            window.location.href = 'index.html';
        }
    }

    deleteHistoryRecord(gameId) {
        const historyKey = 'cultivationGameHistory';
        let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        history = history.filter(record => record.id !== gameId);
        localStorage.setItem(historyKey, JSON.stringify(history));
    }

    clearAllHistory() {
        localStorage.removeItem('cultivationGameHistory');
        this.loadHistoryList();
        alert('✅ 历史记录已清空！');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HistoryManager();
});