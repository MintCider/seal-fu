# 最终物语规则插件

> [!WARNING]  
> 由于大量术语发生变动，导致人物卡的数据存储格式改变，从 `v0.2.0` 之前版本升级而来的话，会出现数据不匹配。可以通过 `.st clr` 清空旧人物卡属性，参考最新术语翻译，重新创建人物卡。

## 介绍

本插件工作于 [海豹骰点核心](https://github.com/sealdice/sealdice-core)，并基于其 [TS 模板库](https://github.com/sealdice/sealdice-js-ext-template) 实现。

本插件为海豹核心带来了「最终物语（Fabula Ultima）」规则支持。

> [!NOTE]
> 目前，由于官方中文版规则书尚未发布，部分名词采用的是官方中文版《快速开始》使用的翻译，会在官方中文规则书发布后进行修正替换。

## 安装

在本项目 Release 页面中，直接下载最新编译的 JS 文件，或 [点击这里](https://github.com/MintCider/seal-fu/releases/latest/download/seal-fu.js) 下载。随后上传到海豹核心，即可通过 `.set fu` 切换到最终物语规则。

## 命令

### `.fu` 快速帮助

`.fu` 命令会列出所有与最终物语相关的命令，用于快速获取帮助。`.fu st` 命令会向用户展示最终物语规则相关人物卡属性，便于用户创建人物卡。有关最终物语规则插件的详细使用说明请继续阅读。

### `.st` 操作人物卡

`.st` 命令的使用方式请参考 [海豹手册相关内容](https://docs.sealdice.com/use/coc7.html#st-%E6%93%8D%E4%BD%9C%E4%BA%BA%E7%89%A9%E5%8D%A1)，这里着重介绍最终物语规则相关的人物卡属性。

| 属性名         | 默认属性别名                          |
|----------------|---------------------------------------|
| 生命值         | hp、hit point、hit points             |
| 生命值上限     | hpmax                                 |
| 精神值         | mp、mental point、mental points       |
| 精神值上限     | mpmax                                 |
| 物资点         | ip、inventory point、inventory points |
| 物资点上限     | ipmax                                 |
| 物语点         | fp、fabula point、fabula points       |
| 金币           | z、zenit                              |
| 先攻修改值     | im、initiative modifier               |
| 物防           | pd、df、defense、物理防御             |
| 魔防           | md、magical defense、魔法防御         |
| 敏捷骰面初始值 | dex、dexterity、敏捷                  |
| 感知骰面初始值 | ins、insight、感知                    |
| 力量骰面初始值 | mig、might、力量                      |
| 意志骰面初始值 | wlp、willpower、意志                  |

在初始化人物卡时，可以使用任意属性别名进行属性设定，插件会自动将其转化为对应的属性。如果需要修改属性别名（例如，在设置属性或检定时，使用「灵巧」代替「敏捷」），请参考后文的配置项。

> [!NOTE]
> 设定敏捷、感知、力量、意志四维属性时，请输入对应属性骰的面数（6、8、10、12 之一）。当属性骰发生变动时（如状态效果、临时 buff 等），请不要使用 `.st` 修改，请参考后面的 `.buff` 和 `.ds` 命令。

以下几个例子都是合理的属性设定方式：

```text
.st 卡珊德拉-敏捷10感知6力量8意志8生命值50生命值上限50精神值50精神值上限50物资点6物资点上限6物语点3金币170先攻-2物防11魔防8
```

```text
.st dex=10 ins=6 mig=8 wlp=8 hp=50 hpmax=50 mp=50 mpmax=50 ip=6 ipmax=6 fp=3 z=170 im=-2 pd=11 md=8
```

```text
.st 卡珊德拉-dex10 ins6 mig8 wlp8 hp50 hpmax50 mp50 mpmax50 ip6 ipmax6 fp3 z170 im-2 pd11 md8
```

> [!NOTE]
> 从 `v0.3.0` 版本开始，插件支持物防值、魔防值与属性骰联动。当属性骰由于状态效果或临时 buff 发生变动时，物防值、魔防值会自动进行调整。
> 
> 例如：`.st dex=10 ins=8 pd='dex+1' md='ins+2'`，此时物防值为 11，魔防值为 10。随后 `.buff 迟缓`、`.buff 激怒`，属性骰发生变动，物防值会自动调整为 7，魔防值会自动调整为 8。
> 
> 此功能可以配合自动群名片，在属性骰发生变动时，实时修改群名片中的物防值、魔防值。

> [!WARNING]
> 要使用上述的物防、魔防联动属性骰功能，务必注意设置属性时的输入格式：
> 
> 当物防、魔防为固定值时，仍然按照前述设置属性的例子给出数值即可。
> 
> 当物防、魔防与属性骰联动时，必须使用 `.st [物防/魔防（别名）]='<属性（别名）>[+-]<数字>'` 的格式。其中引号可以为英文单引号（`'`）或双引号（`"`），以保证海豹核心正确将其存储为字符串。对应防御部分和 `<属性>` 部分可以使用对应属性的任意属性别名。
> 
> 需要注意的是，如果直接使用形如 `.st pd=dex+1` 的命令，海报核心会直接将其解析为数值，导致插件不能正确跟踪。因此务必使用引号将其包裹。

### `.sn` 自动群名片

`.sn` 命令的使用方式请参考 [海豹手册相关内容](https://docs.sealdice.com/use/log.html#sn-%E8%87%AA%E5%8A%A8%E7%BE%A4%E5%90%8D%E7%89%87)，这里着重介绍最终物语规则提供的三个群名片预设模版。

- `.sn fu`：`角色名 HP50/50 MP50/50 IP6/6 FP3 Z170 PD11 MD8`
- `.sn fuS`：`角色名 HP50/50 MP50/50 PD11 MD8`
- `.sn fuD`：`角色名 HP50/50 MP50/50 D6 I10 M6 W10`

### `.rc` 检定

`.rc <属性 1>+<属性 2>+<修正值>`

此命令支持的属性为：敏捷、感知、力量、意志，以及任何对应四维属性的属性别名（例如：dex、ins、mig、wlp），不区分大小写。属性别名参见上文表格，如需修改属性别名，请参考后文的配置项。

支持的修正值为：整数。

例子：

```text
.rc 敏捷+感知+1
.rc mig+wlp-2
```

```text
<卡珊德拉>的敏捷+感知+1检定结果为：d8（迟缓）+d6+1=[4+6+1]=11
HR：6
```

如果由于状态效果或临时 buff 导致属性骰发生变动，检定回复中会进行提示。如果检定出大成功/大失败，检定回复会进行提示。同时，检定回复会自动显示 HR。

### `.ri` 先攻

`.ri [修正值]`

自动进行一次「敏捷+感知+先攻修改值」的检定，可以额外附加一个整数修正值。

例子：

```text
.ri
.ri +3
```

```text
<卡珊德拉>的先攻检定结果为：d8（迟缓）+d6+0（先攻修改）+3=[7+3+0+3]=13
```

### `.buff` 状态效果

此命令支持的状态效果为：迟缓、眩晕、虚弱、动摇、激怒、中毒。

#### 切换状态效果

`.buff <状态效果>`

为自己附加或消除某种状态效果。

#### 附加状态效果

`.buff add <状态效果>`

#### 消除状态效果

`.buff del <状态效果>`

`.buff clr`

后者会消除全部状态效果。

### `.ds` 临时调整属性骰

此命令支持的属性为：敏捷、感知、力量、意志，以及任何对应四维属性的属性别名（例如：dex、ins、mig、wlp），不区分大小写。属性别名参见上文表格，如需修改属性别名，请参考后文的配置项。

此命令支持的调整值为：整数。

> [!NOTE]
> 每一点调整值会改变属性骰的一个**级别**，即骰面增大或减小 2.

#### 将对应属性骰增大或减小对应级别

`.ds <属性>+<调整值>`

#### 重置属性骰

`.ds rst <属性>`

`.ds rst all`

后者会重置全部属性骰。

#### 例子

> [!NOTE]
> 此命令与状态效果产生的影响叠加计算，并且永远不会超出属性骰的上下限。

```text
.buff 迟缓
.ds 力量+1
.ds dex-1
.rc dex+mig
```

```text
<卡珊德拉>的敏捷+力量检定结果为：d6（迟缓、ds-1）+d10（ds+1）=[3+9]=12
HR：9
```

### `.eval` 核算属性

如上文所述，属性骰发生变动时（如状态效果、临时 buff 等），不应使用 `.st` 修改，而应该使用 `.buff` 或 `.ds` 命令。但如果出于游戏需要，使用 `.st` 命令修改了属性骰的原始值，则需要使用 `.eval` 命令，根据状态效果、临时 buff 等，重新核算属性。

在执行大部分命令时，会自动重新核算属性。但如果发现属性数值仍不符合预期，可以尝试使用该指令进行核算。

### `.bond` 羁绊

> [!NOTE]
> 目前，羁绊仅作为辅助记录，不会对检定产生影响。

此命令支持的情感为：钦佩、自卑、忠诚、猜忌、喜爱、憎恨。

#### 建立羁绊

`.bond add <名字> <情感>`

#### 遗忘羁绊

`.bond del <编号>/<名字>`

`.bond clr`

后者会遗忘全部羁绊。

#### 调整羁绊情感

`.bond emo add <编号>/<名字> <情感>`

`.bond emo del <编号>/<名字> <情感>`

#### 查看所有羁绊

`.bond list`

#### 例子

```text
.bond add 布莱尔 钦佩
```

```text
.bond emo add 1 喜爱
<卡珊德拉>与<布莱尔>的羁绊增加了喜爱情感
```

```text
.bond emo add 1 憎恨
<卡珊德拉>与<布莱尔>的羁绊已有喜爱情感，不能再增加憎恨情感
```

```text
.bond emo del 布莱尔 喜爱
<卡珊德拉>与<布莱尔>的羁绊不再有喜爱情感
```

### `.clk` 命刻

#### 创建命刻

`.clk add <名字> <大小> [进度]`

命刻的进度默认为 0，可以通过提供 `[进度]` 参数调整初始进度。

#### 删除命刻

`.clk del <名字>`

`.clk clr`

后者会删除全部命刻。

#### 调整进度

`.clk fill <名字> <进度变化>`

使对应命刻的进度发生对应变化，进度变化应为正负整数，超过命刻范围（`[0, 命刻大小]`）的变化会限制在范围之内。

#### 查看群内全部命刻
`.clk list`

## 配置项

从 `v0.2.0` 版本开始，插件支持通过配置项自定义属性别名。每个配置项是一个 [JSON](https://www.runoob.com/json/json-tutorial.html) 数组，需要添加属性别名时，将其加入数组，然后**保存配置项并重载插件**即可。

> [!NOTE]
> 填写 JSON 格式时，务必注意全角半角符号（使用英文符号）。

> [!NOTE]
> 保存配置项后必须重载插件，否则修改不会生效。

例如，「敏捷」属性的默认别名为：

```json
// 敏捷骰面初始值别名
["dex", "dexterity", "敏捷"]
```

如果想要使用「灵巧」代替「敏捷」这一名称，可将其修改为：

```json
// 敏捷骰面初始值别名
["dex", "dexterity", "敏捷", "灵巧"]
```

随后，**保存配置项**，并**重载插件**，即可在使用 `.st`、`.rc`、`.ds` 指令时，使用「灵巧」替代「敏捷」。
