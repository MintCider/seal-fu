export const attributeEffects = {
  "灵巧": ["缓慢", "愤怒"],
  "洞察": ["眩晕", "愤怒"],
  "力量": ["虚弱", "中毒"],
  "意志": ["动摇", "中毒"],
}

export const numToChinese = {1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六"}

export const emoToKey = {"赞赏": "赞赏", "自卑": "赞赏", "忠诚": "忠诚", "怀疑": "忠诚", "喜爱": "喜爱", "仇恨": "喜爱"}

export const emoToValue = {"赞赏": 1, "自卑": -1, "忠诚": 1, "怀疑": -1, "喜爱": 1, "仇恨": -1}

export const negEmo = {"赞赏": "自卑", "自卑": "赞赏", "忠诚": "怀疑", "怀疑": "忠诚", "喜爱": "仇恨", "仇恨": "喜爱"}

// function generateBondExpr(index: number): string {
//   if (!(index in [1, 2, 3, 4, 5, 6])) {
//     return "";
//   }
//   const numStr = numToChinese[index];
//   return "{" +
//     `$t赞赏文本 = 牵绊${numStr}赞赏 == 1 ? '赞赏', 牵绊${numStr}赞赏 == -1 ? '自卑', 牵绊${numStr}赞赏 == 0 ? ''; ` +
//     `$t忠诚文本 = 牵绊${numStr}忠诚 == 1 ? '忠诚', 牵绊${numStr}忠诚 == -1 ? '怀疑', 牵绊${numStr}忠诚 == 0 ? ''; ` +
//     `$t喜爱文本 = 牵绊${numStr}喜爱 == 1 ? '喜爱', 牵绊${numStr}喜爱 == -1 ? '仇恨', 牵绊${numStr}喜爱 == 0 ? ''; ` +
//     `if 牵绊${numStr}喜爱 && (牵绊${numStr}赞赏 || 牵绊${numStr}忠诚) {$t喜爱文本 = '与' + $t喜爱文本}; ` +
//     `if 牵绊${numStr}忠诚 && 牵绊${numStr}赞赏 && 牵绊${numStr}喜爱 {$t忠诚文本 = '、' + $t忠诚文本}; ` +
//     `if 牵绊${numStr}忠诚 && 牵绊${numStr}赞赏 && 牵绊${numStr}喜爱 == 0 {$t忠诚文本 = '与' + $t忠诚文本}` +
//     `}{牵绊${numStr}}-{$t赞赏文本}{$t忠诚文本}{$t喜爱文本}`
// }

function generateAttributeExpr(attribute: string): string {
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

export function generateAttributeStatusExpr(attribute: string): string {
  const effect1 = attributeEffects[attribute][0];
  const effect2 = attributeEffects[attribute][1];
  return "{" +
    `if ${effect1} {$t${effect1}文本 = '${effect1}'; $t${attribute}变动 = 1} ` +
    `else {$t${effect1}文本 = ''}; ` +
    `if ${effect2} {$t${effect2}文本 = $t${attribute}变动 ? '、${effect2}' : '${effect2}'; $t${attribute}变动 = 1} ` +
    `else {$t${effect2}文本 = ''}; ` +
    `if ${attribute}骰面增减值 {$t${attribute}增减文本 = ($t${attribute}变动 ? '、' : '') + (${attribute}骰面增减值 > 0 ? \`ds+{${attribute}骰面增减值}\` : \`ds{${attribute}骰面增减值}\`)} ` +
    `else {$t${attribute}增减文本 = ''}; $t${attribute}变动 = 0; $t${attribute}附属文本 = $t${effect1}文本 + $t${effect2}文本 + $t${attribute}增减文本; ` +
    `if $t${attribute}附属文本 {$t${attribute}附属文本 = \`（{$t${attribute}附属文本}）\`}; $t${attribute}附属文本` +
    "}"
}

// const statusExpr = "{" +
//   "if 缓慢 {$t缓慢文本 = '缓慢'; $t存在状态效果 = 1} " +
//   "else {$t缓慢文本 = ''}; " +
//   "if 眩晕 {$t眩晕文本 = $t存在状态效果 ? '+眩晕' : '眩晕'; $t存在状态效果 = 1} " +
//   "else {$t眩晕文本 = ''}; " +
//   "if 虚弱 {$t虚弱文本 = $t存在状态效果 ? '+虚弱' : '虚弱'; $t存在状态效果 = 1} " +
//   "else {$t虚弱文本 = ''}; " +
//   "if 动摇 {$t动摇文本 = $t存在状态效果 ? '+动摇' : '动摇'; $t存在状态效果 = 1} " +
//   "else {$t动摇文本 = ''}; " +
//   "if 愤怒 {$t愤怒文本 = $t存在状态效果 ? '+愤怒' : '愤怒'; $t存在状态效果 = 1} " +
//   "else {$t愤怒文本 = ''}; " +
//   "if 中毒 {$t中毒文本 = $t存在状态效果 ? '+中毒' : '中毒'; $t存在状态效果 = 1} " +
//   "else {$t中毒文本 = ''}; " +
//   "$t存在状态效果 = 0; " +
//   "$t状态效果 = $t缓慢文本 + $t眩晕文本 + $t虚弱文本 + $t动摇文本 + $t愤怒文本 + $t中毒文本; " +
//   "if $t状态效果 == '' {$t状态效果 = '无'}" +
//   "}" +
//   "{$t状态效果}"

export const ruleTemplate = {
  "name": "fu",
  "fullName": "最终物语",
  "authors": ["Mint Cider"],
  "version": "0.1.0",
  "updatedTime": "2024.10.07",
  "templateVer": "1.0",

  // .set 相关内容，使用.set fish开启，切6面骰，并提示enableTip中的内容
  "setConfig": {
    "diceSides": 6,
    "enableTip": "已切换至 6 面骰，并自动开启最终物语（seal-fu）扩展",
    "keys": ["fu", "最终物语"],
    "relatedExt": ["seal-fu"]
  },

  // sn相关内容，可使用.sn fish自动设置名片
  "nameTemplate": {
    "fu": {
      "template": "{$t玩家_RAW} HP{生命值}/{生命值上限} MP{精神值}/{精神值上限} IP{库存点}/{库存点上限} FP{物语点} Z{泽尼特} PD{防御} MD{魔防}",
      "helpText": "自动设置最终物语名片"
    },
    "fuS": {
      "template": "{$t玩家_RAW} HP{生命值}/{生命值上限} MP{精神值}/{精神值上限} PD{防御} MD{魔防}",
      "helpText": "自动设置最终物语简短版名片"
    }
  },

  "attrConfig": {
    // st show 置顶内容
    "top": ["灵巧", "洞察", "力量", "意志"],
    "sortBy": "name",
    // st show 隐藏内容
    "ignores": ["生命值上限", "精神值上限", "库存点上限",
      "灵巧骰面", "灵巧骰面初始值", "洞察骰面", "洞察骰面初始值", "力量骰面", "力量骰面初始值", "意志骰面", "意志骰面初始值",
      "灵巧骰面增减值", "洞察骰面增减值", "力量骰面增减值", "意志骰面增减值",
      "缓慢", "眩晕", "虚弱", "动摇", "愤怒", "中毒",
      "牵绊一", "牵绊二", "牵绊三", "牵绊四", "牵绊五", "牵绊六",
      "牵绊一赞赏", "牵绊一忠诚", "牵绊一喜爱",
      "牵绊二赞赏", "牵绊二忠诚", "牵绊二喜爱",
      "牵绊三赞赏", "牵绊三忠诚", "牵绊三喜爱",
      "牵绊四赞赏", "牵绊四忠诚", "牵绊四喜爱",
      "牵绊五赞赏", "牵绊五忠诚", "牵绊五喜爱",
      "牵绊六赞赏", "牵绊六忠诚", "牵绊六喜爱",
      "牵绊数"
    ],
    // st show 展示内容，例如到 st show hp 会展示“生命值: 10/14”
    "showAs": {
      "生命值": "{生命值}/{生命值上限}",
      "精神值": "{精神值}/{精神值上限}",
      "库存点": "{库存点}/{库存点上限}",
      "灵巧": generateAttributeExpr("灵巧"),
      "洞察": generateAttributeExpr("洞察"),
      "力量": generateAttributeExpr("力量"),
      "意志": generateAttributeExpr("意志"),
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
    "库存点": ["ip", "inventory point", "inventory points"],
    "库存点上限": ["ipmax"],
    "物语点": ["fp", "fabula point", "fabula points"],
    "泽尼特": ["z", "zenit"],
    "先攻修正值": ["im", "initiative modifier"],
    "物防": ["pd", "df", "defense", "物理防御"],
    "魔防": ["md", "magical defense", "魔法防御"],
    "灵巧骰面初始值": ["dex", "dexterity", "灵巧"],
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

export const rcHelp = "最终物语检定指令：\n\n" +
  ".rc <属性 1>+<属性 2>+<修正值>\n\n" +
  "支持的属性为：灵巧、洞察、力量、意志、dex、ins、mig、wlp，不区分大小写\n" +
  "支持的修正值为：整数\n" +
  "例子：\n" +
  ".rc 灵巧+洞察+1\n" +
  ".rc mig+wlp-2"

export const riHelp = "最终物语先攻检定指令：\n\n" +
  ".ri [修正值]\n\n" +
  "自动进行一次「灵巧+洞察+先攻修正值」的检定，可以额外附加一个整数修正值\n" +
  "例子：\n" +
  ".ri\n" +
  ".ri +3"

export const buffHelp = "最终物语状态效果指令：\n\n" +
  ".buff <状态效果>：切换状态效果\n" +
  ".buff add <状态效果>：附加状态效果\n" +
  ".buff del <状态效果>：消除状态效果\n" +
  ".buff clr：消除全部状态效果\n\n" +
  "支持的状态效果为：缓慢、眩晕、虚弱、动摇、愤怒、中毒"

export const dsHelp = "最终物语临时调整属性骰指令：\n\n" +
  ".ds <属性>+<调整值>：将对应属性骰增大或减小对应级别\n" +
  ".ds rst <属性>：重置对应属性骰\n" +
  ".ds rst all：重置全部属性骰\n\n" +
  "支持的属性为：灵巧、洞察、力量、意志、dex、ins、mig、wlp，不区分大小写\n" +
  "支持的调整值为：整数\n" +
  "例子：" +
  ".ds 力量+1：力量属性骰增大一级（6 ➯ 8 ➯ 10 ➯ 12）\n" +
  ".ds dex-1：灵巧属性骰减小一级（12 ➯ 10 ➯ 8 ➯ 6）"

export const bondHelp = "最终物语牵绊指令：\n\n" +
  ".bond add <名字> <情感>：与<名字>建立情感为<情感>的牵绊\n" +
  ".bond del <编号>/<名字>：遗忘对应的牵绊\n" +
  ".bond clr：遗忘全部牵绊\n" +
  ".bond emo add <编号>/<名字> <情感>：为对应牵绊添加对应情感\n" +
  ".bond emo del <编号>/<名字> <情感>：遗忘对应牵绊的对应情感\n" +
  ".bond list：查看所有牵绊\n\n" +
  "支持的情感为：赞赏、自卑、忠诚、怀疑、喜爱、仇恨"

export const clkHelp = "最终物语命刻指令：\n\n" +
  ".clk add <名字> <大小> [进度]：创建大小为<大小>，名字为<名字>的命刻，进度默认为0\n" +
  ".clk del <名字>：删除对应的命刻\n" +
  ".clk clr：删除全部命刻\n" +
  ".clk fill <名字> <进度变化>：使对应命刻的进度发生对应变化\n" +
  ".clk list：查看群内全部命刻\n\n" +
  "支持的大小为：正整数\n" +
  "支持的进度为：非负整数\n" +
  "支持的进度变化为：整数"

export const attributeAlias = {
  "dex": "灵巧",
  "ins": "洞察",
  "mig": "力量",
  "wlp": "意志"
}

export type Clock = {
  name: string;
  size: number;
  current: number;
}
