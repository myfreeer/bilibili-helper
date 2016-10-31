/* crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*exported CRC32 */
// https://github.com/SheetJS/js-crc32
var CRC32;
(function(factory) {
    /*jshint ignore:start */
    if (typeof DO_NOT_EXPORT_CRC === 'undefined') {
        if ('object' === typeof exports) {
            factory(exports);
        } else if ('function' === typeof define && define.amd) {
            define(function() {
                var module = {};
                factory(module);
                return module;
            });
        } else {
            factory(CRC32 = {});
        }
    } else {
        factory(CRC32 = {});
    }
    /*jshint ignore:end */
}(function(CRC32) {
    CRC32.version = '1.0.1';
    /* see perf/crc32table.js */
    /*global Int32Array */
    function signed_crc_table() {
        var c = 0,
            table = new Array(256);

        for (var n = 0; n != 256; ++n) {
            c = n;
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
            table[n] = c;
        }

        return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
    }

    var T = signed_crc_table();

    function crc32_bstr(bstr, seed) {
        var C = seed ^ -1,
            L = bstr.length - 1;
        for (var i = 0; i < L;) {
            C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
        }
        if (i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xFF];
        return C ^ -1;
    }

    function crc32_buf(buf, seed) {
        if (buf.length > 10000) return crc32_buf_8(buf, seed);
        var C = seed ^ -1,
            L = buf.length - 3;
        for (var i = 0; i < L;) {
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        }
        while (i < L + 3) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        return C ^ -1;
    }

    function crc32_buf_8(buf, seed) {
        var C = seed ^ -1,
            L = buf.length - 7;
        for (var i = 0; i < L;) {
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
            C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        }
        while (i < L + 7) C = (C >>> 8) ^ T[(C ^ buf[i++]) & 0xFF];
        return C ^ -1;
    }

    function crc32_str(str, seed) {
        var C = seed ^ -1;
        for (var i = 0, L = str.length, c, d; i < L;) {
            c = str.charCodeAt(i++);
            if (c < 0x80) {
                C = (C >>> 8) ^ T[(C ^ c) & 0xFF];
            } else if (c < 0x800) {
                C = (C >>> 8) ^ T[(C ^ (192 | ((c >> 6) & 31))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
            } else if (c >= 0xD800 && c < 0xE000) {
                c = (c & 1023) + 64;
                d = str.charCodeAt(i++) & 1023;
                C = (C >>> 8) ^ T[(C ^ (240 | ((c >> 8) & 7))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 2) & 63))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | (d & 63))) & 0xFF];
            } else {
                C = (C >>> 8) ^ T[(C ^ (224 | ((c >> 12) & 15))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | ((c >> 6) & 63))) & 0xFF];
                C = (C >>> 8) ^ T[(C ^ (128 | (c & 63))) & 0xFF];
            }
        }
        return C ^ -1;
    }
    CRC32.table = T;
    CRC32.bstr = crc32_bstr;
    CRC32.buf = crc32_buf;
    CRC32.str = crc32_str;
}));

/* Usage: checkCommentHash(String hash, int maximumMid)
 * argument hash in required, maximumMid is optional
 * maximumMid would be 60000000 if not set
 * the return value would be mid, or false if process fails
 * Not designed to be multi-threaded, nor asynchronous
 */
function checkCommentHash(hash) {
    var maximumMid = arguments.length > 1 && arguments[1] !== undefined && typeof arguments[1] == 'number' ? arguments[1] : 60000000; //the larger, the slower
    if (!hash) return false;
    var hashint = parseInt(hash, 16);
    if (!hashint) return false;
    for (var i = 1; i < maximumMid + 1; i++) {
        if ((CRC32.bstr(i.toString()) >>> 0) === hashint) {
            return i;
        }
    }
    return false;
}

/* Create a Database in browser (NOT recommanded)
 * This Example will create a stringified array and download it
 * Usage: createLocalDatabase(int end, int start, bool returnArray)
 * Default value: end=100, start=0, returnArray=false
 */
function createLocalDatabase() {
    var end = arguments.length > 0 && arguments[0] !== undefined && typeof arguments[0] == 'number' ? arguments[0] : 100;
    var start = arguments.length > 1 && arguments[1] !== undefined && typeof arguments[1] == 'number' ? arguments[1] : 0;
    var returnArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var typedArray = Uint32Array || Array
    var array = new typedArray(end - start);
    for (let i = start; i < end; i++) array[i - end] = CRC32.bstr(i.toString());
    var blob = new Blob([JSON.stringify(array)], {
        type: "application/octet-stream;",
    });
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    if (returnArray) return array;
}
