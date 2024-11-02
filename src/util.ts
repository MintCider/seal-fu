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
  seal.ext.registerStringConfig(ext, "先攻修改值别名", `["im", "initiative modifier", "先攻"]`);
  seal.ext.registerStringConfig(ext, "物防别名", `["pd", "df", "defense", "物理防御"]`);
  seal.ext.registerStringConfig(ext, "魔防别名", `["md", "magical defense", "魔法防御"]`);
  seal.ext.registerStringConfig(ext, "敏捷骰面初始值别名", `["dex", "dexterity", "敏捷"]`);
  seal.ext.registerStringConfig(ext, "感知骰面初始值别名", `["ins", "insight", "感知"]`);
  seal.ext.registerStringConfig(ext, "力量骰面初始值别名", `["mig", "might", "力量"]`);
  seal.ext.registerStringConfig(ext, "意志骰面初始值别名", `["wlp", "willpower", "意志"]`);
}

export function generateAttributeAlias(ext: seal.ExtInfo): {
  [key: string]: string
} {
  const result: { [key: string]: string } = {};
  result["敏捷"] = "敏捷";
  result["感知"] = "感知";
  result["力量"] = "力量";
  result["意志"] = "意志";
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "敏捷骰面初始值别名"))) {
    result[alias] = "敏捷";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "感知骰面初始值别名"))) {
    result[alias] = "感知";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "力量骰面初始值别名"))) {
    result[alias] = "力量";
  }
  for (const alias of JSON.parse(seal.ext.getStringConfig(ext, "意志骰面初始值别名"))) {
    result[alias] = "意志";
  }
  return result;
}

export function reEvaluateAttributes(ctx: seal.MsgContext) {
  for (const attribute of ["敏捷", "感知", "力量", "意志"]) {
    let dsMod = seal.vars.intGet(ctx, `${attribute}骰面增减值`)[0];
    if (seal.vars.intGet(ctx, attributeEffects[attribute][0])[0]) {
      dsMod -= 1;
    }
    if (seal.vars.intGet(ctx, attributeEffects[attribute][1])[0]) {
      dsMod -= 1;
    }
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
    seal.vars.intSet(ctx, `${attribute}骰面`, ds);
  }
  seal.setPlayerGroupCard(ctx, ctx.player.autoSetNameTemplate);
}

export function removeBondByIndex(ctx: seal.MsgContext, index: number) {
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
