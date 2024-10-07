import {attributeEffects, numToChinese} from "./data";

export function reEvaluateAttributes(ctx: seal.MsgContext) {
  for (const attribute of ["灵巧", "洞察", "力量", "意志"]) {
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
}

export function removeBondByIndex(ctx: seal.MsgContext, index: number) {
  const bondNum = seal.vars.intGet(ctx, "牵绊数")[0];
  for (let i = index; i <= bondNum - 1; i++) {
    seal.vars.strSet(ctx, `牵绊${numToChinese[i]}`, seal.vars.strGet(ctx, `牵绊${numToChinese[i + 1]}`)[0]);
    seal.vars.intSet(ctx, `牵绊${numToChinese[i]}赞赏`, seal.vars.intGet(ctx, `牵绊${numToChinese[i + 1]}赞赏`)[0]);
    seal.vars.intSet(ctx, `牵绊${numToChinese[i]}忠诚`, seal.vars.intGet(ctx, `牵绊${numToChinese[i + 1]}忠诚`)[0]);
    seal.vars.intSet(ctx, `牵绊${numToChinese[i]}喜爱`, seal.vars.intGet(ctx, `牵绊${numToChinese[i + 1]}喜爱`)[0]);
  }
  seal.vars.strSet(ctx, `牵绊${numToChinese[bondNum]}`, "");
  seal.vars.intSet(ctx, `牵绊${numToChinese[bondNum]}赞赏`, 0);
  seal.vars.intSet(ctx, `牵绊${numToChinese[bondNum]}忠诚`, 0);
  seal.vars.intSet(ctx, `牵绊${numToChinese[bondNum]}喜爱`, 0);

  seal.vars.intSet(ctx, "牵绊数", bondNum - 1);
}
