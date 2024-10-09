import {
  attributeAlias,
  bondHelp,
  buffHelp,
  clkHelp,
  Clock,
  dsHelp, emoToKey, emoToValue,
  generateAttributeStatusExpr, negEmo, numToChinese,
  rcHelp,
  riHelp,
  ruleTemplate
} from "./data";
import {reEvaluateAttributes, removeBondByIndex} from "./util";

function registerTemplate() {
  try {
    seal.gameSystem.newTemplate(JSON.stringify(ruleTemplate));
  } catch (e) {
    console.log(e);
  }
}

// 检定
function commandRc(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const command = cmdArgs.getArgN(1);
  if (command === "help") {
    seal.replyToSender(ctx, msg, rcHelp);
    return seal.ext.newCmdExecuteResult(true);
  }
  const checkStr = cmdArgs.getRestArgsFrom(1).replace(/\s+/g, '');
  const matches = checkStr.match(/^(灵巧|洞察|力量|意志|dex|ins|mig|wlp)\+(灵巧|洞察|力量|意志|dex|ins|mig|wlp)([+-]\d+)?$/i);
  if (!matches) {
    seal.replyToSender(ctx, msg, "检定格式有误，可使用 .rc help 查看使用说明");
    return seal.ext.newCmdExecuteResult(true);
  }
  const attribute1: string = matches[1].toLowerCase() in attributeAlias ?
    attributeAlias[matches[1].toLowerCase()] : matches[1];
  const attribute2: string = matches[2].toLowerCase() in attributeAlias ?
    attributeAlias[matches[2].toLowerCase()] : matches[2];
  const modifier: string = matches[3];
  seal.format(ctx, `{if ${attribute1}骰面 == 0 {${attribute1}骰面 = ${attribute1}骰面初始值}}`);
  const attributeNumber1 = seal.vars.intGet(ctx, `${attribute1}骰面`)[0];
  if (!attributeNumber1) {
    seal.replyToSender(ctx, msg, seal.format(ctx, `{$t玩家}未设置${attribute1}属性`));
    return seal.ext.newCmdExecuteResult(true);
  }
  seal.format(ctx, `{if ${attribute2}骰面 == 0 {${attribute2}骰面 = ${attribute2}骰面初始值}}`);
  const attributeNumber2 = seal.vars.intGet(ctx, `${attribute2}骰面`)[0];
  if (!attributeNumber2) {
    seal.replyToSender(ctx, msg, seal.format(ctx, `{$t玩家}未设置${attribute2}属性`));
    return seal.ext.newCmdExecuteResult(true);
  }
  const modifierNumber = modifier ? Number(modifier) : 0;
  const roll1 = Number(seal.format(ctx, `{d${attributeNumber1}}`));
  const roll2 = Number(seal.format(ctx, `{d${attributeNumber2}}`));
  const result = roll1 + roll2 + modifierNumber;
  const hr = roll1 > roll2 ? roll1 : roll2;
  const fumble = roll1 === 1 && roll2 === 1;
  const criticalSuccess = roll1 === roll2 && roll1 >= 6;
  seal.replyToSender(ctx, msg,
    seal.vars.strGet(ctx, "$t玩家")[0] + `的${attribute1}+${attribute2}${modifier ? modifier : ""}检定结果为：` +
    `d${attributeNumber1}` + seal.format(ctx, generateAttributeStatusExpr(attribute1)) +
    `+d${attributeNumber2}` + seal.format(ctx, generateAttributeStatusExpr(attribute2)) +
    `${modifier ? modifier : ""}=` +
    `[${roll1}+${roll2}${modifier ? modifier : ""}]=${result} ` +
    `${fumble ? "大失败！" : ""}${criticalSuccess ? "大成功！" : ""}\n` +
    `HR：${hr}`
  );
  return seal.ext.newCmdExecuteResult(true);
}

// 先攻检定
function commandRi(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const modifier = cmdArgs.getArgN(1);
  if (modifier === "help") {
    seal.replyToSender(ctx, msg, riHelp);
    return seal.ext.newCmdExecuteResult(true);
  }
  if (!modifier.match(/^([+-]\d+)?$/)) {
    seal.replyToSender(ctx, msg, "先攻检定的额外修正值格式错误，可以使用 .ri help 查看使用说明");
    return seal.ext.newCmdExecuteResult(true);
  }
  seal.format(ctx, `{if 灵巧骰面 == 0 {灵巧骰面 = 灵巧骰面初始值}}`);
  const dexNumber = seal.vars.intGet(ctx, `灵巧骰面`)[0];
  if (!dexNumber) {
    seal.replyToSender(ctx, msg, seal.format(ctx, `{$t玩家}未设置灵巧属性`));
    return seal.ext.newCmdExecuteResult(true);
  }
  seal.format(ctx, `{if 洞察骰面 == 0 {洞察骰面 = 洞察骰面初始值}}`);
  const insNumber = seal.vars.intGet(ctx, `洞察骰面`)[0];
  if (!insNumber) {
    seal.replyToSender(ctx, msg, seal.format(ctx, `{$t玩家}未设置洞察属性`));
    return seal.ext.newCmdExecuteResult(true);
  }
  const modifierNumber = modifier ? Number(modifier) : 0;
  const dexRoll = Number(seal.format(ctx, `{d${dexNumber}}`));
  const insRoll = Number(seal.format(ctx, `{d${insNumber}}`));
  const im = seal.vars.intGet(ctx, "先攻修正值")[0];
  const result = dexRoll + insRoll + modifierNumber + im;
  const fumble = dexRoll === 1 && insRoll === 1;
  const criticalSuccess = dexRoll === insRoll && dexRoll >= 6;
  seal.replyToSender(ctx, msg,
    seal.vars.strGet(ctx, "$t玩家")[0] + `的先攻检定结果为：` +
    `d${dexNumber}` + seal.format(ctx, generateAttributeStatusExpr("灵巧")) +
    `+d${insNumber}` + seal.format(ctx, generateAttributeStatusExpr("洞察")) +
    `${im >= 0 ? `+${im}（先攻修正）` : `${im}（先攻修正）`}${modifier ? modifier : ""}=` +
    `[${dexRoll}+${insRoll}${im >= 0 ? `+${im}` : `${im}`}${modifier ? modifier : ""}]=${result} ` +
    `${fumble ? "大失败！" : ""}${criticalSuccess ? "大成功！" : ""}`
  );
  return seal.ext.newCmdExecuteResult(true);
}

// 状态效果
function commandBuff(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const command = cmdArgs.getArgN(1);
  switch (command) {
    case "help": {
      seal.replyToSender(ctx, msg, buffHelp);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "缓慢":
    case "眩晕":
    case "虚弱":
    case "动摇":
    case "愤怒":
    case "中毒": {
      const effect = seal.vars.intGet(ctx, command)[0];
      if (effect) {
        seal.vars.intSet(ctx, command, 0);
        reEvaluateAttributes(ctx);
        seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `的${command}状态消退了……`);
        return seal.ext.newCmdExecuteResult(true);
      } else {
        seal.vars.intSet(ctx, command, 1);
        reEvaluateAttributes(ctx);
        seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `进入${command}状态了……`);
        return seal.ext.newCmdExecuteResult(true);
      }
    }
    case "add": {
      const effect = cmdArgs.getArgN(2);
      if (!["缓慢", "眩晕", "虚弱", "动摇", "愤怒", "中毒"].includes(effect)) {
        seal.replyToSender(ctx, msg, "状态效果有误，可使用 .buff help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      seal.vars.intSet(ctx, effect, 1);
      reEvaluateAttributes(ctx);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `进入${effect}状态了……`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "del": {
      const effect = cmdArgs.getArgN(2);
      if (!["缓慢", "眩晕", "虚弱", "动摇", "愤怒", "中毒"].includes(effect)) {
        seal.replyToSender(ctx, msg, "状态效果有误，可使用 .buff help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      seal.vars.intSet(ctx, effect, 0);
      reEvaluateAttributes(ctx);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `的${effect}状态消退了……`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "clr": {
      for (const effect of ["缓慢", "眩晕", "虚弱", "动摇", "愤怒", "中毒"]) {
        seal.vars.intSet(ctx, effect, 0);
      }
      reEvaluateAttributes(ctx);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `的全部状态消退了……`);
      return seal.ext.newCmdExecuteResult(true);
    }
    default: {
      seal.replyToSender(ctx, msg, "格式有误，可使用 .buff help 查看使用说明");
      return seal.ext.newCmdExecuteResult(true);
    }
  }
}

// 属性增减
function commandDs(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const command = cmdArgs.getArgN(1);
  if (command === "help") {
    seal.replyToSender(ctx, msg, dsHelp);
    return seal.ext.newCmdExecuteResult(true);
  }
  if (command === "rst") {
    let attribute = cmdArgs.getArgN(2);
    if (attribute.match(/^all$/i)) {
      seal.vars.intSet(ctx, "灵巧骰面增减值", 0);
      seal.vars.intSet(ctx, "洞察骰面增减值", 0);
      seal.vars.intSet(ctx, "力量骰面增减值", 0);
      seal.vars.intSet(ctx, "意志骰面增减值", 0);
      reEvaluateAttributes(ctx);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + "全部属性骰的临时变动重置了");
      return seal.ext.newCmdExecuteResult(true);
    }
    if (!attribute.match(/^(灵巧|洞察|力量|意志|dex|ins|mig|wlp)$/i)) {
      seal.replyToSender(ctx, msg, "属性有误，可使用 .ds help 查看使用说明");
      return seal.ext.newCmdExecuteResult(true);
    }
    attribute = attribute.toLowerCase() in attributeAlias ?
      attributeAlias[attribute.toLowerCase()] : attribute;
    seal.vars.intSet(ctx, `${attribute}骰面增减值`, 0);
    reEvaluateAttributes(ctx);
    seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `${attribute}属性骰的临时变动重置了`);
    return seal.ext.newCmdExecuteResult(true);
  }
  const dsStr = cmdArgs.getRestArgsFrom(1).replace(/\s+/g, '');
  const matches = dsStr.match(/^(灵巧|洞察|力量|意志|dex|ins|mig|wlp)([+-]\d+)$/i);
  if (!matches) {
    seal.replyToSender(ctx, msg, "属性变动格式有误，可使用 .ds help 查看使用说明");
    return seal.ext.newCmdExecuteResult(true);
  }
  const attribute: string = matches[1].toLowerCase() in attributeAlias ?
    attributeAlias[matches[1].toLowerCase()] : matches[1];
  const modifier = matches[2];
  let ds = seal.vars.intGet(ctx, `${attribute}骰面增减值`)[0];
  ds += Number(modifier);
  seal.vars.intSet(ctx, `${attribute}骰面增减值`, ds);
  reEvaluateAttributes(ctx);
  seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `${attribute}属性骰临时${modifier}`);
  return seal.ext.newCmdExecuteResult(true);
}

// 牵绊
function commandBond(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const bondNum = seal.vars.intGet(ctx, "牵绊数")[0];
  const command = cmdArgs.getArgN(1);
  switch (command) {
    case "help": {
      seal.replyToSender(ctx, msg, bondHelp);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "add": {
      if (bondNum >= 6) {
        seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `已有${bondNum}条牵绊，不能再添加新牵绊`);
        return seal.ext.newCmdExecuteResult(true);
      }
      const name = cmdArgs.getArgN(2);
      const emo = cmdArgs.getArgN(3);
      if (!["赞赏", "自卑", "忠诚", "怀疑", "喜爱", "仇恨"].includes(emo)) {
        seal.replyToSender(ctx, msg, "情感有误，可使用 .bond help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      seal.vars.strSet(ctx, `牵绊${numToChinese[bondNum + 1]}`, name);
      seal.vars.intSet(ctx, `牵绊${numToChinese[bondNum + 1]}${emoToKey[emo]}`, emoToValue[emo]);
      seal.vars.intSet(ctx, "牵绊数", bondNum + 1);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<${name}>建立了${emo}牵绊`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "del": {
      const target = cmdArgs.getArgN(2);
      let index = 0;
      if(target.match(/^[1-6]$/)) {
        if(Number(target) > bondNum) {
          seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `没有第${target}条牵绊`);
          return seal.ext.newCmdExecuteResult(true);
        }
        index = Number(target)
      }
      for (let i = 1; i <= bondNum; i++) {
        if(seal.vars.strGet(ctx, `牵绊${numToChinese[i]}`)[0] === target) {
          index = i;
          break;
        }
      }
      if(index === 0) {
        seal.replyToSender(ctx, msg, `找不到要遗忘的目标牵绊：${target}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      removeBondByIndex(ctx, index);
      if(target.match(/^[1-6]$/)) {
        seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `不再有第${target}条牵绊`);
      } else {
        seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<${target}>不再有牵绊`);
      }
      return seal.ext.newCmdExecuteResult(true);
    }
    case "clr": {
      for (let i = 1; i <= 6; i++) {
        seal.vars.strSet(ctx, `牵绊${numToChinese[i]}`, "");
        seal.vars.intSet(ctx, `牵绊${numToChinese[i]}赞赏`, 0);
        seal.vars.intSet(ctx, `牵绊${numToChinese[i]}忠诚`, 0);
        seal.vars.intSet(ctx, `牵绊${numToChinese[i]}喜爱`, 0);
      }
      seal.vars.intSet(ctx, "牵绊数", 0);
      seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `遗忘了全部牵绊`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "emo": {
      const option = cmdArgs.getArgN(2);
      const target = cmdArgs.getArgN(3);
      const emo = cmdArgs.getArgN(4);
      let index = 0;
      if(target.match(/^[1-6]$/)) {
        if(Number(target) > bondNum) {
          seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `没有第${target}条牵绊`);
          return seal.ext.newCmdExecuteResult(true);
        }
        index = Number(target)
      }
      for (let i = 1; i <= bondNum; i++) {
        if(seal.vars.strGet(ctx, `牵绊${numToChinese[i]}`)[0] === target) {
          index = i;
          break;
        }
      }
      if(index === 0) {
        seal.replyToSender(ctx, msg, `找不到目标牵绊：${target}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (!["赞赏", "自卑", "忠诚", "怀疑", "喜爱", "仇恨"].includes(emo)) {
        seal.replyToSender(ctx, msg, "情感有误，可使用 .bond help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      switch (option) {
        case "add": {
          if(seal.vars.intGet(ctx, `牵绊${numToChinese[index]}${emoToKey[emo]}`)[0] === 0) {
            seal.vars.intSet(ctx, `牵绊${numToChinese[index]}${emoToKey[emo]}`, emoToValue[emo]);
            seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<` + seal.vars.strGet(ctx, `牵绊${numToChinese[index]}`)[0] + `>的牵绊增加了${emo}情感`);
            return seal.ext.newCmdExecuteResult(true);
          } else {
            seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<` + seal.vars.strGet(ctx, `牵绊${numToChinese[index]}`)[0] + `>的牵绊已有` +
            `${seal.vars.intGet(ctx, `牵绊${numToChinese[index]}${emoToKey[emo]}`)[0] === emoToValue[emo] ? emo : negEmo[emo]}情感，` +
            `不能再增加${emo}情感`);
            return seal.ext.newCmdExecuteResult(true);
          }
        }
        case "del": {
          if(seal.vars.intGet(ctx, `牵绊${numToChinese[index]}${emoToKey[emo]}`)[0] === emoToValue[emo]) {
            seal.vars.intSet(ctx, `牵绊${numToChinese[index]}${emoToKey[emo]}`, 0);
            seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<` + seal.vars.strGet(ctx, `牵绊${numToChinese[index]}`)[0] + `>的牵绊不再有${emo}情感`);
            return seal.ext.newCmdExecuteResult(true);
          } else {
            seal.replyToSender(ctx, msg, seal.vars.strGet(ctx, "$t玩家")[0] + `与<` + seal.vars.strGet(ctx, `牵绊${numToChinese[index]}`)[0] + `>的牵绊不存在${emo}情感`);
            return seal.ext.newCmdExecuteResult(true);
          }
        }
        default: {
          seal.replyToSender(ctx, msg, "不支持的情感操作，可使用 .bond help 查看使用说明");
          return seal.ext.newCmdExecuteResult(true);
        }
      }
    }
    case "list": {
      let result = "";
      for (let i = 1; i <= bondNum; i++) {
        result += `牵绊${numToChinese[i]}：${seal.vars.strGet(ctx, `牵绊${numToChinese[i]}`)[0]}-`;
        let admiration = "";
        let loyalty = "";
        let affection = "";
        switch(seal.vars.intGet(ctx, `牵绊${numToChinese[i]}赞赏`)[0]) {
          case 1: admiration = "赞赏"; break;
          case -1: admiration = "自卑"; break;
          default: admiration = "";
        }
        switch(seal.vars.intGet(ctx, `牵绊${numToChinese[i]}忠诚`)[0]) {
          case 1: loyalty = "忠诚"; break;
          case -1: loyalty = "怀疑"; break;
          default: loyalty = "";
        }
        switch(seal.vars.intGet(ctx, `牵绊${numToChinese[i]}喜爱`)[0]) {
          case 1: affection = "喜爱"; break;
          case -1: affection = "仇恨"; break;
          default: affection = "";
        }
        if (affection && (admiration || loyalty)) {
          affection = "与" + affection;
        }
        if (loyalty && admiration && affection) {
          loyalty = "、" + loyalty;
        }
        if (loyalty && admiration && !affection) {
          loyalty = "与" + loyalty;
        }
        result += admiration + loyalty + affection + "\n";
      }
      seal.replyToSender(ctx, msg, result ? result : seal.vars.strGet(ctx, "$t玩家")[0] + "无牵绊");
      return seal.ext.newCmdExecuteResult(true);
    }
    default: {
      seal.replyToSender(ctx, msg, "格式有误，可使用 .bond help 查看使用说明");
      return seal.ext.newCmdExecuteResult(true);
    }
  }
}

// 命刻
function commandClk(ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs): seal.CmdExecuteResult {
  const command = cmdArgs.getArgN(1);
  const clocks: Clock[] = JSON.parse(seal.vars.strGet(ctx, "$gfu_clocks")[0] ? seal.vars.strGet(ctx, "$gfu_clocks")[0] : "[]");
  switch (command) {
    case "help": {
      seal.replyToSender(ctx, msg, clkHelp);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "add": {
      const name = cmdArgs.getArgN(2);
      const size = cmdArgs.getArgN(3);
      const current = cmdArgs.getArgN(4);
      if (!size.match(/^\d+$/)) {
        seal.replyToSender(ctx, msg, "命刻大小有误，可使用 .clk help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      if (current && !current.match(/^\d+$/)) {
        seal.replyToSender(ctx, msg, "命刻进度有误，可使用 .clk help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      let currentNum = current ? Number(current) : 0;
      if (currentNum > Number(size)) {
        currentNum = Number(size);
      }
      clocks.push({
        name: name,
        size: Number(size),
        current: current ? Number(current) : 0,
      });
      seal.vars.strSet(ctx, "$gfu_clocks", JSON.stringify(clocks));
      seal.replyToSender(ctx, msg, `已创建大小为${size}的命刻：${name}`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "del": {
      const name = cmdArgs.getArgN(2);
      const index = clocks.findIndex(clock => clock.name === name);
      if (index === -1) {
        seal.replyToSender(ctx, msg, `群内不存在命刻：${name}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      clocks.splice(index, 1);
      seal.vars.strSet(ctx, "$gfu_clocks", JSON.stringify(clocks));
      seal.replyToSender(ctx, msg, `已删除命刻：${name}`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "clr": {
      seal.vars.strSet(ctx, "$gfu_clocks", JSON.stringify([]));
      seal.replyToSender(ctx, msg, "群内全部命刻已删除");
      return seal.ext.newCmdExecuteResult(true);
    }
    case "fill": {
      const name = cmdArgs.getArgN(2);
      const numStr = cmdArgs.getArgN(3);
      const index = clocks.findIndex(clock => clock.name === name);
      if (index === -1) {
        seal.replyToSender(ctx, msg, `群内不存在命刻：${name}`);
        return seal.ext.newCmdExecuteResult(true);
      }
      if (!numStr.match(/^[+-]?\d+$/)) {
        seal.replyToSender(ctx, msg, "数字有误，可使用 .clk help 查看使用说明");
        return seal.ext.newCmdExecuteResult(true);
      }
      clocks[index].current += Number(numStr);
      if (clocks[index].current < 0) {
        clocks[index].current = 0;
      }
      if (clocks[index].current > clocks[index].size) {
        clocks[index].current = clocks[index].size;
      }
      seal.vars.strSet(ctx, "$gfu_clocks", JSON.stringify(clocks));
      seal.replyToSender(ctx, msg, `命刻：${clocks[index].name}，大小：${clocks[index].size}，当前进度：${clocks[index].current}\n`);
      return seal.ext.newCmdExecuteResult(true);
    }
    case "list": {
      let result = "";
      for (const clock of clocks) {
        result += `命刻：${clock.name}，大小：${clock.size}，当前进度：${clock.current}\n`;
      }
      seal.replyToSender(ctx, msg, result ? result : "群内无命刻");
      return seal.ext.newCmdExecuteResult(true);
    }
    default: {
      seal.replyToSender(ctx, msg, "格式有误，可使用 .clk help 查看使用说明");
      return seal.ext.newCmdExecuteResult(true);
    }
  }
}

function registerCommand(ext: seal.ExtInfo, key: string, help: string, func: (ctx: seal.MsgContext, msg: seal.Message, cmdArgs: seal.CmdArgs) => seal.CmdExecuteResult) {
  const cmd = seal.ext.newCmdItemInfo();
  cmd.name = key;
  cmd.help = help;
  cmd.solve = func;
  ext.cmdMap[key] = cmd;
}

function main() {
  registerTemplate();
  // 注册扩展
  let ext = seal.ext.find("seal-fu");
  if (!ext) {
    ext = seal.ext.new("seal-fu", "Mint Cider", "0.1.0");
    registerCommand(ext, "rc", rcHelp, commandRc);
    registerCommand(ext, "ri", riHelp, commandRi);
    registerCommand(ext, "buff", buffHelp, commandBuff);
    registerCommand(ext, "ds", dsHelp, commandDs);
    registerCommand(ext, "bond", bondHelp, commandBond);
    registerCommand(ext, "clk", clkHelp, commandClk);
    seal.ext.register(ext);
  }
}

main();
