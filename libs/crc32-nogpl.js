'use strict';
import {fetchretry} from './utils';
let crctable = function() {
    let c = 0,
        table = typeof Int32Array !== 'undefined' ? new Int32Array(256) : new Array(256);
    for (let n = 0; n !== 256; ++n) {
        c = n;
        for (let x = 0; x < 8; x++) {
            c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
        }
        table[n] = c;
    }
    return table;
}();

function crc32_bstr(bstr, seed) {
    let C = seed ^ -1,
        L = bstr.length - 1,
        i;
    for (i = 0; i < L;) {
        C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i++)) & 0xFF];
        C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i++)) & 0xFF];
    }
    if (i === L) C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i)) & 0xFF];
    return C ^ -1;
}
export const CRC32 = {bstr: crc32_bstr};

export const checkCRCHash = async(input) => {
    let obj;
    try {
        obj = await fetchretry(`https://biliquery.typcn.com/api/user/hash/${input}`).then((res) => res.json());
        if (obj && obj.data && obj.data[0] && obj.data[0].id) return obj.data[0].id;
    } catch (e) {
        console.warn(e);
    }
    return false;
};
