/**
 * 修仙人生游戏提示词模板
 * 根据story.json和体系.md总结的完整提示词
 */

// 获取提示词模板
function getPromptTemplate(playerName, currentSystem, currentState, previousEvents, location, year) {
    // 基础背景设定
    const backgroundPrompt = `
你是一个修仙人生模拟游戏的AI故事生成器。请根据以下信息生成一段简短的修仙故事情节和选择项。

## 游戏背景
这是一个包含多种修炼体系的奇幻世界，玩家可以在修真、武侠、国术、斗气、武魂、洪荒、魔法、西方剑士、茅山道术、文位、忍术等体系中修炼。
每个体系有其独特的境界、修炼方式、进阶难度和突破瓶颈。

## 当前角色信息
- 角色名: ${playerName}
- 修炼体系: ${currentSystem}
- 当前境界: ${currentState.level || '初入修行'}
- 年龄: ${currentState.age || 16}岁
- 资质: ${currentState.talent || '普通'}
- 气运: ${currentState.luck || '平常'}
- 背景: ${currentState.background || '普通修士'}
- 当前地点: ${location || '未知之地'}
- 当前年份: ${year || '开元之年'}
- 主要属性: ${JSON.stringify(currentState.attributes || {})}
- 特殊状态: ${JSON.stringify(currentState.status || {})}
- 拥有物品: ${JSON.stringify(currentState.items || [])}
- 已知技能: ${JSON.stringify(currentState.skills || [])}
- 人际关系: ${JSON.stringify(currentState.relationships || {})}

## 历史事件
${previousEvents ? previousEvents.join('\n') : '这是角色的第一个事件'}
`;

    // 体系特定设定
    const systemSpecificPrompt = getSystemSpecificPrompt(currentSystem);
    
    // 境界突破指南
    const breakthroughPrompt = getBreakthroughPrompt(currentSystem, currentState.level);
    
    // 输出格式指南
    const outputFormatPrompt = `
## 输出要求
请生成一个JSON格式的响应，包含以下字段:
1. "story": 一段生动的故事描述，长度约100字左右，描述角色遇到的情境、挑战或机遇
2. "choices": 一个数组，只包含3个选择项，每个选择项包含:
   - "text": 选择的描述文本
   - "effects": 选择可能带来的效果，如 {"修为": +2, "悟性": +1, "寿元": -5} 等

确保JSON格式完整，不要截断。示例:
{
  "story": "你在山中修行，突然天降异象...",
  "choices": [
    {"text": "调息避让", "effects": {"灵力": 1, "修为": 1}},
    {"text": "参悟天机", "effects": {"悟性": 2, "危险": 3}},
    {"text": "收集异宝", "effects": {"财富": 3, "敌人": 1}}
  ]
}
`;

    // 组合完整提示词
    return `${backgroundPrompt}\n${systemSpecificPrompt}\n${breakthroughPrompt}\n${outputFormatPrompt}`;
}

// 获取体系特定的提示词
function getSystemSpecificPrompt(system) {
    const systemPrompts = {
        "修真": `
## 修真体系特性
修真体系以灵气为本，性命双修。修炼者通过吐纳天地灵气，打通经脉，凝结金丹，最终飞升成仙。
- 境界路线: 练气 > 筑基 > 金丹 > 元婴 > 出窍 > 分神 > 合体 > 渡劫 > 大乘 > 真仙 > 金仙 > 太乙 > 大罗 > 道祖
- 核心资源: 灵石、丹药、功法、法宝
- 主要挑战: 心魔、天劫、仙凡之别
- 典型场景: 洞府修炼、秘境探索、宗门大比、仙家斗法
- 突破关键: 灵根资质、功法契合度、机缘造化`,

        "武侠": `
## 武侠体系特性
武侠体系以内力与招式为本，讲究武学境界与侠义精神。
- 境界路线: 不入流 > 三流 > 二流 > 一流 > 后天 > 先天 > 宗师 > 大宗师
- 核心资源: 武功秘籍、内功心法、奇门兵器
- 主要挑战: 武学瓶颈、江湖恩怨
- 典型场景: 武林大会、门派争斗、行侠仗义
- 突破关键: 武学悟性、实战经验、心性修为`,

        "国术": `
## 国术体系特性
国术体系为纯炼体系统，通过劲力入微达到极致。
- 境界路线: 明劲 > 暗劲 > 化劲 > 丹劲 > 罡劲
- 核心资源: 药浴、桩功、实战
- 主要挑战: 暗伤、筋骨关
- 典型场景: 擂台比武、踢馆、传承衣钵
- 突破关键: 身体素质、劲力理解、气血充盈`,

        "斗气": `
## 斗气体系特性
斗气体系以斗之气旋为本，外放凝形，可吞噬异火提升。
- 境界路线: 斗者 > 斗师 > 大斗师 > 斗灵 > 斗王 > 斗皇 > 斗宗 > 斗尊 > 斗圣 > 斗帝
- 核心资源: 魔核、斗技、异火
- 主要挑战: 属性冲突、空间感悟
- 典型场景: 魔兽森林、加玛帝国大比、异火争夺
- 突破关键: 斗气纯度、天赋异禀、机缘巧合`,

        "武魂": `
## 武魂体系特性
武魂体系以武魂觉醒、魂环吸收为核心，通过猎杀魂兽获得力量。
- 境界路线: 魂士 > 魂师 > 大魂师 > 魂尊 > 魂宗 > 魂王 > 魂帝 > 魂圣 > 魂斗罗 > 封号斗罗
- 核心资源: 魂环、魂骨、武魂融合
- 主要挑战: 魂环排斥、武魂冲突
- 典型场景: 史莱克学院、全大陆高级魂师大赛、星斗大森林
- 突破关键: 武魂天赋、魂环年限、修炼天赋`,

        "洪荒": `
## 洪荒体系特性
洪荒体系以悟道、功德、跟脚为三核心，讲究天道、因果与量劫。
- 境界路线: 人仙 > 地仙 > 天仙 > 真仙 > 玄仙 > 金仙 > 太乙金仙 > 大罗金仙 > 准圣 > 圣人 > 天道境 > 大道境
- 核心资源: 先天灵宝、功德、鸿蒙紫气
- 主要挑战: 量劫、因果、天道
- 典型场景: 紫霄宫讲道、三千大世界、混沌海
- 突破关键: 道心、功德、气运、机缘`,

        "魔法": `
## 魔法体系特性
魔法体系以精神力、元素亲和与咒语模型为基础，构建魔法网络。
- 境界路线: 见习魔法使 > 初级魔法使 > 中级魔法使 > 高级魔法使 > 见习魔法师 > 初级魔法师 > 中级魔法师 > 高级魔法师 > 魔导师 > 大魔导师 > 圣魔导师 > 法神
- 核心资源: 魔晶、卷轴、元素之心
- 主要挑战: 元素反噬、精神崩溃
- 典型场景: 魔法学院、元素位面、魔法竞技场
- 突破关键: 精神力强度、元素亲和度、咒语理解`,

        "西方剑士": `
## 西方剑士体系特性
西方剑士体系结合斗气、剑意与剑域，以剑为道。
- 境界路线: 见习剑士 > 初级剑士 > 中级剑士 > 高级剑士 > 大剑士 > 初级剑师 > 中级剑师 > 高级剑师 > 圣剑士 > 圣剑师 > 剑圣 > 剑神
- 核心资源: 神剑、剑意石、域石
- 主要挑战: 剑意分裂、因果反噬
- 典型场景: 剑术比拼、龙巢试剑、神剑碎片争夺
- 突破关键: 剑意凝聚、人剑合一、剑心通明`,

        "茅山道术": `
## 茅山道术体系特性
茅山道术体系以符箓、驱邪与功德为核心，沟通阴阳两界。
- 境界路线: 凝气境 > 问道境 > 法师境 > 真人境 > 天师境
- 核心资源: 朱砂、黄纸、法坛、令旗
- 主要挑战: 神念反噬、阴德损耗
- 典型场景: 捉鬼、赶尸、地府请兵、天师考核
- 突破关键: 道心纯净、功德积累、阴阳平衡`,

        "文位": `
## 文位体系特性
文位体系以才气、民心与天地功德为基础，以文化道。
- 境界路线: 童生 > 秀才 > 举人 > 进士 > 翰林 > 大学士 > 大儒 > 半圣 > 亚圣 > 圣人
- 核心资源: 笔墨纸砚、圣页、文脉种子
- 主要挑战: 文胆裂、学说质疑
- 典型场景: 科举考试、百家争鸣、圣道之辩
- 突破关键: 文采飞扬、民心所向、天地认可`,

        "忍术": `
## 忍术体系特性
忍术体系以查克拉、印与血脉为基础，结合体术、幻术与忍术。
- 境界路线: 下忍 > 中忍 > 上忍 > 影级 > 超影 > 六道
- 核心资源: 查克拉、血继限界、尾兽
- 主要挑战: 查克拉暴走、精神崩溃
- 典型场景: 中忍考试、忍界大战、尾兽争夺
- 突破关键: 血继天赋、查克拉量、意志力`
    };

    return systemPrompts[system] || `
## 自定义体系
你正在使用自定义修炼体系，请根据角色当前状态和历史事件，生成合适的故事情节和选择。`;
}

// 获取境界突破指南
function getBreakthroughPrompt(system, currentLevel) {
    // 各体系境界列表
    const levelLists = {
        "修真": ["练气", "筑基", "金丹", "元婴", "出窍", "分神", "合体", "渡劫", "大乘", "真仙", "金仙", "太乙", "大罗", "道祖"],
        "武侠": ["不入流", "三流", "二流", "一流", "后天", "先天", "宗师", "大宗师"],
        "国术": ["明劲", "暗劲", "化劲", "丹劲", "罡劲"],
        "斗气": ["斗者", "斗师", "大斗师", "斗灵", "斗王", "斗皇", "斗宗", "斗尊", "斗圣", "斗帝"],
        "武魂": ["魂士", "魂师", "大魂师", "魂尊", "魂宗", "魂王", "魂帝", "魂圣", "魂斗罗", "封号斗罗"],
        "洪荒": ["人仙", "地仙", "天仙", "真仙", "玄仙", "金仙", "太乙金仙", "大罗金仙", "准圣", "圣人", "天道境", "大道境"],
        "魔法": ["见习魔法使", "初级魔法使", "中级魔法使", "高级魔法使", "见习魔法师", "初级魔法师", "中级魔法师", "高级魔法师", "魔导师", "大魔导师", "圣魔导师", "法神"],
        "西方剑士": ["见习剑士", "初级剑士", "中级剑士", "高级剑士", "大剑士", "初级剑师", "中级剑师", "高级剑师", "圣剑士", "圣剑师", "剑圣", "剑神"],
        "茅山道术": ["凝气境", "问道境", "法师境", "真人境", "天师境"],
        "文位": ["童生", "秀才", "举人", "进士", "翰林", "大学士", "大儒", "半圣", "亚圣", "圣人"],
        "忍术": ["下忍", "中忍", "上忍", "影级", "超影", "六道"]
    };

    // 获取当前体系的境界列表
    const levels = levelLists[system] || [];
    
    // 找到当前境界在列表中的位置
    const currentIndex = levels.indexOf(currentLevel);
    
    // 如果找不到当前境界或已是最高境界，返回空提示
    if (currentIndex === -1 || currentIndex === levels.length - 1) {
        return `
## 境界突破指南
当前境界: ${currentLevel || "未知"}
请根据角色当前状态和历史事件，生成合适的故事情节和选择。`;
    }
    
    // 获取下一个境界
    const nextLevel = levels[currentIndex + 1];
    
    // 境界突破难度和瓶颈信息
    const breakthroughInfo = getBreakthroughInfo(system, currentLevel, nextLevel);
    
    return `
## 境界突破指南
当前境界: ${currentLevel}
下一境界: ${nextLevel}
突破难度: ${breakthroughInfo.difficulty}
典型瓶颈: ${breakthroughInfo.bottleneck}
所需资源: ${breakthroughInfo.resources}
突破方式: ${breakthroughInfo.method}

请考虑角色是否接近突破点，如果是，可以设计与突破相关的情节和选择。`;
}

// 获取境界突破详细信息
function getBreakthroughInfo(system, currentLevel, nextLevel) {
    // 境界突破信息库
    const breakthroughInfos = {
        "修真": {
            "练气-筑基": {
                difficulty: "中等",
                bottleneck: "心魔、灵台裂痕",
                resources: "筑基丹、筑基灵泉",
                method: "筑灵台、塑道基，开始辟谷"
            },
            "筑基-金丹": {
                difficulty: "困难",
                bottleneck: "丹碎风险、雷火淬丹",
                resources: "结金丹、护丹阵",
                method: "压缩液旋成固态金丹，寿五百"
            },
            "金丹-元婴": {
                difficulty: "极难",
                bottleneck: "婴变雷劫、心婴不稳",
                resources: "婴元果、养魂木",
                method: "金丹破婴生，元神初现"
            },
            "元婴-出窍": {
                difficulty: "极难",
                bottleneck: "阴风蚀神、肉身同步",
                resources: "定魂香、养魂玉",
                method: "元神可离体夜游千里"
            },
            "出窍-分神": {
                difficulty: "极难",
                bottleneck: "识海分裂症",
                resources: "分神诀、凝神丹",
                method: "一化万千，神识切片"
            },
            "分神-合体": {
                difficulty: "极难",
                bottleneck: "形神冲突",
                resources: "合道丹、仙器",
                method: "元神与肉身彻底融合，滴血重生"
            },
            "合体-渡劫": {
                difficulty: "九死一生",
                bottleneck: "雷罚、业火",
                resources: "渡劫阵、替劫傀儡",
                method: "九重雷劫，法则考验"
            },
            "渡劫-大乘": {
                difficulty: "难在'飞升许可'",
                bottleneck: "天路断绝、功德不足",
                resources: "飞升台、天道功德",
                method: "人间极巅，只待飞升"
            }
        },
        "武侠": {
            "不入流-三流": {
                difficulty: "容易",
                bottleneck: "经脉闭塞",
                resources: "基础内功",
                method: "小成内力，可碎石"
            },
            "三流-二流": {
                difficulty: "中等",
                bottleneck: "任督二脉",
                resources: "小还丹",
                method: "贯通奇经，隔空寸劲"
            },
            "二流-一流": {
                difficulty: "中等",
                bottleneck: "真气纯度",
                resources: "百年药材",
                method: "内力外放，一丈剑气"
            },
            "一流-后天": {
                difficulty: "困难",
                bottleneck: "生死玄关",
                resources: "易筋经、洗髓经",
                method: "打通天地之桥，返璞归真"
            },
            "后天-先天": {
                difficulty: "极难",
                bottleneck: "先天一炁",
                resources: "先天功法、机缘",
                method: "引天地元气入体，胎息"
            },
            "先天-宗师": {
                difficulty: "极难",
                bottleneck: "武学理念",
                resources: "悟道、门派气运",
                method: "自创绝学，气场域"
            },
            "宗师-大宗师": {
                difficulty: "极难",
                bottleneck: "心劫、传承断绝",
                resources: "顿悟、国运加持",
                method: "镇派级，一人敌国"
            }
        }
    };
    
    // 尝试获取特定境界突破信息
    const key = `${currentLevel}-${nextLevel}`;
    const specificInfo = (breakthroughInfos[system] || {})[key];
    
    // 如果没有特定信息，返回通用信息
    if (!specificInfo) {
        return {
            difficulty: "需要探索",
            bottleneck: "未知瓶颈",
            resources: "需要寻找合适资源",
            method: "需要探索突破方式"
        };
    }
    
    return specificInfo;
}

// 导出函数
window.getPromptTemplate = getPromptTemplate;