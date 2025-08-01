function saveGame(state) {
    const gameState = {
        ...state,
        choices: state.choices || [{ text: "继续探索", event: 'explore' }]
    };
    localStorage.setItem('randomCultivationGameSave', JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem('randomCultivationGameSave');
    if (savedState) {
        const state = JSON.parse(savedState);
        // Ensure necessary properties exist
        if (!state.storyHistory) state.storyHistory = [];
        if (!state.gameId) state.gameId = Date.now();
        if (!state.choices) state.choices = [{ text: "继续探索", event: 'explore' }];
        return state;
    }
    return null;
}

function saveToHistory(state) {
    if (!state.player || state.player.name === "无名者") {
        return;
    }

    const historyKey = 'cultivationGameHistory';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    const gameRecord = {
        id: state.gameId,
        player: { ...state.player },
        world: { ...state.world },
        storyHistory: [...state.storyHistory],
        background: state.background,
        attributes: state.attributes,
        choices: state.choices || [{ text: "继续探索", event: 'explore' }],
        timestamp: Date.now(),
        title: `${state.player.name}的修仙之路`
    };

    const existingIndex = history.findIndex(record => record.id === state.gameId);
    if (existingIndex !== -1) {
        history[existingIndex] = gameRecord;
    } else {
        history.unshift(gameRecord);
    }

    if (history.length > 50) {
        history.splice(50);
    }

    localStorage.setItem(historyKey, JSON.stringify(history));
}

function exportProgress(state) {
    const gameData = {
        ...state,
        exportTime: new Date().toISOString(),
        version: "1.0"
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `修仙存档_${state.player.name}_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
}

function importProgress(event, currentState, callback) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const gameData = JSON.parse(e.target.result);
            
            if (!gameData.player || !gameData.world) {
                throw new Error('存档文件格式不正确');
            }
            
            const newState = {
                ...gameData,
                apiKey: currentState.apiKey,
                baseUrl: currentState.baseUrl
            };
            
            if (!newState.choices) {
                newState.choices = [{ text: "继续探索", event: 'explore' }];
            }
            
            callback(newState);
            
        } catch (error) {
            alert(`导入失败: ${error.message}`);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

function createNewGameState(savedState) {
    const system = getRandomElement(cultivationSystems);
    const locations = ["茅草屋", "山洞", "城市下水道", "皇家图书馆", "粪坑旁", "星际飞船驾驶舱", "断崖之巅"];
    const eras = ["太古洪荒", "上古神话", "中古魔法", "近古武侠", "现代都市", "未来纪元"];

    const newState = {
        player: {
            name: "无名者",
            age: 16,
            system: system.systemName,
            rankIndex: 0,
        },
        world: {
            location: getRandomElement(locations),
            era: getRandomElement(eras),
            year: 1,
        },
        choices: [],
        apiKey: null,
        baseUrl: null,
        playerName: null,
        storyHistory: [],
        gameId: Date.now(),
    };

    if (savedState) {
        const oldState = JSON.parse(savedState);
        if (oldState.apiKey) newState.apiKey = oldState.apiKey;
        if (oldState.baseUrl) newState.baseUrl = oldState.baseUrl;
        if (oldState.playerName) {
            newState.playerName = oldState.playerName;
            newState.player.name = oldState.playerName;
        }
    }
    
    return newState;
}

function generateRandomStartEvent(state) {
    const { world } = state;
    
    const backgrounds = {
        出身: ["平民", "贵族", "孤儿", "商人之子", "武者后代", "学者世家", "神秘血脉"],
        金手指: ["系统", "老爷爷", "神秘功法", "特殊体质", "前世记忆", "神器", "无"],
        性格: ["谨慎", "冲动", "聪明", "憨厚", "狡猾", "正直", "冷漠"],
        世界: ["仙侠", "玄幻", "武侠", "都市修仙", "星际修真", "末世求生", "异界"]
    };

    const background = {
        出身: getRandomElement(backgrounds.出身),
        金手指: getRandomElement(backgrounds.金手指),
        性格: getRandomElement(backgrounds.性格),
        世界: getRandomElement(backgrounds.世界)
    };

    const attributes = {
        气运: Math.floor(Math.random() * 50) + 25,
        修为: 10,
        声望: 0,
        财富: Math.floor(Math.random() * 100) + 50,
        人脉: Math.floor(Math.random() * 20) + 10
    };

    state.background = background;
    state.attributes = attributes;

    const startEvents = [
        `在${world.era}时期的${world.location}，一个${background.出身}出身的少年悄然苏醒。他拥有${background.金手指}的奇遇，性格${background.性格}。命运的齿轮开始转动...`,
        `${world.era}的风云变幻中，${world.location}里诞生了一个注定不凡的存在。${background.出身}的身份，${background.金手指}的机缘，${background.性格}的性情，一切都预示着传奇的开始。`,
        `时值${world.era}，${world.location}中一道身影缓缓睁开双眼。${background.出身}的过往，${background.金手指}的际遇，${background.性格}的本性，将如何书写这个${background.世界}世界的新篇章？`,
        `在这个${background.世界}的世界里，${world.era}时期的${world.location}见证了一个新的开始。一个${background.出身}少年，带着${background.金手指}的秘密，以${background.性格}的态度面对未知的修仙之路。`
    ];

    return getRandomElement(startEvents);
}