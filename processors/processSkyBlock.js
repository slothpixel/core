const { Profile } = require('skyblock-parser');

async function processSkyBlock(profile) {
  return new Profile(profile);
}

module.exports = processSkyBlock;
