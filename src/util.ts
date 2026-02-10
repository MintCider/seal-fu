import {attributeEffects, numToChinese} from "./data";

export function registerConfigs(ext: seal.ExtInfo) {
  seal.ext.registerStringConfig(ext, "生命值别名", `["hp", "hit point", "hit points"]`);
  seal.ext.registerStringConfig(ext, "生命值上限别名", `["hpmax"]`);
  seal.ext.registerStringConfig(ext, "精神值别名", `["mp", "mental point", "mental points"]`);
  seal.ext.registerStringConfig(ext, "精神值上限别名", `["mpmax"]`);
  seal.ext.registerStringConfig(ext, "物资点别名", `["ip", "inventory point", "inventory points"]`);
  seal.ext.registerStringConfig(ext, "物资点上限别名", `["ipmax"]`);
  seal.ext.registerStringConfig(ext, "物语点别名", `["fp", "fabula point", "fabula points"]`);
  seal.ext.registerStringConfig(ext, "金币别名", `["z", "zenit"]`);
  seal.ext.registerStringConfig(ext, "先攻修正值别名", `["im", "initiative modifier", "先攻"]`);
  seal.ext.registerStringConfig(ext, "物防别名", `["pd", "df", "defense", "物理防御"]`);
  seal.ext.registerStringConfig(ext, "魔防别名", `["md", "magical defense", "魔法防御"]`);
  seal.ext.registerStringConfig(ext, "敏捷骰面初始值别名", `["dex", "dexterity", "敏捷"]`);
  seal.ext.registerStringConfig(ext, "洞察骰面初始值别名", `["ins", "insight", "洞察"]`);
  seal.ext.registerStringConfig(ext, "力量骰面初始值别名", `["mig", "might", "力量"]`);
  seal.ext.registerStringConfig(ext, "意志骰面初始值别名", `["wlp", "willpower", "意志"]`);
}

export function genAttrAlias(ext: seal.ExtInfo): {
  [key: string]: string
} {
  const result: { [key: string]: string } = {};
  result["敏捷"] = "敏捷";
  result["洞察"] = "洞察";
  result["力量"] = "力量";
  result["意志"] = "意志";
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "敏捷骰面初始值别名"))) {
    result[alias] = "敏捷";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "洞察骰面初始值别名"))) {
    result[alias] = "洞察";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "力量骰面初始值别名"))) {
    result[alias] = "力量";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "意志骰面初始值别名"))) {
    result[alias] = "意志";
  }
  return result;
}

export function reEvalAttr(ctx: seal.MsgContext, ext: seal.ExtInfo) {
  for (const attribute of ["敏捷", "洞察", "力量", "意志"]) {
    // Dice size modification
    let dsMod = seal.vars.intGet(ctx, `${attribute}骰面增减值`)[0];
    // Status effects
    if (seal.vars.intGet(ctx, attributeEffects[attribute][0])[0]) {
      dsMod -= 1;
    }
    if (seal.vars.intGet(ctx, attributeEffects[attribute][1])[0]) {
      dsMod -= 1;
    }
    // Evaluate
    let ds = seal.vars.intGet(ctx, `${attribute}骰面初始值`)[0];
    if (ds == 0) {
      continue;
    }
    ds += dsMod * 2;
    if (ds < 6) {
      ds = 6;
    }
    if (ds > 12) {
      ds = 12;
    }
    // Store
    seal.vars.intSet(ctx, `${attribute}骰面`, ds);
  }
  // Retrieve attribute aliases from config
  const attributeAlias = genAttrAlias(ext);
  for (const defense of ["物防", "魔防"]) {
    const [intVal, isInt] = seal.vars.intGet(ctx, defense);
    // Fixed defense
    if (isInt) {
      seal.vars.intSet(ctx, `${defense}计算值`, intVal);
      continue;
    }
    // Defense expression
    const [strVal, isStr] = seal.vars.strGet(ctx, defense);
    if (isStr) {
      // Build aliases string for regexp
      let aliases = "";
      for (const key in attributeAlias) {
        aliases += `${key}|`;
      }
      aliases = aliases.slice(0, -1);
      const defenseRegExp = new RegExp(`^(${aliases})([+-]\\d+)?$`, "i");
      const matches = strVal.replace(/\s+/g, '').toLowerCase().match(defenseRegExp);
      if (!matches) {
        seal.vars.strSet(ctx, `${defense}计算值`, `${defense}表达式错误`);
        continue;
      }
      const attributeVal = seal.vars.intGet(ctx, `${attributeAlias[matches[1]]}骰面`)[0];
      const modifier: string = matches[2];
      const modifierNumber = modifier ? Number(modifier) : 0;
      const defenseVal = attributeVal + modifierNumber;
      seal.vars.intSet(ctx, `${defense}计算值`, defenseVal);
    }
  }
  seal.setPlayerGroupCard(ctx, ctx.player.autoSetNameTemplate);
}

export function rmBondByIdx(ctx: seal.MsgContext, index: number) {
  const bondNum = seal.vars.intGet(ctx, "羁绊数")[0];
  for (let i = index; i <= bondNum - 1; i++) {
    seal.vars.strSet(ctx, `羁绊${numToChinese[i]}`, seal.vars.strGet(ctx, `羁绊${numToChinese[i + 1]}`)[0]);
    seal.vars.intSet(ctx, `羁绊${numToChinese[i]}钦佩`, seal.vars.intGet(ctx, `羁绊${numToChinese[i + 1]}钦佩`)[0]);
    seal.vars.intSet(ctx, `羁绊${numToChinese[i]}忠诚`, seal.vars.intGet(ctx, `羁绊${numToChinese[i + 1]}忠诚`)[0]);
    seal.vars.intSet(ctx, `羁绊${numToChinese[i]}喜爱`, seal.vars.intGet(ctx, `羁绊${numToChinese[i + 1]}喜爱`)[0]);
  }
  seal.vars.strSet(ctx, `羁绊${numToChinese[bondNum]}`, "");
  seal.vars.intSet(ctx, `羁绊${numToChinese[bondNum]}钦佩`, 0);
  seal.vars.intSet(ctx, `羁绊${numToChinese[bondNum]}忠诚`, 0);
  seal.vars.intSet(ctx, `羁绊${numToChinese[bondNum]}喜爱`, 0);

  seal.vars.intSet(ctx, "羁绊数", bondNum - 1);
}

export function rollDice(dice: number) {
  return Math.floor(Math.random() * dice) + 1;
}

export function genAttrStatusExpr(ctx: seal.MsgContext, attribute: string): string {
  const effect1 = attributeEffects[attribute][0];
  const effect2 = attributeEffects[attribute][1];
  const effect1Val = seal.vars.intGet(ctx, effect1)[0];
  const effect2Val = seal.vars.intGet(ctx, effect2)[0];
  const dsMod = seal.vars.intGet(ctx, `${attribute}骰面增减值`)[0];
  let effect1Text: string, effect2Text: string, dsModText: string;
  let dsChange = false;
  if (effect1Val) {
    effect1Text = effect1;
    dsChange = true;
  } else {
    effect1Text = "";
  }
  if (effect2Val) {
    effect2Text = dsChange ? `、${effect2}` : effect2;
    dsChange = true;
  } else {
    effect2Text = "";
  }
  if (dsMod) {
    const dsModCore = dsMod > 0 ? `ds+${dsMod}` : `ds${dsMod}`;
    dsModText = dsChange ? `、${dsModCore}` : dsModCore;
  } else {
    dsModText = "";
  }
  const result = effect1Text + effect2Text + dsModText;
  return result ? `（${effect1Text}${effect2Text}${dsModText}）` : ""
}
