var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) var { CRC32,  checkCRCHash } = require('./crc32');
const commentSenderQuery = hash => {
  'use strict';
  return new Promise((resolve, reject) => {
    if (sessionStorage['commentSenderProvider_hash_' + hash]) return resolve(JSON.parse(sessionStorage['commentSenderProvider_hash_' + hash]));
    if (hash.indexOf('D') === 0) return resolve({});
    let mid = checkCRCHash(hash);
    if (!mid) return resolve(mid);
    fetch('http://api.bilibili.com/cardrich?mid=' + mid).then(res => res.json()).then(json => {
      if (!json || !(json && json.data && json.data.card)) return console.warn('commentSenderProvider: api went wrong again.', resolve(false));
      if (hash && (CRC32.bstr("" + mid) >>> 0) === parseInt(hash, 16)) sessionStorage['commentSenderProvider_hash_' + hash] = JSON.stringify(json.data.card);
      resolve(json.data.card);
    });
  });
};
if (COMMONJS) module.exports = commentSenderQuery;