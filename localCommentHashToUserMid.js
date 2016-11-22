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
            for (var x = 0; x < 8; x++) c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
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

/* Usage: checkCommentHash(String hash, int maximumMid, int minimumMid)
 * argument hash is required, maximumMid and minimumMid is optional
 * maximumMid would be 65000000 if not set, minimumMid would be 0 if not set
 * the return value would be mid, or -1 for unregistered user or false if process fails
 * Not designed to be multi-threaded, nor asynchronous
 * Speed test:
   var t0 = performance.now();
   checkCommentHash('444283f9');//should be 40000000
   console.log("Call to checkCommentHash took " + (performance.now() - t0) + " milliseconds.");
 */
function checkCommentHash(hash, maximumMid, minimumMid) {
    maximumMid = parseInt(maximumMid) ? parseInt(maximumMid) : 65000000; //the larger, the slower
    minimumMid = parseInt(minimumMid) ? parseInt(minimumMid) : 0;
    if (!hash) return false;
    if (hash.indexOf('D') == 0) return -1; //old comments sent by unregistered user
    var hashint = parseInt(hash, 16);
    if (!hashint) return false;
    for (var i = minimumMid; i < maximumMid + 1; i++) {
        if ((CRC32.bstr("" + i) >>> 0) === hashint) {
            return i;
        }
    }
    return false;
}

/* Create a Array Database in browser (NOT recommanded)
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
    for (let i = start; i < end; i++) array[i - start] = CRC32.bstr("" + i);
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

/* Create a IndexedDB in browser (NOT recommanded)
 * This Example will create a IndexedDB
 * Usage: createLocalIndexedDB(int end, int start)
 * Default value: end=100, start=0
 */
function createLocalIndexedDB() {
    if (!("indexedDB" in window)) return false;
    var end = arguments.length > 0 && arguments[0] !== undefined && typeof arguments[0] == 'number' ? arguments[0] : 100;
    var start = arguments.length > 1 && arguments[1] !== undefined && typeof arguments[1] == 'number' ? arguments[1] : 0;
    var openRequest = indexedDB.open("localCommentHash", 1);
    var db;

    openRequest.onupgradeneeded = function(e) {
        console.log("Upgrading...");
        db = e.target.result;
        db.createObjectStore("localCommentHash", {
            autoIncrement: false
        });
    };

    openRequest.onsuccess = function(e) {
        console.log("Success!");
        db = e.target.result;
        var t = db.transaction(["localCommentHash"], "readwrite");
        var store = t.objectStore("localCommentHash");
        for (let i = start; i < end; i++) store.put(i, CRC32.bstr("" + i) >>> 0);
    };

    openRequest.onerror = function(e) {
        console.log("Error");
        console.dir(e);
    };
}

/* Query hash from a IndexedDB created by createLocalIndexedDB
 * Usage: queryLocalIndexedDB(String hash, function callback)
 * argument hash and callback is required
 */
function queryLocalIndexedDB(hash, callback) {
    if (!("indexedDB" in window)) return false;
    hash = parseInt(hash, 16);
    if (!hash) return false;
    if (typeof callback !== "function") return false;
    var openRequest = indexedDB.open("localCommentHash", 1);
    var db;

    openRequest.onsuccess = function(e) {
        console.log("Success!");
        db = e.target.result;
        db.transaction(["localCommentHash"], "readonly")
            .objectStore("localCommentHash")
            .get(hash)
            .onsuccess = function(e) {
                callback(e.target.result);
            };
    };

    openRequest.onerror = function(e) {
        console.log("Error");
        console.dir(e);
        callback(e);
    };
}
