export const attributeEffects = {
  "敏捷": ["迟缓", "激怒"],
  "洞察": ["眩晕", "激怒"],
  "力量": ["虚弱", "中毒"],
  "意志": ["动摇", "中毒"],
}

export const numToChinese = {
  1: "一",
  2: "二",
  3: "三",
  4: "四",
  5: "五",
  6: "六"
}

export const emoToKey = {
  "钦佩": "钦佩",
  "自卑": "钦佩",
  "忠诚": "忠诚",
  "猜忌": "忠诚",
  "喜爱": "喜爱",
  "憎恨": "喜爱"
}

export const emoToValue = {
  "钦佩": 1,
  "自卑": -1,
  "忠诚": 1,
  "猜忌": -1,
  "喜爱": 1,
  "憎恨": -1
}

export const negEmo = {
  "钦佩": "自卑",
  "自卑": "钦佩",
  "忠诚": "猜忌",
  "猜忌": "忠诚",
  "喜爱": "憎恨",
  "憎恨": "喜爱"
}

function genAttrExpr(attribute: string): string {
  const effect1 = attributeEffects[attribute][0];
  const effect2 = attributeEffects[attribute][1];
  return "{" +
    `if ${attribute}骰面 == 0 {${attribute}骰面 = ${attribute}骰面初始值}; ` +
    `if ${effect1} {$t${effect1}文本 = '${effect1}'; $t${attribute}变动 = 1} ` +
    `else {$t${effect1}文本 = ''}; ` +
    `if ${effect2} {$t${effect2}文本 = $t${attribute}变动 ? '、${effect2}' : '${effect2}'; $t${attribute}变动 = 1} ` +
    `else {$t${effect2}文本 = ''}; ` +
    `if ${attribute}骰面增减值 {$t${attribute}增减文本 = ($t${attribute}变动 ? '、' : '') + (${attribute}骰面增减值 > 0 ? \`ds+{${attribute}骰面增减值}\` : \`ds{${attribute}骰面增减值}\`)} ` +
    `else {$t${attribute}增减文本 = ''}; $t${attribute}变动 = 0; $t${attribute}附属文本 = $t${effect1}文本 + $t${effect2}文本 + $t${attribute}增减文本; ` +
    `if $t${attribute}附属文本 {$t${attribute}附属文本 = \`（{$t${attribute}附属文本}）\`}; 'd' + str(${attribute}骰面) + $t${attribute}附属文本` +
    "}"
}

export const ruleTemplate = {
  "name": "fu",
  "fullName": "最终物语",
  "authors": ["Mint Cider"],
  "version": "0.3.0",
  "updatedTime": "2024.12.05",
  "templateVer": "1.0",

  // .set 相关内容，使用.set fish开启，切6面骰，并提示enableTip中的内容
  "setConfig": {
    "diceSides": 6,
    "enableTip": "已切换至 6 面骰，并自动开启最终物语（seal-fu）扩展",
    "keys": ["fu", "最终物语"],
    "relatedExt": ["coc7", "seal-fu"]
  },

  // sn相关内容，可使用.sn fish自动设置名片
  "nameTemplate": {
    "fu": {
      "template": "{$t玩家_RAW} HP{生命值}/{生命值上限} MP{精神值}/{精神值上限} IP{物资点}/{物资点上限} FP{物语点} Z{金币} PD{物防计算值} MD{魔防计算值}",
      "helpText": "自动设置最终物语名片"
    },
    "fuS": {
      "template": "{$t玩家_RAW} HP{生命值}/{生命值上限} MP{精神值}/{精神值上限} PD{物防计算值} MD{魔防计算值}",
      "helpText": "自动设置最终物语简短版名片"
    },
    "fuD": {
      "template": "{$t玩家_RAW} HP{生命值}/{生命值上限} MP{精神值}/{精神值上限} D{敏捷骰面} I{洞察骰面} M{力量骰面} W{意志骰面}",
      "helpText": "自动设置最终物语属性版名片"
    }
  },

  "attrConfig": {
    // st show 置顶内容
    "top": ["敏捷", "洞察", "力量", "意志"],
    "sortBy": "name",
    // st show 隐藏内容
    "ignores": ["生命值上限", "精神值上限", "物资点上限",
      "敏捷骰面", "敏捷骰面初始值", "洞察骰面", "洞察骰面初始值", "力量骰面", "力量骰面初始值", "意志骰面", "意志骰面初始值",
      "敏捷骰面增减值", "洞察骰面增减值", "力量骰面增减值", "意志骰面增减值", "物防计算值", "魔防计算值",
      "迟缓", "眩晕", "虚弱", "动摇", "激怒", "中毒",
      "羁绊一", "羁绊二", "羁绊三", "羁绊四", "羁绊五", "羁绊六",
      "羁绊一钦佩", "羁绊一忠诚", "羁绊一喜爱",
      "羁绊二钦佩", "羁绊二忠诚", "羁绊二喜爱",
      "羁绊三钦佩", "羁绊三忠诚", "羁绊三喜爱",
      "羁绊四钦佩", "羁绊四忠诚", "羁绊四喜爱",
      "羁绊五钦佩", "羁绊五忠诚", "羁绊五喜爱",
      "羁绊六钦佩", "羁绊六忠诚", "羁绊六喜爱",
      "羁绊数"
    ],
    // st show 展示内容，例如到 st show hp 会展示“生命值: 10/14”
    "showAs": {
      "生命值": "{生命值}/{生命值上限}",
      "精神值": "{精神值}/{精神值上限}",
      "物资点": "{物资点}/{物资点上限}",
      "敏捷": genAttrExpr("敏捷"),
      "洞察": genAttrExpr("洞察"),
      "力量": genAttrExpr("力量"),
      "意志": genAttrExpr("意志"),
      "物防": "{物防计算值}",
      "魔防": "{魔防计算值}",
    },
  },

  // 默认值
  // "defaults": {
  //   "上工": 5,
  // },
  // 默认值 - 计算属性，如闪避为“敏捷 / 2 ”
  // "defaultsComputed": {
  //   // 注意: 目前(v1.2.4)有一些限制，showAs中的项，千万不能有默认值
  //   // 此外defaults中的内容也不能出现在defaultsComputed里
  //   "生命值上限": "脸皮 * 2",
  // },
  // 同义词，存卡和设置属性时，所有右边的词会被转换为左边的词，不分大小写(sAN视同San/san)
  "alias": {
    "生命值": ["hp", "hit point", "hit points"],
    "生命值上限": ["hpmax"],
    "精神值": ["mp", "mental point", "mental points"],
    "精神值上限": ["mpmax"],
    "物资点": ["ip", "inventory point", "inventory points"],
    "物资点上限": ["ipmax"],
    "物语点": ["fp", "fabula point", "fabula points"],
    "金币": ["z", "zenit"],
    "先攻修正值": ["im", "initiative modifier", "先攻"],
    "物防": ["pd", "df", "defense", "物理防御"],
    "魔防": ["md", "magical defense", "魔法防御"],
    "敏捷骰面初始值": ["dex", "dexterity", "敏捷"],
    "洞察骰面初始值": ["ins", "insight", "洞察"],
    "力量骰面初始值": ["mig", "might", "力量"],
    "意志骰面初始值": ["wlp", "willpower", "意志"],
  },

  // 可自定义词组，未实装
  // "textMap": {
  //   "fish-test": {
  //     "设置测试_成功": [
  //       ["设置完成", 1]
  //     ]
  //   }
  // },
  // "textMapHelpInfo": null
}

export const fuHelp = "最终物语规则相关指令：\n\n" +
  ".set fu：切换到最终物语规则\n" +
  ".st：适配了人物卡管理。fu 相关属性参见 .fu st、命令使用方法参见 .st help\n" +
  ".sn fu/fuS/fuD：适配了自动群名片，提供长短两种格式，以及显示属性骰的格式\n" +
  ".rc：检定指令\n" +
  ".ri：先攻指令\n" +
  ".buff：异常状态指令\n" +
  ".ds：属性骰临时调整指令\n" +
  ".eval：属性骰核算指令\n" +
  ".bond：羁绊指令\n" +
  ".clk：命刻指令\n\n" +
  "有关最终物语插件的详细使用说明请参考 github.com/MintCider/seal-fu"

export const fuStHelp = "最终物语相关人物卡属性：\n\n" +
  "属性名 | 默认属性别名\n" +
  "生命值 | hp、hit point、hit points\n" +
  "生命值上限 | hpmax\n" +
  "精神值 | mp、mental point、mental points\n" +
  "精神值上限 | mpmax\n" +
  "物资点 | ip、inventory point、inventory points\n" +
  "物资点上限 | ipmax\n" +
  "物语点 | fp、fabula point、fabula points\n" +
  "金币 | z、zenit\n" +
  "先攻修正值 | im、initiative modifier\n" +
  "物防 | pd、df、defense、物理防御\n" +
  "魔防 | md、magical defense、魔法防御\n" +
  "敏捷骰面初始值 | dex、dexterity、敏捷\n" +
  "洞察骰面初始值 | ins、insight、洞察\n" +
  "力量骰面初始值 | mig、might、力量\n" +
  "意志骰面初始值 | wlp、willpower、意志\n\n" +
  "在初始化人物卡时，可以使用任意属性别名进行属性设定，插件会自动将其转化为对应的属性。骰主可能会对属性别名进行调整。\n\n" +
  "使用字符串格式设置物防魔防，例如 .st pd='dex+1'/.st 魔防=\"洞察+2\"，则可以实现物防魔防与属性骰的联动。当属性骰发生变化时，对应防御值会自动更新。\n\n" +
  ".st 命令本身的使用方式请参考 .st help"


export const rcHelp = "最终物语检定指令：\n\n" +
  ".rc <属性 1>+<属性 2>+<修正值>\n\n" +
  "支持的属性为：敏捷、洞察、力量、意志，以及任何对应四维属性的属性别名（例如：dex、ins、mig、wlp），不区分大小写\n" +
  "支持的修正值为：整数\n" +
  "例子：\n" +
  ".rc 敏捷+洞察+1\n" +
  ".rc mig+wlp-2"

export const riHelp = "最终物语先攻检定指令：\n\n" +
  ".ri [修正值]\n\n" +
  "自动进行一次「敏捷+洞察+先攻修正值」的检定，可以额外附加一个整数修正值\n" +
  "例子：\n" +
  ".ri\n" +
  ".ri +3"

export const buffHelp = "最终物语异常状态指令：\n\n" +
  ".buff <异常状态>：切换异常状态\n" +
  ".buff add <异常状态>：附加异常状态\n" +
  ".buff del <异常状态>：消除异常状态\n" +
  ".buff clr：消除全部异常状态\n\n" +
  "支持的异常状态为：迟缓、眩晕、虚弱、动摇、激怒、中毒"

export const dsHelp = "最终物语临时调整属性骰指令：\n\n" +
  ".ds <属性>+<调整值>：将对应属性骰增大或减小对应级别\n" +
  ".ds rst <属性>：重置对应属性骰\n" +
  ".ds rst all：重置全部属性骰\n\n" +
  "支持的属性为：敏捷、洞察、力量、意志，以及任何对应四维属性的属性别名（例如：dex、ins、mig、wlp），不区分大小写\n" +
  "支持的调整值为：整数\n" +
  "例子：" +
  ".ds 力量+1：力量属性骰增大一级（6 ➯ 8 ➯ 10 ➯ 12）\n" +
  ".ds dex-1：敏捷属性骰减小一级（12 ➯ 10 ➯ 8 ➯ 6）"

export const evalHelp = "最终物语属性核算指令：\n\n" +
  "基于初始属性、异常状态、属性骰调整值，核算属性骰\n" +
  "如果发现属性骰数值不符合预期，可以尝试使用该指令进行核算"

export const bondHelp = "最终物语羁绊指令：\n\n" +
  ".bond add <名字> <情感>：与<名字>建立情感为<情感>的羁绊\n" +
  ".bond del <编号>/<名字>：遗忘对应的羁绊\n" +
  ".bond clr：遗忘全部羁绊\n" +
  ".bond emo add <编号>/<名字> <情感>：为对应羁绊添加对应情感\n" +
  ".bond emo del <编号>/<名字> <情感>：遗忘对应羁绊的对应情感\n" +
  ".bond list：查看所有羁绊\n\n" +
  "支持的情感为：钦佩、自卑、忠诚、猜忌、喜爱、憎恨"

export const clkHelp = "最终物语命刻指令：\n\n" +
  ".clk add <名字> <大小> [进度]：创建大小为<大小>，名字为<名字>的命刻，进度默认为0\n" +
  ".clk del <名字>：删除对应的命刻\n" +
  ".clk clr：删除全部命刻\n" +
  ".clk fill <名字> <进度变化>：使对应命刻的进度发生对应变化\n" +
  ".clk list：查看群内全部命刻\n\n" +
  "支持的大小为：正整数\n" +
  "支持的进度为：非负整数\n" +
  "支持的进度变化为：整数"

export type Clock = {
  name: string;
  size: number;
  current: number;
}
