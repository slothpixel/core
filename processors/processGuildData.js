
/*
* Returns guild level with 2 decimal places
 */
function getLevel(exp) {
  const EXP_NEEDED = [
    100000,
    150000,
    250000,
    500000,
    750000,
    1000000,
    1250000,
    1500000,
    2000000,
    2500000,
    2500000,
    2500000,
    3000000,
  ];
  let level = 0;
  let xp = exp;
  do {
    xp -= EXP_NEEDED[level] || 3000000;
    level += 1;
  }
  while (xp > 0);
  level += (EXP_NEEDED[level] || 3000000) / Math.abs(xp);
  return (level - 1).toFixed(2);
}

module.exports = getLevel;
