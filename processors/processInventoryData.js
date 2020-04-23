/* eslint-disable camelcase */
/*
* Process NBT inventory data
 */
const { getNestedObjects } = require('../util/utility');

const itemSchema = {
  item_id: 'id',
  count: 'Count',
  name: 'tag.value.display.value.Name',
  damage: 'Damage',
  lore: 'tag.value.display.value.Lore.value',
  attributes: {
    modifier: 'tag.value.ExtraAttributes.value.modifier',
    enchantments: 'tag.value.ExtraAttributes.value.enchantments',
    anvil_uses: 'tag.value.ExtraAttributes.value.anvil_uses',
    hot_potato_count: 'tag.value.ExtraAttributes.value.hot_potato_count',
    origin: 'tag.value.ExtraAttributes.value.originTag',
    id: 'tag.value.ExtraAttributes.value.id',
    uuid: 'tag.value.ExtraAttributes.value.uuid',
    texture: 'tag.value.SkullOwner.value.Properties.value.textures.value',
  },
};

/*
* Returns the texture id part from minecraft.net link
* e.g. http://textures.minecraft.net/texture/f715ca0f742544ae3ca104297578c2ed700ea3a54980413512f5e7a0bc06729a
 */
function getTexture(value = []) {
  if (value === null && !Array.isArray(value)) return null;
  const string = Buffer.from(value[0].Value.value, 'base64').toString();
  const link = JSON.parse(string).textures.SKIN.url;
  const array = link.split('/');
  return array.pop();
}

/*
* Strips all unnecessary data from item objects
 */
function simplifyItem(item) {
  const x = {
    attributes: {},
  };
  Object.keys(itemSchema).forEach((key) => {
    if (key !== 'attributes') {
      x[key] = (getNestedObjects(item, itemSchema[key]) || {}).value || null;
    } else {
      Object.keys(itemSchema.attributes).forEach((attribute) => {
        x.attributes[attribute] = (getNestedObjects(item, itemSchema.attributes[attribute]) || {}).value || null;
      });
      // Prettify enchantments
      const { enchantments } = x.attributes;
      if (typeof enchantments === 'object') {
        Object.keys(enchantments || {}).forEach((enchantment) => {
          x.attributes.enchantments[enchantment] = enchantments[enchantment].value;
        });
      }
      // Handle hot potatoes
      const { hot_potato_count } = x.attributes;
      if (hot_potato_count !== null) {
        x.attributes.anvil_uses -= hot_potato_count;
      }
      // Decode texture data
      const { texture } = x.attributes;
      if (typeof texture === 'object') {
        x.attributes.texture = getTexture(texture);
      }
      // If damage value is 0, remove
      if (x.damage === null) {
        delete x.damage;
      }
    }
  });
  return x;
}

function processInventoryData(data) {
  const inventoryArray = data.value.i.value.value;
  return inventoryArray.map((item) => {
    if (Object.entries(item).length === 0) return {};
    return simplifyItem(item);
  });
}

module.exports = processInventoryData;
