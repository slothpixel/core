/*
* Functions for BedWars exp and level conversions.
 */
const EASY_LEVELS = 4;
const EASY_LEVELS_XP = 7000;
const XP_PER_PRESTIGE = 96 * 5000 + EASY_LEVELS_XP;
const LEVELS_PER_PRESTIGE = 100;
const HIGHEST_PRESTIGE = 10;

function getLevelRespectingPrestige(level) {
  if (level > HIGHEST_PRESTIGE * LEVELS_PER_PRESTIGE) {
    return level - HIGHEST_PRESTIGE * LEVELS_PER_PRESTIGE;
  }

  return level % LEVELS_PER_PRESTIGE;
}

function getExpForLevel(level) {
  if (level === 0) return 0;

  const respectedLevel = getLevelRespectingPrestige(level);
  if (respectedLevel > EASY_LEVELS) {
    return 5000;
  }

  switch (respectedLevel) {
    case 1:
      return 500;
    case 2:
      return 1000;
    case 3:
      return 2000;
    case 4:
      return 3500;
    default:
      return 5000;
  }
}
function getLevelForExp(exp) {
  const prestiges = Math.floor(exp / XP_PER_PRESTIGE);
  let level = prestiges * LEVELS_PER_PRESTIGE;
  let expWithoutPrestiges = exp - (prestiges * XP_PER_PRESTIGE);
  let expForEasyLevel;

  for (let i = 1; i <= EASY_LEVELS; i += 1) {
    expForEasyLevel = getExpForLevel(i);
    if (expWithoutPrestiges < expForEasyLevel) {
      break;
    }
    level += 1;
    expWithoutPrestiges -= expForEasyLevel;
  }
  return level + Math.floor(expWithoutPrestiges / 5000);
}
function getLevelFormatted(level) {
  const prestige = Math.floor(level / 100);
  const levelCharsReversed = level.toString().split('').reverse();

  switch (prestige) {
    case 0: return `&7[${level}\u272B]`;
    case 1: return `&f[${level}\u272B]`;
    case 2: return `&6[${level}\u272B]`;
    case 3: return `&b[${level}\u272B]`;
    case 4: return `&2[${level}\u272B]`;
    case 5: return `&3[${level}\u272B]`;
    case 6: return `&4[${level}\u272B]`;
    case 7: return `&d[${level}\u272B]`;
    case 8: return `&9[${level}\u272B]`;
    case 9: return `&5[${level}\u272B]`;

    case 10: return `&c[&6${levelCharsReversed[3]}&e${levelCharsReversed[2]}&a${levelCharsReversed[1]}&b${levelCharsReversed[0]}&d\u272B&5]`;
    case 11: return `&7[&f${level}&7\u272A]`;
    case 12: return `&7[&e${level}&6\u272A&7]`;
    case 13: return `&7[&b${level}&3\u272A&7]`;
    case 14: return `&7[&a${level}&2\u272A&7]`;
    case 15: return `&7[&3${level}&9\u272A&7]`;
    case 16: return `&7[&c${level}&4\u272A&7]`;
    case 17: return `&7[&d${level}&5\u272A&7]`;
    case 18: return `&7[&9${level}&1\u272A&7]`;
    case 19: return `&7[&5${level}&8\u272A&7]`;

    case 20: return `&8[&7${levelCharsReversed[3]}&f${levelCharsReversed[2]}${levelCharsReversed[1]}&7${levelCharsReversed[0]}\u272A&8]`;
    case 21: return `&f[${levelCharsReversed[3]}&e${levelCharsReversed[2]}${levelCharsReversed[1]}&6${levelCharsReversed[0]}&l\u269D&6]`;
    case 22: return `&6[${levelCharsReversed[3]}&f${levelCharsReversed[2]}${levelCharsReversed[1]}&b${levelCharsReversed[0]}&l\u269D&b]`;
    case 23: return `&5[${levelCharsReversed[3]}&d${levelCharsReversed[2]}${levelCharsReversed[1]}&6${levelCharsReversed[0]}&e&l\u269D&e]`;
    case 24: return `&b[${levelCharsReversed[3]}&f${levelCharsReversed[2]}${levelCharsReversed[1]}&7${levelCharsReversed[0]}&l\u269D&8]`;
    case 25: return `&f[${levelCharsReversed[3]}&a${levelCharsReversed[2]}${levelCharsReversed[1]}&2${levelCharsReversed[0]}&l\u269D&2]`;
    case 26: return `&4[${levelCharsReversed[3]}&c${levelCharsReversed[2]}${levelCharsReversed[1]}&d${levelCharsReversed[0]}&l\u269D&5]`;
    case 27: return `&e[${levelCharsReversed[3]}&f${levelCharsReversed[2]}${levelCharsReversed[1]}&8${levelCharsReversed[0]}&l\u269D&8]`;
    case 28: return `&a[${levelCharsReversed[3]}&2${levelCharsReversed[2]}${levelCharsReversed[1]}&6${levelCharsReversed[0]}&l\u269D&e]`;
    case 29: return `&b[${levelCharsReversed[3]}&3${levelCharsReversed[2]}${levelCharsReversed[1]}&9${levelCharsReversed[0]}&l\u269D&1]`;

    case 30: return `&e[${levelCharsReversed[3]}&6${levelCharsReversed[2]}${levelCharsReversed[1]}&c${levelCharsReversed[0]}&l\u269D&4]`;
    default: return `&e[${levelCharsReversed[3]}&6${levelCharsReversed[2]}${levelCharsReversed[1]}&c${levelCharsReversed[0]}&l\u269D&4]`;
  }
}

module.exports = {
  getLevelForExp,
  getExpForLevel,
  getLevelRespectingPrestige,
  getLevelFormatted,
};
