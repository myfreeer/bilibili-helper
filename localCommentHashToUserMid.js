/* crc32.js (C) 2014-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*exported CRC32 */
// https://github.com/SheetJS/js-crc32
var CRC32 = {};
(function(CRC32) {
    //CRC32.version = '1.0.1';
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

    //CRC32.table = T;
    CRC32.bstr = crc32_bstr;
})(CRC32);

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
 * Speed test:
   var t0 = performance.now();
   createLocalDatabase(1000000);
   console.log("Call to createLocalDatabase took " + (performance.now() - t0) + " milliseconds.");
 */
function createLocalDatabase() {
    var end = arguments.length > 0 && arguments[0] !== undefined && typeof arguments[0] == 'number' ? arguments[0] : 100;
    var start = arguments.length > 1 && arguments[1] !== undefined && typeof arguments[1] == 'number' ? arguments[1] : 0;
    var returnArray = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var typedArray = Uint32Array || Array
    var array = new typedArray(end - start);
    for (let i = start; i < end; i++) array[i - start] = CRC32.bstr(i.toString());
    var blob = new Blob([JSON.stringify(array)], {
        type: "application/octet-stream;",
    });
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (returnArray) return array;
}
