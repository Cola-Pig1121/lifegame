class ReferenceManager {
    constructor() {
        this.elements = {
            backToGameBtn: document.getElementById('back-to-game-btn'),
            referenceContainer: document.getElementById('reference-container')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateReferenceContent();
    }

    setupEventListeners() {
        this.elements.backToGameBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    generateReferenceContent() {
        if (!cultivationSystems || cultivationSystems.length === 0) {
            this.elements.referenceContainer.innerHTML = '<p>体系数据加载失败</p>';
            return;
        }

        let html = '';
        
        cultivationSystems.forEach(system => {
            html += `
                <div class="system-section">
                    <h3 class="system-title">${system.systemName}</h3>
                    <p class="system-description">${system.description}</p>
                    <div class="ranks-table">
                        <div class="table-header">
                            <div class="rank-name">境界</div>
                            <div class="rank-method">修炼方法</div>
                            <div class="rank-difficulty">难度</div>
                            <div class="rank-bottleneck">瓶颈</div>
                            <div class="rank-resources">所需资源</div>
                            <div class="rank-comparison">对比</div>
                        </div>
            `;
            
            system.ranks.forEach(rank => {
                html += `
                    <div class="table-row">
                        <div class="rank-name">${rank.name}</div>
                        <div class="rank-method">${rank.method}</div>
                        <div class="rank-difficulty">${rank.difficulty}</div>
                        <div class="rank-bottleneck">${rank.bottleneck}</div>
                        <div class="rank-resources">${rank.resources}</div>
                        <div class="rank-comparison">${rank.comparison}</div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        this.elements.referenceContainer.innerHTML = html;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ReferenceManager();
});
