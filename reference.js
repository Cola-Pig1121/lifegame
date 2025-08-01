class ReferenceManager {
    constructor() {
        this.elements = {
            backToGameBtn: document.getElementById('back-to-game-btn')
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.elements.backToGameBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new ReferenceManager();
});