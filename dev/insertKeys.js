/*
* Used to mass insert API keys to redis
 */
const cp = require('child_process');

process.stdin.setRawMode(true);
process.stdin.on('readable', () => {
  const keys = JSON.parse(process.stdin.read());
  keys.forEach((key) => {
    cp.execSync(`redis-cli -x set api_keys:${key.key} ${JSON.stringify(key)}`);
  });
});
