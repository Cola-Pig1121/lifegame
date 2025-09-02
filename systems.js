const cultivationSystems = [
  {
    "systemName": "修真体系",
    "description": "以灵气为本，性命双修",
    "ranks": [
      { "name": "练气", "method": "吐纳天地灵气，打通十二正经与奇经八脉", "difficulty": "易", "bottleneck": "丹田化雾为液", "resources": "灵石、聚灵阵", "comparison": "武侠后天" },
      { "name": "筑基", "method": "筑灵台、塑道基，开始辟谷", "difficulty": "中", "bottleneck": "心魔、灵台裂痕", "resources": "筑基丹、筑基灵泉", "comparison": "武侠先天" },
      { "name": "金丹", "method": "压缩液旋成固态金丹，寿五百", "difficulty": "难", "bottleneck": "丹碎风险、雷火淬丹", "resources": "结金丹、护丹阵", "comparison": "国术丹劲" },
      { "name": "元婴", "method": "金丹破婴生，元神初现", "difficulty": "极难", "bottleneck": "婴变雷劫、心婴不稳", "resources": "婴元果、养魂木", "comparison": "武魂魂圣" },
      { "name": "出窍", "method": "元神可离体夜游千里", "difficulty": "极难", "bottleneck": "阴风蚀神、肉身同步", "resources": "定魂香、养魂玉", "comparison": "斗气斗宗" },
      { "name": "分神", "method": "一化万千，神识切片", "difficulty": "极难", "bottleneck": "识海分裂症", "resources": "分神诀、凝神丹", "comparison": "洪荒真仙" },
      { "name": "合体", "method": "元神与肉身彻底融合，滴血重生", "difficulty": "极难", "bottleneck": "形神冲突", "resources": "合道丹、仙器", "comparison": "洪荒玄仙" },
      { "name": "渡劫", "method": "九重雷劫，法则考验", "difficulty": "九死一生", "bottleneck": "雷罚、业火", "resources": "渡劫阵、替劫傀儡", "comparison": "洪荒金仙" },
      { "name": "大乘", "method": "人间极巅，只待飞升", "difficulty": "难在“飞升许可”", "bottleneck": "天路断绝、功德不足", "resources": "飞升台、天道功德", "comparison": "准圣" }
    ]
  },
  {
    "systemName": "武侠体系",
    "description": "以内力与招式为本",
    "ranks": [
      { "name": "不入流", "method": "锻炼筋骨，套路架子", "difficulty": "零门槛", "bottleneck": "无", "resources": "木桩、石锁", "comparison": "普通人" },
      { "name": "三流", "method": "小成内力，可碎石", "difficulty": "易", "bottleneck": "经脉闭塞", "resources": "基础内功", "comparison": "斗者" },
      { "name": "二流", "method": "贯通奇经，隔空寸劲", "difficulty": "中", "bottleneck": "任督二脉", "resources": "小还丹", "comparison": "斗师" },
      { "name": "一流", "method": "内力外放，一丈剑气", "difficulty": "中", "bottleneck": "真气纯度", "resources": "百年药材", "comparison": "大斗师" },
      { "name": "后天", "method": "打通天地之桥，返璞归真", "difficulty": "难", "bottleneck": "生死玄关", "resources": "易筋经、洗髓经", "comparison": "魂尊" },
      { "name": "先天", "method": "引天地元气入体，胎息", "difficulty": "极难", "bottleneck": "先天一炁", "resources": "先天功法、机缘", "comparison": "魂宗" },
      { "name": "宗师", "method": "自创绝学，气场域", "difficulty": "极难", "bottleneck": "武学理念", "resources": "悟道、门派气运", "comparison": "魂王" },
      { "name": "大宗师", "method": "镇派级，一人敌国", "difficulty": "极难", "bottleneck": "心劫、传承断绝", "resources": "顿悟、国运加持", "comparison": "魂帝" }
    ]
  },
  {
    "systemName": "国术体系",
    "description": "纯炼体，劲力入微",
    "ranks": [
      { "name": "明劲", "method": "整劲爆发，声随拳出", "difficulty": "易", "bottleneck": "筋骨关", "resources": "桩功、药浴", "comparison": "不入流" },
      { "name": "暗劲", "method": "劲透脏腑，隔山打牛", "difficulty": "中", "bottleneck": "气血搬运", "resources": "秘传呼吸法", "comparison": "三流" },
      { "name": "化劲", "method": "劲力圆转，一羽不能加", "difficulty": "中", "bottleneck": "劲路入微", "resources": "虎豹雷音", "comparison": "二流" },
      { "name": "丹劲", "method": "气血抱丹，周身无漏", "difficulty": "难", "bottleneck": "血魄成丹", "resources": "虎骨酒、闭关", "comparison": "一流" },
      { "name": "罡劲", "method": "丹劲外放，罡气护体", "difficulty": "极难", "bottleneck": "罡煞合流", "resources": "雷音洗髓、罡煞石", "comparison": "先天" }
    ]
  },
  {
    "systemName": "斗气体系",
    "description": "以斗之气旋为本，外放凝形",
    "ranks": [
      { "name": "斗者", "method": "凝聚斗之气旋", "difficulty": "易", "bottleneck": "气旋稳定", "resources": "初级功法", "comparison": "三流" },
      { "name": "斗师", "method": "斗气纱衣护体", "difficulty": "中", "bottleneck": "经脉拓宽", "resources": "魔核、斗晶", "comparison": "二流" },
      { "name": "大斗师", "method": "斗气铠甲", "difficulty": "中", "bottleneck": "属性融合", "resources": "属性魔核", "comparison": "一流" },
      { "name": "斗灵", "method": "斗气凝物，百步神拳", "difficulty": "难", "bottleneck": "化物塑形", "resources": "灵阶功法", "comparison": "后天" },
      { "name": "斗王", "method": "斗气化翼，飞天", "difficulty": "极难", "bottleneck": "空战掌控", "resources": "飞行斗技", "comparison": "先天" },
      { "name": "斗皇", "method": "空间微操，领域雏形", "difficulty": "极难", "bottleneck": "空间感悟", "resources": "皇极丹", "comparison": "宗师" },
      { "name": "斗宗", "method": "空间锁、瞬移", "difficulty": "极难", "bottleneck": "空间法则碎片", "resources": "宗级功法、空间石", "comparison": "大宗师" },
      { "name": "斗尊", "method": "开辟空间通道", "difficulty": "极难", "bottleneck": "时间感雏形", "resources": "尊级丹药", "comparison": "合体" },
      { "name": "斗圣", "method": "言出法随，万里挪移", "difficulty": "极难", "bottleneck": "规则链", "resources": "圣级源气", "comparison": "渡劫" },
      { "name": "斗帝", "method": "位面之主，源气灌体", "difficulty": "唯机缘", "bottleneck": "源气枯竭", "resources": "帝品雏丹、位面之胎", "comparison": "大乘" }
    ]
  },
  {
    "systemName": "武魂体系",
    "description": "武魂觉醒—魂环—魂骨—领域",
    "ranks": [
      { "name": "魂士", "method": "武魂觉醒，冥想", "difficulty": "易", "bottleneck": "武魂契合", "resources": "武魂殿觉醒石", "comparison": "见习魔法使" },
      { "name": "魂师", "method": "吸收百年魂环", "difficulty": "中", "bottleneck": "魂环排斥", "resources": "百年魂兽", "comparison": "初级魔法使" },
      { "name": "大魂师", "method": "二环，魂技组合", "difficulty": "中", "bottleneck": "魂力瓶颈", "resources": "拟态修炼场", "comparison": "中级魔法使" },
      { "name": "魂尊", "method": "三环，千年魂环", "difficulty": "难", "bottleneck": "精神震荡", "resources": "千年魂兽", "comparison": "高级魔法使" },
      { "name": "魂宗", "method": "四环，魂技质变", "difficulty": "难", "bottleneck": "属性冲突", "resources": "属性魂骨", "comparison": "见习魔法师" },
      { "name": "魂王", "method": "五环，武魂真身雏形", "difficulty": "极难", "bottleneck": "真身反噬", "resources": "万年魂环", "comparison": "初级魔法师" },
      { "name": "魂帝", "method": "六环，领域雏形", "difficulty": "极难", "bottleneck": "领域稳定", "resources": "领域种子", "comparison": "中级魔法师" },
      { "name": "魂圣", "method": "七环，武魂真身", "difficulty": "极难", "bottleneck": "真身融合度", "resources": "圣魂草", "comparison": "高级魔法师" },
      { "name": "魂斗罗", "method": "八环，封号前夜", "difficulty": "极难", "bottleneck": "魂核凝聚", "resources": "魂核法阵", "comparison": "魔导师" },
      { "name": "封号斗罗", "method": "九环，红色十万年", "difficulty": "极难", "bottleneck": "双生武魂冲突", "resources": "十万年魂骨、神赐魂环", "comparison": "大魔导师" }
    ]
  },
  {
    "systemName": "洪荒体系",
    "description": "以悟道、功德、跟脚为三核心",
    "ranks": [
      { "name": "人仙", "method": "长生始门，三花聚顶", "difficulty": "易", "bottleneck": "天劫", "resources": "化仙池", "comparison": "武侠先天" },
      { "name": "地仙", "method": "开辟洞府，福地雏形", "difficulty": "中", "bottleneck": "福地选址", "resources": "先天灵脉", "comparison": "斗灵" },
      { "name": "天仙", "method": "飞升天庭，星辰淬体", "difficulty": "中", "bottleneck": "罡风雷火", "resources": "星斗本源", "comparison": "斗王" },
      { "name": "真仙", "method": "掌握一条小法则", "difficulty": "难", "bottleneck": "法则碎片", "resources": "先天灵根", "comparison": "斗皇" },
      { "name": "玄仙", "method": "法则链条，小千世界力", "difficulty": "极难", "bottleneck": "因果纠缠", "resources": "功德、气运", "comparison": "斗宗" },
      { "name": "金仙", "method": "不朽不灭，世界种子", "difficulty": "极难", "bottleneck": "量劫杀机", "resources": "先天功德灵宝", "comparison": "斗尊" },
      { "name": "太乙金仙", "method": "多元宇宙投影", "difficulty": "极难", "bottleneck": "时空悖论", "resources": "混沌碎片", "comparison": "斗圣" },
      { "name": "大罗金仙", "method": "收束时间线，永恒唯一", "difficulty": "极难", "bottleneck": "命运长河", "resources": "混沌青莲、鸿蒙紫气", "comparison": "斗帝" },
      { "name": "准圣", "method": "三尸证道或功德证道", "difficulty": "唯机缘", "bottleneck": "斩尸灵宝、大道之基", "resources": "鸿蒙紫气", "comparison": "大乘" },
      { "name": "圣人", "method": "元神寄托天道，不死不灭", "difficulty": "天道许可", "bottleneck": "鸿蒙紫气、无量功德", "resources": "洪荒本源", "comparison": "法神" },
      { "name": "天道境", "method": "合道洪荒，代天刑罚", "difficulty": "唯一名额", "bottleneck": "天道空缺", "resources": "——", "comparison": "" },
      { "name": "大道境", "method": "超脱混沌，大道化身", "difficulty": "不可求", "bottleneck": "无", "resources": "——", "comparison": "" }
    ]
  },
  {
    "systemName": "魔法体系",
    "description": "精神力＋元素亲和＋咒语模型",
    "ranks": [
      { "name": "见习～高级魔法使", "method": "精神力 1～100 点，元素感知", "difficulty": "易", "bottleneck": "模型记忆", "resources": "水晶球、冥想阵", "comparison": "不入流～二流" },
      { "name": "见习～高级魔法师", "method": "精神力 100～1000，瞬发低阶", "difficulty": "中", "bottleneck": "元素反噬", "resources": "魔晶、卷轴", "comparison": "一流～后天" },
      { "name": "魔导师", "method": "构建领域节点", "difficulty": "难", "bottleneck": "节点崩溃", "resources": "元素之心", "comparison": "先天" },
      { "name": "大魔导师", "method": "半位面雏形", "difficulty": "极难", "bottleneck": "位面风暴", "resources": "半位面种子", "comparison": "宗师" },
      { "name": "圣魔导师", "method": "法则咒语，言出法随", "difficulty": "极难", "bottleneck": "语言悖论", "resources": "神格碎片", "comparison": "大宗师" },
      { "name": "法神", "method": "创建完整魔网/神国", "difficulty": "唯机缘", "bottleneck": "位面意志排斥", "resources": "完整神格", "comparison": "圣人" }
    ]
  },
  {
    "systemName": "西方剑士体系",
    "description": "斗气＋剑意＋剑域",
    "ranks": [
      { "name": "见习～高级剑士", "method": "基础剑型、斗气种子", "difficulty": "易", "bottleneck": "肌肉记忆", "resources": "木剑、铁剑", "comparison": "不入流～二流" },
      { "name": "大剑士", "method": "斗气贯通剑刃", "difficulty": "中", "bottleneck": "斗气回路", "resources": "秘银剑", "comparison": "一流" },
      { "name": "初级～高级剑师", "method": "剑气外放、剑意萌芽", "difficulty": "中", "bottleneck": "剑意雏形", "resources": "剑意石", "comparison": "后天" },
      { "name": "圣剑士", "method": "剑意化形", "difficulty": "难", "bottleneck": "剑意分裂", "resources": "圣剑", "comparison": "先天" },
      { "name": "圣剑师", "method": "剑域展开", "difficulty": "极难", "bottleneck": "域场稳定", "resources": "域石", "comparison": "宗师" },
      { "name": "剑圣", "method": "规则级剑意，斩断因果", "difficulty": "极难", "bottleneck": "因果反噬", "resources": "因果剑晶", "comparison": "大宗师" },
      { "name": "剑神", "method": "一剑生灭世界", "difficulty": "唯机缘", "bottleneck": "世界壁障", "resources": "世界种子", "comparison": "圣人" }
    ]
  },
  {
    "systemName": "茅山道术体系",
    "description": "符箓＋驱邪＋功德",
    "ranks": [
      { "name": "凝气境", "method": "吐纳月华，画符成形", "difficulty": "易", "bottleneck": "符胆不稳", "resources": "朱砂、黄纸", "comparison": "练气" },
      { "name": "问道境", "method": "存想神明，符通灵", "difficulty": "中", "bottleneck": "神念反噬", "resources": "神像开光", "comparison": "筑基" },
      { "name": "法师境", "method": "开坛做法，驱百鬼", "difficulty": "中", "bottleneck": "阴德损耗", "resources": "法坛、令旗", "comparison": "金丹" },
      { "name": "真人境", "method": "召神遣将，结丹外放", "difficulty": "难", "bottleneck": "兵马反噬", "resources": "兵马印、真人箓", "comparison": "元婴" },
      { "name": "天师境", "method": "代天行罚，敕封神祇", "difficulty": "极难", "bottleneck": "天道考核", "resources": "天师印、功德十万", "comparison": "渡劫" }
    ]
  },
  {
    "systemName": "文位体系",
    "description": "才气＋民心＋天地功德",
    "ranks": [
      { "name": "童生", "method": "开慧，识字成符", "difficulty": "零门槛", "bottleneck": "蒙学", "resources": "四书五经", "comparison": "不入流" },
      { "name": "秀才", "method": "出口成章，纸上谈兵", "difficulty": "易", "bottleneck": "才气虚浮", "resources": "笔墨纸砚", "comparison": "三流" },
      { "name": "举人", "method": "唇枪舌剑，百步伤敌", "difficulty": "中", "bottleneck": "心魔考", "resources": "科举气运", "comparison": "二流" },
      { "name": "进士", "method": "诗成腾龙，腾云诗", "difficulty": "中", "bottleneck": "诗魂崩", "resources": "龙血墨", "comparison": "一流" },
      { "name": "翰林", "method": "微言大义，微缩领域", "difficulty": "难", "bottleneck": "文胆裂", "resources": "圣页", "comparison": "后天" },
      { "name": "大学士", "method": "口含天宪，律法为域", "difficulty": "极难", "bottleneck": "国运绑定", "resources": "国运玉玺", "comparison": "先天" },
      { "name": "大儒", "method": "教化一州，文曲星动", "difficulty": "极难", "bottleneck": "学说质疑", "resources": "万民伞", "comparison": "宗师" },
      { "name": "半圣", "method": "立言成圣，半圣之光", "difficulty": "极难", "bottleneck": "圣道之敌", "resources": "圣典", "comparison": "大宗师" },
      { "name": "亚圣", "method": "一界文运所钟", "difficulty": "唯机缘", "bottleneck": "文脉断绝", "resources": "文脉种子", "comparison": "圣人" },
      { "name": "圣人", "method": "言出为法，万世师表", "difficulty": "唯功德", "bottleneck": "大道不容", "resources": "天地功德、文心", "comparison": "大道境" }
    ]
  },
  {
    "systemName": "忍术体系",
    "description": "查克拉＋印＋血脉",
    "ranks": [
      { "name": "下忍", "method": "提取查克拉，三身术", "difficulty": "易", "bottleneck": "查克拉暴走", "resources": "查克拉试纸", "comparison": "不入流" },
      { "name": "中忍", "method": "性质变化，A 级忍术", "difficulty": "中", "bottleneck": "属性冲突", "resources": "属性卷轴", "comparison": "三流～二流" },
      { "name": "上忍", "method": "血继/仙术入门", "difficulty": "难", "bottleneck": "细胞排斥", "resources": "血继限界", "comparison": "一流" },
      { "name": "影级", "method": "领域级幻术或尾兽级查克拉", "difficulty": "极难", "bottleneck": "精神崩溃", "resources": "尾兽、仙术卷轴", "comparison": "后天～先天" },
      { "name": "超影", "method": "求道玉、阴阳遁", "difficulty": "极难", "bottleneck": "生命透支", "resources": "神树果实碎片", "comparison": "宗师" },
      { "name": "六道", "method": "血继网罗，创世灭世", "difficulty": "唯血脉", "bottleneck": "辉夜意志侵蚀", "resources": "十尾、轮回写轮眼", "comparison": "圣人" }
    ]
  }
];