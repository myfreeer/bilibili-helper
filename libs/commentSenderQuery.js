var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) var { CRC32,  checkCRCHash } = require('./crc32');
const commentSenderQuery = async(hash, retries = 5) => {
    if (sessionStorage['commentSender_hash_' + hash]) return JSON.parse(sessionStorage['commentSender_hash_' + hash]);
    if (hash.indexOf('D') === 0) return {};
    let mid = checkCRCHash(hash);
    if (!mid) return mid;
    try {
        let json = await fetch('http://api.bilibili.com/cardrich?mid=' + mid).then(res => res.json());
        if (hash && (CRC32.bstr("" + mid) >>> 0) === parseInt(hash, 16)) sessionStorage['commentSender_hash_' + hash] = JSON.stringify(json.data.card);
        return json.data.card;
    } catch (e) {
        if (--retries > 0) return await commentSenderQuery(hash, retries);
        else return mid;
    }
};
if (COMMONJS) module.exports = commentSenderQuery;