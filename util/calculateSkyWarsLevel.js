/*
* Functions for SkyWars exp and level conversions.
 */

function getLevelForExp(xp) {
  const xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
  if (xp >= 15000) {
    return (xp - 15000) / 10000 + 12;
  }
  for (let i = 0; i < xps.length; i += 1) {
    if (xp < xps[i]) {
      return i + (xp - xps[i - 1]) / (xps[i] - xps[i - 1]);
    }
  }
}

module.exports = {
  getLevelForExp,
};
