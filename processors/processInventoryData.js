/*
* Process NBT inventory data
 */

const itemSchema = {
  item_id: 'id',
  count: 'Count',
  name: 'tag.value.display.value.Name',
  lore: 'tag.value.display.value.Lore.value',
  attributes: {
    modifier: 'tag.value.ExtraAttributes.value.modifier',
    enchantments: 'tag.value.ExtraAttributes.value.enchantments',
    origin: 'tag.value.ExtraAttributes.value.originTag',
    id: 'tag.value.ExtraAttributes.value.id',
    uuid: 'tag.value.ExtraAttributes.value.uuid',
  },
};

/*
* Allows you to use dot syntax for nested objects, e.g. 'tag.value.display'
 */
function getNestedObjects(obj = {}, path = '') {
  path = path.split('.');
  for (let i = 0; i < path.length; i += 1) {
    obj = obj[path[i]] || {};
  }
  return obj;
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
      x[key] = getNestedObjects(item, itemSchema[key]).value || null;
    } else {
      Object.keys(itemSchema.attributes).forEach((attribute) => {
        x.attributes[attribute] = getNestedObjects(item, itemSchema.attributes[attribute]).value || null;
      });
      // Prettify enchantments
      const { enchantments } = x.attributes;
      if (typeof enchantments === 'object') {
        Object.keys(enchantments || {}).forEach((enchantment) => {
          x.attributes.enchantments[enchantment] = enchantments[enchantment].value;
        });
      }
    }
  });
  return x;
}

function processInventoryData(data) {
  const inventoryArray = data.value.i.value.value;
  return inventoryArray.map(item => simplifyItem(item));
}

module.exports = processInventoryData;
