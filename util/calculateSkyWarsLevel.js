/*
* Functions for SkyWars exp and level conversions.
 */

//let xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000]
console.log(getLevelForExp(35440));

function getLevelForExp(xp) {
  var xps = [0, 20, 70, 150, 250, 500, 1000, 2000, 3500, 6000, 10000, 15000];
    if (xp >= 15000) {
        return (xp - 15000) / 10000 + 12;
        // Calculate the exactLevel for players whose level is 12 or above.
    } else {
    for (i = 0; i < xps.length; i++) {
    // Loop through the xps array and determine the integer value of the player's level.
        if (xp < xps[i]) {
            return i + (xp - xps[i-1]) / (xps[i] - xps[i-1]);
            // If xp < xps[i], the integer value of level is found. Hence, calculate the exactLevel and stop the loop.
            }
        }
    }
  }

module.exports = {
  getLevelForExp,
};
