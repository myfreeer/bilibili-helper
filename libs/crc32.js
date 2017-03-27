(function (root) {
    'use strict';
    var crctable = function () {
        var c = 0,
            table = typeof Int32Array !== 'undefined' ? new Int32Array(256) : new Array(256);
        for (var n = 0; n !== 256; ++n) {
            c = n;
            for (var x = 0; x < 8; x++) {
                c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
            }
            table[n] = c;
        }
        return table;
    }();
    var crcIndex = new crctable.constructor(256);
    for (var f in crctable) crcIndex[f] = crctable[f] >>> 24;

    function crc32(input) {
        if (typeof input !== 'string') input = "" + input;
        var crcstart = 0xFFFFFFFF,
            len = input.length,
            index;
        for (var _i = 0; _i < len; ++_i) {
            index = (crcstart ^ input.charCodeAt(_i)) & 0xff;
            crcstart = crcstart >>> 8 ^ crctable[index];
        }
        return crcstart;
    }

    function crc32lastindex(input) {
        if (typeof input !== 'string') input = "" + input;
        var crcstart = 0xFFFFFFFF,
            len = input.length,
            index;
        for (var _i2 = 0; _i2 < len; ++_i2) {
            index = (crcstart ^ input.charCodeAt(_i2)) & 0xff;
            crcstart = crcstart >>> 8 ^ crctable[index];
        }
        return index;
    }

    function getcrcindex(t) {
        for (var _i3 = 0; _i3 < 256; _i3++)
            if (crcIndex[_i3] === t) return _i3;

        return -1;
    }

    function deepCheck(i, index) {
        var tc = 0x00,
            str = '',
            hash = crc32(i);
        for (var _i4 = 2; _i4 > -1; _i4--) {
            tc = hash & 0xff ^ index[_i4];
            if (tc > 57 || tc < 48) return [!1];
            str += tc - 48;
            hash = crctable[index[_i4]] ^ hash >>> 8;
        }
        return [!0, str];
    }

    function crc32_bstr(bstr, seed) {
        var C = seed ^ -1,
            L = bstr.length - 1;
        for (var i = 0; i < L;) {
            C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i++)) & 0xFF];
            C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i++)) & 0xFF];
        }
        if (i === L) C = C >>> 8 ^ crctable[(C ^ bstr.charCodeAt(i)) & 0xFF];
        return C ^ -1;
    }
    var CRC32 = {};
    CRC32.bstr = crc32_bstr;
    var cache = {};
    for (var s = 0; s < 1000; ++s) cache[CRC32.bstr('' + s) >>> 0] = s;

    var index = new Array(4);
    var checkCRCHash = function checkCRCHash(input) {
        var snum, i, lastindex, deepCheckData, ht = parseInt(input, 16) ^ 0xffffffff;
        if (cache[parseInt(input, 16)]) return cache[parseInt(input, 16)];
        for (i = 3; i >= 0; i--) {
            index[3 - i] = getcrcindex(ht >>> i * 8);
            snum = crctable[index[3 - i]];
            ht ^= snum >>> (3 - i) * 8;
        }
        for (i = 0; i < 100000; i++) {
            lastindex = crc32lastindex(i);
            if (lastindex === index[3]) {
                deepCheckData = deepCheck(i, index);
                if (deepCheckData[0]) break;
            }
        }
        if (i === 100000) return -1;
        return i + '' + deepCheckData[1];
    };

    root.CRC32 = CRC32;
    root.checkCRCHash = checkCRCHash;
    if (typeof module === 'object' && module.exports) module.exports = {CRC32, checkCRCHash};
})(this);