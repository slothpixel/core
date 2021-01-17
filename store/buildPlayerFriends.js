const cachedFunction = require('./cachedFunction');
const { getData, generateJob } = require('../util/utility');
const redis = require('./redis');
const getUUID = require('./getUUID');

module.exports = async (username) => cachedFunction(`friends:${username}`, async () => {
  const uuid = await getUUID(username);
  const data = await getData(redis, generateJob('friends', { id: uuid }));
  const friends = data.records || [];
  return friends.map((friend) => ({
    uuid: (friend.uuidSender !== uuid) ? friend.uuidSender : friend.uuidReceiver,
    sent_by: friend.uuidSender,
    started: friend.started,
  }));
});
