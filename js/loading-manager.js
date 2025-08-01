/**
 * 加载动画管理器
 * 负责显示和隐藏加载动画，以及管理加载提示
 */
class LoadingManager {
  constructor() {
    this.overlay = null;
    this.spinner = null;
    this.textElement = null;
    this.tipsElement = null;
    this.tipsInterval = null;
    this.isVisible = false;
    
    // 修仙主题的加载提示
    this.loadingTips = [
      "正在感应天地灵气...",
      "正在推演命运轨迹...",
      "正在参悟天机玄妙...",
      "正在沟通冥冥之中的大道...",
      "正在凝聚道韵...",
      "正在勾连天地法则...",
      "正在解析命运长河...",
      "正在聆听天道之音...",
      "正在汲取宇宙本源...",
      "正在推演因果关系...",
      "正在感知命运节点...",
      "正在解析天机密码...",
      "正在沟通先祖智慧...",
      "正在凝聚心神...",
      "正在调和阴阳五行..."
    ];
    
    this.createElements();
  }
  
  /**
   * 创建加载动画的DOM元素
   */
  createElements() {
    // 创建遮罩层
    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.style.display = 'none';
    
    // 创建旋转加载图标
    this.spinner = document.createElement('div');
    this.spinner.className = 'loading-spinner';
    
    // 创建加载文本
    this.textElement = document.createElement('div');
    this.textElement.className = 'loading-text';
    this.textElement.textContent = '正在沟通天机...';
    
    // 创建提示容器
    const tipsContainer = document.createElement('div');
    tipsContainer.className = 'loading-tips-container';
    
    // 创建提示文本
    this.tipsElement = document.createElement('div');
    this.tipsElement.className = 'loading-tips';
    
    // 添加响应式字体调整
    this.addResponsiveFontHandling();
    
    // 组装DOM结构
    tipsContainer.appendChild(this.tipsElement);
    this.overlay.appendChild(this.spinner);
    this.overlay.appendChild(this.textElement);
    this.overlay.appendChild(tipsContainer);
    
    // 添加到body
    document.body.appendChild(this.overlay);
  }
  
  /**
   * 显示加载动画
   * @param {string} text - 加载文本
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Promise} - 返回一个Promise，在延迟结束后resolve
   */
  show(text = '正在沟通天机...', delay = 0) {
    return new Promise((resolve) => {
      this.textElement.textContent = text;
      this.overlay.style.display = 'flex';
      this.overlay.classList.add('fade-in');
      this.overlay.classList.remove('fade-out');
      this.isVisible = true;
      
      // 启动提示轮播
      this.startTipsRotation();
      
      // 如果有延迟，则等待指定时间后resolve
      if (delay > 0) {
        setTimeout(() => {
          resolve();
        }, delay);
      } else {
        resolve();
      }
    });
  }
  
  /**
   * 隐藏加载动画
   */
  hide() {
    this.overlay.classList.add('fade-out');
    this.overlay.classList.remove('fade-in');
    
    // 停止提示轮播
    this.stopTipsRotation();
    
    // 等待淡出动画完成后隐藏元素
    setTimeout(() => {
      this.overlay.style.display = 'none';
      this.isVisible = false;
    }, 500);
  }
  
  /**
   * 更新加载文本
   * @param {string} text - 新的加载文本
   */
  updateText(text) {
    this.textElement.textContent = text;
  }
  
  /**
   * 启动提示轮播
   */
  startTipsRotation() {
    // 先清除可能存在的定时器
    this.stopTipsRotation();
    
    // 显示第一条提示
    this.showRandomTip();
    
    // 设置定时器，每4秒更换一条提示
    this.tipsInterval = setInterval(() => {
      this.showRandomTip();
    }, 4000);
  }
  
  /**
   * 停止提示轮播
   */
  stopTipsRotation() {
    if (this.tipsInterval) {
      clearInterval(this.tipsInterval);
      this.tipsInterval = null;
    }
  }
  
  /**
   * 显示随机提示
   */
  showRandomTip() {
    const randomIndex = Math.floor(Math.random() * this.loadingTips.length);
    this.tipsElement.textContent = this.loadingTips[randomIndex];
    
    // 添加淡入效果
    this.tipsElement.classList.remove('fade-in');
    void this.tipsElement.offsetWidth; // 触发重排，重置动画
    this.tipsElement.classList.add('fade-in');
  }
  
  /**
   * 检查加载动画是否可见
   * @returns {boolean} - 是否可见
   */
  isLoading() {
    return this.isVisible;
  }
  
  /**
   * 添加响应式字体处理
   * 根据屏幕宽度动态调整字体大小和内容显示
   */
  addResponsiveFontHandling() {
    // 初始调整
    this.adjustFontSize();
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      this.adjustFontSize();
    });
  }
  
  /**
   * 根据屏幕宽度调整字体大小和内容显示
   */
  adjustFontSize() {
    const screenWidth = window.innerWidth;
    
    if (screenWidth <= 480) {
      // 手机屏幕
      this.textElement.style.fontSize = '0.9rem';
      this.textElement.style.maxWidth = '90%';
      this.textElement.style.padding = '0 10px';
      this.tipsElement.style.fontSize = '0.8rem';
      this.tipsElement.style.maxWidth = '90%';
      this.tipsElement.style.padding = '0 10px';
    } else if (screenWidth <= 768) {
      // 平板屏幕
      this.textElement.style.fontSize = '1rem';
      this.textElement.style.maxWidth = '85%';
      this.textElement.style.padding = '0 15px';
      this.tipsElement.style.fontSize = '0.9rem';
      this.tipsElement.style.maxWidth = '85%';
      this.tipsElement.style.padding = '0 15px';
    } else {
      // 桌面屏幕
      this.textElement.style.fontSize = '1.2rem';
      this.textElement.style.maxWidth = '80%';
      this.textElement.style.padding = '0 20px';
      this.tipsElement.style.fontSize = '1rem';
      this.tipsElement.style.maxWidth = '80%';
      this.tipsElement.style.padding = '0 20px';
    }
    
    // 确保文本不会被截断
    this.textElement.style.overflow = 'hidden';
    this.textElement.style.textOverflow = 'ellipsis';
    this.textElement.style.whiteSpace = 'normal';
    this.tipsElement.style.overflow = 'hidden';
    this.tipsElement.style.textOverflow = 'ellipsis';
    this.tipsElement.style.whiteSpace = 'normal';
  }
}

// 创建全局加载管理器实例
window.loadingManager = new LoadingManager();
