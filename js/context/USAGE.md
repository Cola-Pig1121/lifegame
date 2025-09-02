# 上下文感知奇遇与婚姻系统使用指南

## 系统概述

上下文感知奇遇与婚姻系统是一个智能化的游戏事件触发系统，它根据玩家的游戏行为、状态和环境动态触发奇遇和浪漫事件。

## 快速开始

### 1. 引入系统文件

在HTML文件中按顺序引入以下脚本：

```html
<!-- 错误处理 -->
<script src="js/context/ErrorHandler.js"></script>

<!-- 核心分析器 -->
<script src="js/context/ContextAnalyzer.js"></script>
<script src="js/context/RelationshipAnalyzer.js"></script>
<script src="js/context/WeightCalculator.js"></script>

<!-- 管理器 -->
<script src="js/context/ContextAdventureManager.js"></script>
<script src="js/context/ContextMarriageSystem.js"></script>

<!-- 主系统 -->
<script src="js/context/context-adventure-system.js"></script>

<!-- 初始化脚本 -->
<script src="js/context/init-context-system.js"></script>
```

### 2. 基本使用

系统会自动初始化，无需手动配置。初始化完成后，可以通过以下方式访问：

```javascript
// 获取系统统计
const stats = window.contextAdventureSystem.getStatistics();
console.log(stats);

// 获取当前上下文摘要
const summary = window.contextAdventureSystem.getContextSummary();
console.log(summary);
```

## 核心功能

### 上下文分析

系统会实时分析以下上下文信息：

- **玩家状态**：修为、财富、健康、声望
- **游戏进度**：主线任务、探索区域、成就
- **社交关系**：NPC好感度、门派关系、婚姻状态
- **时间因素**：游戏时间、季节、节日

### 奇遇触发

基于上下文分析，系统会智能触发以下类型的奇遇：

- **修为奇遇**：根据当前修为状态触发相关修炼事件
- **财富奇遇**：根据财富水平触发商机或破财事件
- **社交奇遇**：根据人际关系触发社交事件
- **探索奇遇**：根据探索区域触发发现事件

### 婚姻系统

智能的婚姻关系发展系统：

- **关系分析**：分析玩家与NPC的关系强度
- **兼容性计算**：计算性格、修为、背景的匹配度
- **阶段发展**：从相识→相知→相恋→订婚→结婚
- **周年纪念**：自动触发结婚纪念日事件

## 配置选项

### 系统配置

```javascript
// 更新系统配置
window.contextAdventureSystem.updateConfig({
    checkInterval: 30000,  // 检查间隔（毫秒）
    adventure: {
        triggerChance: 0.1,  // 奇遇触发概率
        cooldown: 180000     // 奇遇冷却时间（毫秒）
    },
    marriage: {
        romanceChance: 0.05,  // 浪漫触发概率
        minRelationship: 60   // 最低关系要求
    }
});
```

### 权重配置

```javascript
// 自定义权重配置
window.contextAdventureSystem.weightCalculator.updateWeights({
    cultivation: 0.3,    // 修为权重
    wealth: 0.2,        // 财富权重
    health: 0.15,       // 健康权重
    reputation: 0.2,    // 声望权重
    relationships: 0.15 // 关系权重
});
```

## 事件监听

### 监听奇遇事件

```javascript
document.addEventListener('contextAdventure', (event) => {
    const { adventure } = event.detail;
    console.log('新奇遇触发:', adventure.name);
    
    // 自定义处理逻辑
    handleCustomAdventure(adventure);
});
```

### 监听浪漫事件

```javascript
document.addEventListener('contextRomance', (event) => {
    const { romance } = event.detail;
    console.log('浪漫事件触发:', romance.name);
    
    // 显示浪漫通知
    showRomanceNotification(romance);
});
```

## 调试工具

### 调试命令

系统提供以下调试命令（在游戏控制台中执行）：

```javascript
// 查看系统统计
context-stats

// 强制触发奇遇检查
force-adventure

// 重置系统
reset-context
```

### 开发调试

```javascript
// 启用详细日志
window.contextAdventureSystem.errorHandler.setLogging(true);

// 获取错误报告
const report = window.contextAdventureSystem.errorHandler.exportReport();
console.log(report);

// 获取错误日志
const errors = window.contextAdventureSystem.errorHandler.getErrorLog(10);
console.log(errors);
```

## 集成示例

### 与现有游戏集成

```javascript
// 在游戏管理器中初始化
class GameManager {
    async init() {
        // 等待上下文系统初始化
        await waitForContextSystem();
        
        // 注册系统
        this.registerSystem({
            name: 'ContextAdventureSystem',
            instance: window.contextAdventureSystem
        });
    }
}

// 等待系统初始化完成
function waitForContextSystem() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.contextAdventureSystem && window.contextAdventureSystem.initialized) {
                resolve();
            } else {
                setTimeout(check, 100);
            }
        };
        check();
    });
}
```

### 自定义奇遇处理

```javascript
// 自定义奇遇处理器
function handleCustomAdventure(adventure) {
    // 显示自定义界面
    showCustomAdventureUI(adventure);
    
    // 处理玩家选择
    adventure.choices.forEach(choice => {
        choice.onSelect = () => {
            // 应用选择效果
            applyChoiceEffects(choice.effects);
            
            // 更新上下文系统
            window.contextAdventureSystem.onPlayerAction({
                type: 'adventure_choice',
                choice: choice,
                adventure: adventure
            });
        };
    });
}
```

## 常见问题

### Q: 系统没有触发任何奇遇

A: 检查以下几点：
1. 确认系统已初始化 (`window.contextAdventureSystem.initialized === true`)
2. 检查系统是否启用 (`window.contextAdventureSystem.systemState.enabled === true`)
3. 查看统计信息确认检查次数是否增加
4. 检查错误日志是否有异常

### Q: 如何手动触发奇遇

A: 使用调试命令：
```javascript
window.contextAdventureSystem.forceCheck();
```

### Q: 如何查看当前上下文

A: 
```javascript
const summary = window.contextAdventureSystem.getContextSummary();
console.log('当前上下文:', summary);
```

## 性能优化

### 减少检查频率

```javascript
// 降低检查频率以减少性能消耗
window.contextAdventureSystem.updateConfig({
    checkInterval: 120000  // 改为2分钟检查一次
});
```

### 禁用日志

```javascript
// 生产环境禁用日志
window.contextAdventureSystem.errorHandler.setLogging(false);
```

## 扩展开发

### 添加新的上下文因子

```javascript
// 扩展ContextAnalyzer
ContextAnalyzer.prototype.getNewContextFactor = function() {
    // 返回新的上下文因子值
    return this.calculateNewFactor();
};

// 更新权重配置
window.contextAdventureSystem.weightCalculator.addContextFactor('newFactor', 0.1);
```

### 添加新的奇遇类型

```javascript
// 扩展ContextAdventureManager
ContextAdventureManager.prototype.addAdventureType = function(type, config) {
    this.adventureTypes[type] = config;
};
```

## 版本信息

- 版本：1.0.0
- 作者：AI Assistant
- 最后更新：2024
- 兼容性：现代浏览器、移动端

## 技术支持

如遇到问题，请：
1. 查看浏览器控制台错误信息
2. 使用调试命令获取系统状态
3. 检查网络连接和存储空间
4. 联系技术支持提供错误报告