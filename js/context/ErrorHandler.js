/**
 * 统一错误处理模块
 * 为上下文感知奇遇和婚姻系统提供集中化的错误处理和日志记录
 */
class ErrorHandler {
    constructor(componentName = 'Unknown') {
        this.componentName = componentName;
        this.errorLog = [];
        this.maxLogSize = 100;
        this.enableLogging = true;
        
        // 错误类型定义
        this.errorTypes = {
            VALIDATION: 'VALIDATION_ERROR',
            NETWORK: 'NETWORK_ERROR',
            STORAGE: 'STORAGE_ERROR',
            CALCULATION: 'CALCULATION_ERROR',
            CONTEXT: 'CONTEXT_ERROR',
            MARRIAGE: 'MARRIAGE_ERROR',
            UNKNOWN: 'UNKNOWN_ERROR'
        };
    }

    /**
     * 处理错误
     * @param {Error} error - 错误对象
     * @param {string} context - 错误上下文
     * @param {Object} additionalData - 额外数据
     */
    handle(error, context = '', additionalData = {}) {
        const errorInfo = this.createErrorInfo(error, context, additionalData);
        
        // 记录错误
        this.logError(errorInfo);
        
        // 根据错误类型采取不同处理策略
        this.handleByType(errorInfo);
        
        // 触发错误事件
        this.triggerErrorEvent(errorInfo);
        
        return errorInfo;
    }

    /**
     * 创建错误信息对象
     * @private
     */
    createErrorInfo(error, context, additionalData) {
        const errorInfo = {
            id: this.generateErrorId(),
            timestamp: Date.now(),
            component: this.componentName,
            context: context,
            message: error.message || 'Unknown error',
            type: this.determineErrorType(error),
            stack: error.stack || '',
            additionalData: additionalData,
            severity: this.determineSeverity(error),
            handled: false
        };
        
        return errorInfo;
    }

    /**
     * 确定错误类型
     * @private
     */
    determineErrorType(error) {
        const message = error.message || '';
        
        if (message.includes('validation') || message.includes('invalid')) {
            return this.errorTypes.VALIDATION;
        }
        
        if (message.includes('network') || message.includes('connection')) {
            return this.errorTypes.NETWORK;
        }
        
        if (message.includes('storage') || message.includes('save') || message.includes('load')) {
            return this.errorTypes.STORAGE;
        }
        
        if (message.includes('calculation') || message.includes('math')) {
            return this.errorTypes.CALCULATION;
        }
        
        if (message.includes('context') || message.includes('relationship')) {
            return this.errorTypes.CONTEXT;
        }
        
        if (message.includes('marriage') || message.includes('romance')) {
            return this.errorTypes.MARRIAGE;
        }
        
        return this.errorTypes.UNKNOWN;
    }

    /**
     * 确定错误严重程度
     * @private
     */
    determineSeverity(error) {
        if (error instanceof TypeError || error instanceof ReferenceError) {
            return 'HIGH';
        }
        
        if (error.message && error.message.includes('critical')) {
            return 'CRITICAL';
        }
        
        return 'MEDIUM';
    }

    /**
     * 记录错误日志
     * @private
     */
    logError(errorInfo) {
        if (!this.enableLogging) return;
        
        this.errorLog.unshift(errorInfo);
        
        // 限制日志大小
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
        
        // 控制台输出（开发环境）
        if (this.isDevelopment()) {
            console.error(`[${this.componentName}] Error:`, errorInfo);
        }
    }

    /**
     * 根据错误类型处理
     * @private
     */
    handleByType(errorInfo) {
        switch (errorInfo.type) {
            case this.errorTypes.VALIDATION:
                this.handleValidationError(errorInfo);
                break;
            case this.errorTypes.NETWORK:
                this.handleNetworkError(errorInfo);
                break;
            case this.errorTypes.STORAGE:
                this.handleStorageError(errorInfo);
                break;
            case this.errorTypes.CALCULATION:
                this.handleCalculationError(errorInfo);
                break;
            case this.errorTypes.CONTEXT:
                this.handleContextError(errorInfo);
                break;
            case this.errorTypes.MARRIAGE:
                this.handleMarriageError(errorInfo);
                break;
            default:
                this.handleGenericError(errorInfo);
        }
    }

    /**
     * 处理验证错误
     * @private
     */
    handleValidationError(errorInfo) {
        errorInfo.handled = true;
        // 验证错误通常可以继续运行，记录即可
    }

    /**
     * 处理网络错误
     * @private
     */
    handleNetworkError(errorInfo) {
        errorInfo.handled = true;
        // 网络错误可以重试或降级处理
        errorInfo.retry = true;
        errorInfo.retryCount = 0;
    }

    /**
     * 处理存储错误
     * @private
     */
    handleStorageError(errorInfo) {
        errorInfo.handled = true;
        // 存储错误可能导致数据丢失，需要警告用户
        this.notifyUser('数据保存失败，请检查存储空间', 'warning');
    }

    /**
     * 处理计算错误
     * @private
     */
    handleCalculationError(errorInfo) {
        errorInfo.handled = true;
        // 计算错误使用默认值
        errorInfo.defaultValue = 0;
    }

    /**
     * 处理上下文错误
     * @private
     */
    handleContextError(errorInfo) {
        errorInfo.handled = true;
        // 上下文错误可能影响游戏体验，需要降级处理
        errorInfo.fallback = true;
    }

    /**
     * 处理婚姻系统错误
     * @private
     */
    handleMarriageError(errorInfo) {
        errorInfo.handled = true;
        // 婚姻系统错误需要特殊处理，避免影响主游戏
        this.notifyUser('婚姻系统出现错误，请联系管理员', 'error');
    }

    /**
     * 处理通用错误
     * @private
     */
    handleGenericError(errorInfo) {
        errorInfo.handled = true;
        // 通用错误记录并通知
        this.notifyUser('系统出现错误，请稍后重试', 'error');
    }

    /**
     * 触发错误事件
     * @private
     */
    triggerErrorEvent(errorInfo) {
        try {
            const event = new CustomEvent('systemError', {
                detail: errorInfo,
                bubbles: true,
                cancelable: true
            });
            
            if (typeof document !== 'undefined') {
                document.dispatchEvent(event);
            }
        } catch (error) {
            // 事件系统错误，静默处理
        }
    }

    /**
     * 通知用户
     * @private
     */
    notifyUser(message, type = 'info') {
        try {
            if (typeof window !== 'undefined' && window.gameManager) {
                // 使用游戏管理器通知
                if (window.gameManager.showMessage) {
                    window.gameManager.showMessage(message, type);
                }
            } else {
                // 降级到alert
                if (type === 'error') {
                    alert(message);
                }
            }
        } catch (error) {
            // 通知系统错误，静默处理
        }
    }

    /**
     * 生成错误ID
     * @private
     */
    generateErrorId() {
        return `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 获取错误日志
     * @param {number} limit - 限制返回数量
     * @returns {Array} 错误日志
     */
    getErrorLog(limit = 50) {
        return this.errorLog.slice(0, limit);
    }

    /**
     * 获取特定类型的错误
     * @param {string} errorType - 错误类型
     * @returns {Array} 匹配的错误
     */
    getErrorsByType(errorType) {
        return this.errorLog.filter(error => error.type === errorType);
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const stats = {
            totalErrors: this.errorLog.length,
            errorTypes: {},
            severityCounts: {},
            lastError: this.errorLog[0] || null
        };
        
        this.errorLog.forEach(error => {
            stats.errorTypes[error.type] = (stats.errorTypes[error.type] || 0) + 1;
            stats.severityCounts[error.severity] = (stats.severityCounts[error.severity] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * 清除错误日志
     */
    clearLog() {
        this.errorLog = [];
    }

    /**
     * 设置日志开关
     * @param {boolean} enabled - 是否启用日志
     */
    setLogging(enabled) {
        this.enableLogging = enabled;
    }

    /**
     * 检查是否为开发环境
     * @private
     */
    isDevelopment() {
        try {
            return typeof window !== 'undefined' && 
                   (window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1');
        } catch (error) {
            return false;
        }
    }

    /**
     * 导出错误报告
     * @returns {string} JSON格式的错误报告
     */
    exportReport() {
        const report = {
            component: this.componentName,
            timestamp: Date.now(),
            statistics: this.getStatistics(),
            errors: this.errorLog
        };
        
        return JSON.stringify(report, null, 2);
    }

    /**
     * 重置错误处理器
     */
    reset() {
        this.errorLog = [];
        this.enableLogging = true;
    }
}