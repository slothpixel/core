const got = require('got');
const { Profile } = require('skyblock-parser');
const config = require('../config');
const { logger, removeFormatting } = require('../util/utility');

// Submit items to the items service
async function checkItems(members = {}) {
  // We can control sample size to prevent overload
  if (Math.random() >= Number(config.ITEMS_PERCENT)) {
    return;
  }
  let inventories = [];
  // Merge all inventories
  Object.keys(members).forEach((member) => {
    inventories = inventories.concat(members[member].inventory || []);
  });
  // Remove empty inventory slots
  inventories = inventories.filter((i) => 'name' in i);
  // Get unique items
  try {
    const items = [...new Set(inventories.map((i) => i.attributes.id))]
      .flatMap((id) => {
        const item = inventories.find((i) => i.attributes.id === id);
        // Filter unfit items
        if (![null, undefined].includes(item.attributes.modifier)
          || id.startsWith('MAP:')
          || item.name === '§fnull'
          || item.name.includes('⚚')
          || !/[!-~]/.test(item.name) || !/[!-~]/.test(item.type)
          || !item.name.match(/[a-z]/i)
          || item.attributes.wood_singularity_count
          || item.attributes.rarity_upgrades) return [];
        return [{
          id,
          name: removeFormatting(item.name).replace(/✦|✪/g, '').trim(),
          tier: item.rarity,
          category: item.type || 'misc',
          damage: item.damage || null,
          item_id: item.item_id,
          texture: item.attributes.texture || null,
        }];
      });
    try {
      await got.post(config.ITEMS_HOST, {
        json: items,
        responseType: 'json',
      });
    } catch (error) {
      logger.warn(`Failed to insert item updates, is the items service running? ${error}`);
    }
  } catch {
    // we don't mind
  }
}

async function processSkyBlock(profile) {
  const data = await new Profile(profile);
  checkItems(data.members);
  return data;
}

module.exports = processSkyBlock;
