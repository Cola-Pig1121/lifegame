function getElementsById(ids) {
    const elements = {};
    for (const key in ids) {
        elements[key] = document.getElementById(ids[key]);
    }
    return elements;
}

async function displayEvent(elements, text, choices = []) {
    const p = document.createElement('p');
    elements.eventLog.appendChild(p);
    if (typeof typewriterEffect === 'function') {
        await typewriterEffect(p, text);
    } else {
        p.innerHTML = text;
    }
    elements.eventLog.scrollTop = elements.eventLog.scrollHeight;
    
    // 延迟渲染选项，确保自动保存先完成
    setTimeout(() => {
        renderChoices(elements, choices);
    }, 100);
}

function renderChoices(elements, choices) {
    elements.choicesContainer.innerHTML = '';
    if (!choices || choices.length === 0) return;

    choices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.className = 'choice-button';
        button.dataset.index = index;
        button.textContent = choice.text;
        elements.choicesContainer.appendChild(button);
    });
}

function updateStatus(elements, state) {
    const { player, world, attributes } = state;
    
    if (!player || !world) {
        console.error('Missing player or world data:', { player, world });
        return;
    }

    // 确保 cultivationSystems 已加载
    if (typeof cultivationSystems === 'undefined') {
        console.error('cultivationSystems not loaded');
        return;
    }

    const playerSystem = cultivationSystems.find(s => s.systemName === player.system);
    if (!playerSystem) {
        console.error('Player system not found:', player.system);
        return;
    }
    
    const rankName = playerSystem.ranks[player.rankIndex]?.name || '未知境界';

    let playerStatusText = `姓名: ${player.name}\n体系: ${player.system}\n境界: ${rankName}\n年龄: ${player.age}`;
    
    // 修复属性面板显示逻辑 - 优先从state.attributes获取，然后从player.attributes获取
    if (attributes && Object.keys(attributes).length > 0) {
        playerStatusText += '\n\n【属性面板】';
        Object.entries(attributes).forEach(([key, value]) => {
            playerStatusText += `\n${key}: ${value}`;
        });
    } else if (player.attributes && Object.keys(player.attributes).length > 0) {
        playerStatusText += '\n\n【属性面板】';
        Object.entries(player.attributes).forEach(([key, value]) => {
            playerStatusText += `\n${key}: ${value}`;
        });
    } else if (player.health !== undefined || player.mana !== undefined || player.cultivation !== undefined) {
        // 兼容旧版本的属性结构
        playerStatusText += '\n\n【属性面板】';
        if (player.health !== undefined) playerStatusText += `\n生命值: ${player.health}`;
        if (player.mana !== undefined) playerStatusText += `\n灵力: ${player.mana}`;
        if (player.cultivation !== undefined) playerStatusText += `\n修为: ${player.cultivation}`;
        if (player.experience !== undefined) playerStatusText += `\n经验: ${player.experience}`;
        if (player.money !== undefined) playerStatusText += `\n灵石: ${player.money}`;
    }

    // 确保元素存在
    if (elements.playerStatus && elements.worldStatus) {
        elements.playerStatus.innerText = playerStatusText;
        elements.worldStatus.innerText = `地点: ${world.location}\n时期: ${world.era}\n年份: ${world.year}`;
    } else {
        console.error('Status elements not found:', { 
            playerStatus: elements.playerStatus, 
            worldStatus: elements.worldStatus 
        });
    }
}

function showSettingsModal(elements, state, isForceMode = false, isNewStory = false) {
    // 如果state中没有API配置，尝试从localStorage加载
    let baseUrl = state.baseUrl || '';
    let apiKey = state.apiKey || '';
    let model = state.model || '';
    
    if (!baseUrl || !apiKey) {
        const savedState = localStorage.getItem('cultivationGameSave');
        if (savedState) {
            try {
                const saveData = JSON.parse(savedState);
                baseUrl = baseUrl || saveData.baseUrl || '';
                apiKey = apiKey || saveData.apiKey || '';
                model = model || saveData.model || '';
            } catch (error) {
                console.error('解析保存的API配置失败:', error);
            }
        }
    }
    
    updateCurrentSettings(elements, { baseUrl, apiKey, model });
    elements.baseUrlInput.value = baseUrl;
    elements.apiKeyInput.value = apiKey;
    elements.playerNameInput.value = state.playerName || state.player?.name || '';
    
    // 初始化模型选择 - 现在会自动根据Base URL设置模型
    updateModelOptions(elements, baseUrl);
    
    // 如果有保存的模型，设置为选中状态
    if (model && elements.modelSelect.querySelector(`option[value="${model}"]`)) {
        elements.modelSelect.value = model;
    }
    
    // 设置新故事模式标记
    elements.settingsModal.dataset.newStory = isNewStory ? 'true' : 'false';
    
    // 获取模态框内容元素
    const modalContent = elements.settingsModal.querySelector('.modal-content');
    
    // 如果是强制模式（开始探索前）或新故事模式
    if (isForceMode || isNewStory) {
        // 显示"开始探索"和"测试连接"按钮
        elements.startExploreBtn.style.display = 'inline-block';
        elements.testConnectionBtn.style.display = 'inline-block';
        
        // 隐藏"保存配置"和"取消"按钮
        elements.saveSettingsBtn.style.display = 'none';
        elements.cancelSettingsBtn.style.display = 'none';
        
        // 添加提示文本
        let forceHint = modalContent.querySelector('.force-hint');
        if (!forceHint) {
            forceHint = document.createElement('p');
            forceHint.className = 'force-hint';
            forceHint.style.color = '#ff6b6b';
            forceHint.style.fontWeight = 'bold';
            forceHint.style.marginBottom = '15px';
            
            if (isNewStory) {
                forceHint.textContent = '⚠️ 开始新故事前请设置角色名字';
            } else {
                forceHint.textContent = '⚠️ 开始探索前需要先配置API设置和角色名字';
            }
            
            modalContent.insertBefore(forceHint, modalContent.querySelector('.settings-form'));
        } else {
            // 更新提示文本
            if (isNewStory) {
                forceHint.textContent = '⚠️ 开始新故事前请设置角色名字';
            } else {
                forceHint.textContent = '⚠️ 开始探索前需要先配置API设置和角色名字';
            }
        }
    } else {
        // 普通设置模式
        elements.startExploreBtn.style.display = 'none';
        elements.testConnectionBtn.style.display = 'inline-block';
        elements.saveSettingsBtn.style.display = 'inline-block';
        elements.cancelSettingsBtn.style.display = 'inline-block';
        
        // 移除提示文本
        const forceHint = modalContent.querySelector('.force-hint');
        if (forceHint) {
            forceHint.remove();
        }
    }
    
    elements.settingsModal.style.display = 'flex';
}

function hideSettingsModal(elements) {
    elements.settingsModal.style.display = 'none';
}

function updateCurrentSettings(elements, state) {
    elements.currentBaseUrl.textContent = state.baseUrl || '未设置';
    elements.currentModel.textContent = state.model || '未设置';
    elements.currentApiKey.textContent = state.apiKey ? '已设置 (****)' : '未设置';
}

function updateModelOptions(elements, baseUrl) {
    const modelSelect = elements.modelSelect;
    modelSelect.innerHTML = '';
    
    if (!baseUrl || !autoModelMapping[baseUrl]) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = '请先选择Base URL';
        modelSelect.appendChild(option);
        return;
    }
    
    // 根据Base URL自动设置对应的模型
    const modelValue = autoModelMapping[baseUrl];
    const displayName = modelDisplayNames[modelValue] || modelValue;
    
    const option = document.createElement('option');
    option.value = modelValue;
    option.textContent = displayName;
    option.selected = true;
    modelSelect.appendChild(option);
    
    // 自动选中该模型
    modelSelect.value = modelValue;
}

function toggleApiKeyVisibility(elements) {
    const input = elements.apiKeyInput;
    const button = elements.toggleKeyVisibility;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
        `;
    } else {
        input.type = 'password';
        button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `;
    }
}

function showNewGameConfirm(elements) {
    elements.confirmModal.style.display = 'flex';
}

function hideConfirmModal(elements) {
    elements.confirmModal.style.display = 'none';
}

function generateRandomName() {
    const surnames = ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
    const names = ['逍遥', '无极', '天行', '破军', '星河', '凌云', '飞羽', '剑心', '道玄', '无尘', '清风', '明月', '紫霄', '青云', '玄机', '天启', '神武', '圣手', '绝影', '惊鸿'];
    
    const surname = surnames[Math.floor(Math.random() * surnames.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    
    return surname + name;
}
