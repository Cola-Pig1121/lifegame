const elementIds = {
    eventLog: 'event-log',
    choicesContainer: 'choices-container',
    playerStatus: 'player-status',
    worldStatus: 'world-status',
    saveBtn: 'save-btn',
    loadBtn: 'load-btn',
    exportBtn: 'export-btn',
    importBtn: 'import-btn',
    importFile: 'import-file',
    newStoryBtn: 'new-story-btn',
    historyBtn: 'history-btn',
    referenceBtn: 'reference-btn',
    settingsBtn: 'settings-btn',
    confirmModal: 'confirm-modal',
    settingsModal: 'settings-modal',
    baseUrlInput: 'base-url-input',
    modelSelect: 'model-select',
    apiKeyInput: 'api-key-input',
    toggleKeyVisibility: 'toggle-key-visibility',
    currentBaseUrl: 'current-base-url',
    currentModel: 'current-model',
    currentApiKey: 'current-api-key',
    saveSettingsBtn: 'save-settings-btn',

    startExploreBtn: 'start-explore-btn',
    cancelSettingsBtn: 'cancel-settings-btn',
    playerNameInput: 'player-name-input',
    randomNameBtn: 'random-name-btn',
    saveAndStartBtn: 'save-and-start-btn',
    directStartBtn: 'direct-start-btn',
    cancelStartBtn: 'cancel-start-btn',
};

// 自动模型配置映射 - 根据Base URL自动设置对应模型
const autoModelMapping = {
    'https://api-inference.modelscope.cn/v1/chat/completions': 'deepseek-ai/DeepSeek-V3',
    'https://router.huggingface.co/v1/chat/completions': 'moonshotai/Kimi-K2-Instruct:novita'
};

// 获取Base URL对应的模型名称显示
const modelDisplayNames = {
    'deepseek-ai/DeepSeek-V3': 'DeepSeekV3',
    'moonshotai/Kimi-K2-Instruct:novita': 'Kimi'
};
