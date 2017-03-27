/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Element.prototype.find = Element.prototype.querySelector;
Element.prototype.findAll = Element.prototype.querySelectorAll;
Element.prototype.attr = Element.prototype.getAttribute;
Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.off = Element.prototype.removeEventListener;
// arrow functions binds no this nor arguments
Element.prototype.data = function(str){ return this.dataset[str]; };
Element.prototype.text = function(str){ return str ? (this.innerText = str) : this.innerText; };
Element.prototype.empty = function(){ this.innerHTML = ''; return this; };
Element.prototype.html = function(str){ str ? (this.innerHTML = str) : this.innerHTML;return this; };
Element.prototype.hide = function(){ this.style.display = 'none'; };
Element.prototype.show = function(){ this.style.display = ''; };
Element.prototype.addClass = function(){ return this.classList.add(...arguments); };
Element.prototype.removeClass = function(){ return this.classList.remove(...arguments); };
Element.prototype.toggleClass = function(){ return this.classList.toggle(...arguments); };
Element.prototype.hasClass = function(){ return this.classList.contains(...arguments); };
Element.prototype.replaceClass = function(){ return this.classList.replace(...arguments); };
NodeList.prototype.map = HTMLCollection.prototype.map = Array.prototype.map;
NodeList.prototype.each = HTMLCollection.prototype.each = NodeList.prototype.forEach;
NodeList.prototype.filter = HTMLCollection.prototype.filter = Array.prototype.filter;
NodeList.prototype.reduce = HTMLCollection.prototype.reduce = Array.prototype.reduce;
NodeList.prototype.reduceRight = HTMLCollection.prototype.reduceRight = Array.prototype.reduceRight;
NodeList.prototype.every = HTMLCollection.prototype.every = Array.prototype.every;
NodeList.prototype.some = HTMLCollection.prototype.some = Array.prototype.some;
HTMLCollection.prototype.forEach = Array.prototype.forEach;
const sleep = (time = 0) => new Promise(r => setTimeout(r, time));
/* harmony export (immutable) */ __webpack_exports__["i"] = sleep;

const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
/* unused harmony export formatInt */

const parseSafe = text => ('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
/* harmony export (immutable) */ __webpack_exports__["h"] = parseSafe;

const parseTime = timecount => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
/* harmony export (immutable) */ __webpack_exports__["g"] = parseTime;

const mySendMessage = obj => new Promise((resolve, reject) => chrome.runtime.sendMessage(obj,resolve));
/* harmony export (immutable) */ __webpack_exports__["f"] = mySendMessage;

const parseXmlSafe = text => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ""), "text/xml");
/* harmony export (immutable) */ __webpack_exports__["c"] = parseXmlSafe;

const storageSet = data => new Promise((resolve, reject) => chrome.storage.local.set(data, () => resolve()));
/* unused harmony export storageSet */

const storageGet = keys => new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve));
/* harmony export (immutable) */ __webpack_exports__["a"] = storageGet;

const storageRemove = keys => new Promise((resolve, reject) => chrome.storage.local.remove(keys, resolve));
/* unused harmony export storageRemove */

const storageClear = () => new Promise((resolve, reject) => chrome.storage.local.clear(resolve));
/* unused harmony export storageClear */

const fetchretry = (url, options) => {
    var retries = (options && options.retries) ? options.retries : 3;
    var retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = n => fetch(url, options).then(response => resolve(response)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};
/* harmony export (immutable) */ __webpack_exports__["b"] = fetchretry;

const _$ = e => document.querySelector(e);
/* harmony export (immutable) */ __webpack_exports__["d"] = _$;

const $h = html => {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};
/* harmony export (immutable) */ __webpack_exports__["e"] = $h;


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function addTitleLink(text, mode) {
    if (mode === "off") return text;
    return text.replace(/(\d+)/g, function (mathchedText, $1, offset, str) {
        for (var i = offset; i >= 0; i--) {
            if (str[i] === "】") break;
            else if (str[i] === "【") return mathchedText;
        }
        var previous = str.substring(0, offset) + ((parseInt(mathchedText) - 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) - 1).toString()) : ('0' + (parseInt(mathchedText) - 1).toString())) + str.substring(offset + mathchedText.length, str.length)),
            next = str.substring(0, offset) + ((parseInt(mathchedText) + 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) + 1).toString()) : ('0' + (parseInt(mathchedText) + 1).toString())) + str.substring(offset + mathchedText.length, str.length));
        previous = previous.replace(/(#)/g, " ");
        next = next.replace(/(#)/g, " ");
        if (mode === "without") {
            previous = previous.replace(/(\【.*?\】)/g, "");
            next = next.replace(/(\【.*?\】)/g, "");
        }
        return "<span class=\"titleNumber\" previous = \"" + previous + "\" next = \"" + next + "\">" + mathchedText + "</span>";
    });
}
/* harmony default export */ __webpack_exports__["a"] = (addTitleLink);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


const bilibiliVideoInfoProvider = async(avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    if (!avid) throw new Error('bilibiliVideoInfoProvider: avid is reuired');
    const url = [location.protocol + "//api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=" + page + "&batch=true", "https://www.biliplus.com/api/view?id=" + avid];
    if (sessionStorage[avid + '_' + page]) return JSON.parse(sessionStorage[avid + '_' + page]);
    let json;
    try {
        json = await fetch(n % 2 ? url[1] : url[0], {credentials}).then(response => response.json());
        if (!json || !(json && json.list && json.list.length) || json && json.code === -503) throw new Error('Can not get valid JSON.');
    } catch (e) {
        if (++n < retries) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* sleep */])(retryDelay);
            json = await bilibiliVideoInfoProvider(avid, page, credentials, retries, retryDelay, n);
        } else throw e;
    }
    if (!json.pages) json.pages = json.list.length;
    json.avid = avid;
    json.currentPage = page;
    sessionStorage[avid + '_' + page] = JSON.stringify(json);
    return json;
};
/* harmony export (immutable) */ __webpack_exports__["a"] = bilibiliVideoInfoProvider;


const bilibiliBangumiVideoInfoProvider = async(epid, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    if (!epid) throw new Error('bilibiliBangumiVideoInfoProvider: epid is required');
    var url = location.protocol + '//bangumi.bilibili.com/web_api/episode/' + epid + '.json';
    if (sessionStorage['ep_' + epid]) return JSON.parse(sessionStorage['ep_' + epid]);
    let json, videoInfo;
    try {
        json = await fetch(url, {credentials}).then(response => response.json());
        if (!json || !(json && json.result && json.result.currentEpisode && json.result.currentEpisode.avId) || json && json.code === -503) throw new Error('Can not get valid JSON.');
        videoInfo = await bilibiliVideoInfoProvider(json.result.currentEpisode.avId, json.result.currentEpisode.page || 1);
    } catch (e) {
        if (++n < retries) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* sleep */])(retryDelay);
            videoInfo = await bilibiliBangumiVideoInfoProvider(epid, credentials, retries, retryDelay, n);
        } else throw e;
    }
    sessionStorage['ep_' + epid] = JSON.stringify(videoInfo);
    return videoInfo;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = bilibiliBangumiVideoInfoProvider;


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__md5__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);



// from project youtube-dl (Unlicense)
// https://github.com/rg3/youtube-dl/blob/bd8f48c78b952ebe3bf335185c819e265f63cb50/youtube_dl/extractor/bilibili.py#L59-L60
const APPKEY = '84956560bc028eb7';
const APPSECRET = '94aba54af9065f71de72f5508f1cd42e';

// from project you-get (license MIT)
// https://github.com/soimort/you-get/blob/0f0da0ccd72e93a3c93d51b5b90c81513ef77d15/src/you_get/extractors/bilibili.py#L15
const SECRETKEY_MINILOADER = '1c15888dc316e05a15fdd0a02ed6584f';

const processXmlObj = obj => {
    if (obj.video) obj = obj.video;
    if (obj.durl && !obj.durl.push) obj.durl = [obj.durl];
    if (obj.durl.length && obj.durl.length > 0 && obj.durl[0] && obj.durl[0].backup_url && !obj.durl[0].backup_url.push && obj.durl[0].backup_url.url) {
        obj.durl[0].backup_url = obj.durl[0].backup_url.url;
        if (!obj.durl[0].backup_url.push) obj.durl[0].backup_url = [obj.durl[0].backup_url];
    }
    if (obj.accept_quality && !obj.accept_quality.push) obj.accept_quality = obj.accept_quality.split(',').map(e => Number(e));
    return obj;
};

const xml2obj = xml => {
    try {
        let text, obj = {};
        if (xml.children.length > 0) {
            [...xml.children].map(item => {
                let nodeName = item.nodeName;
                if (typeof (obj[nodeName]) === "undefined") obj[nodeName] = xml2obj(item);
                else {
                    if (!obj[nodeName].push) obj[nodeName] = [obj[nodeName]];
                    obj[nodeName].push(xml2obj(item));
                }
            });
        } else {
            text = xml.textContent;
            if (/^\d+(\.\d+)?$/.test(text)) obj = Number(text);
            else if (text === 'true' || text === 'false') obj = Boolean(text);
            else obj = text;
        }
        return obj;
    } catch (e) {
        console.warn(e.message);
    }
};

const parseJsonforFlvjs = (json) => {
    if (!json) return console.warn('parseJsonforFlvjs Failed: No JSON provided.');
    var mediaDataSource = {};
    mediaDataSource.type = 'flv';
    if (parseInt(json.timelength)) mediaDataSource.duration = parseInt(json.timelength);
    if (json.durl) mediaDataSource.segments = json.durl.map(obj => ({
        "duration": obj.length,
        "filesize": obj.size,
        "url": obj.url.match("ws.acgvideo.com") ? obj.url : obj.url.replace(/^http:\/\//, "https://")
    }));
    if (!json.durl) return console.warn('parseJsonforFlvjs Failed: Nothing to play.');
    if (mediaDataSource.segments.length === 1 && json.durl[0].backup_url && json.durl[0].backup_url.length === 1 && !mediaDataSource.segments[0].url.match('flv') && json.durl[0].backup_url[0].match('flv')) mediaDataSource.segments[0].url = json.durl[0].backup_url[0].replace(/^http:\/\//,"https://");
    if (!mediaDataSource.segments[0].url.match('flv') && mediaDataSource.segments.length === 1) mediaDataSource.type = 'mp4';
    if (mediaDataSource.type === 'mp4') Object.assign(mediaDataSource, mediaDataSource.segments[0]);
    return mediaDataSource;
};

const getToken = async(retries = 5, retryDelay = 500) => {
    let token;
    try {
        let text = await fetch(location.protocol + '//www.bilibili.com/video/av7/').then(res => res.text())
        token = text.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1];
        sessionStorage['bilibiliVideoProvider_Token'] = token;
        return token;
    } catch (e) {
        if (--retries > 0) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["i" /* sleep */])(retryDelay);
            return await getToken(retries);
        } else throw (e);
    }
};

const getVideoLink = async(url, type, retries = 5, credentials = 'include', retryDelay = 500) => {
    let json;
    try {
        if (type === 'flv') {
            let xmltext = await fetch(url, {credentials}).then(res => res.text());
            json = processXmlObj(xml2obj((new DOMParser()).parseFromString(xmltext, 'text/xml')));
        } else json = await fetch(url, {credentials}).then(response => response.json());
    } catch (error) {
        if (--retries > 0) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["i" /* sleep */])(retryDelay);
            return await getVideoLink(url, type, retries);
        } else json = {
            'code': -1,
            'message': error
        };
    }
    return json;
};

const bilibiliVideoProvider = async(cid, avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500) => {
    let url = {};
    let token;
    if (sessionStorage['bilibiliVideoProvider_Token']) token = sessionStorage['bilibiliVideoProvider_Token'];
    if (!token) token = await getToken(retries);
    url.low = `${location.protocol}//api.bilibili.com/playurl?aid=${avid}&page=${page}&platform=html5&vtype=mp4&token=${token}`;
    url._base = location.protocol + '//interface.bilibili.com/playurl?';
    url._query = (type, quality = 3) => `appkey=${APPKEY}&cid=${cid}&otype=json&quality=${quality}&type=${type}`;
    url.mp4 = url._base + url._query('mp4') + '&sign=' + __WEBPACK_IMPORTED_MODULE_0__md5___default()(url._query('mp4') + APPSECRET);
    url.flv = url._base + url._query('flv') + '&sign=' + __WEBPACK_IMPORTED_MODULE_0__md5___default()(url._query('flv') + APPSECRET);
    const interfaceUrl = (cid, ts) => `cid=${cid}&player=1&ts=${ts}`;
    const calcSign = (cid, ts) => __WEBPACK_IMPORTED_MODULE_0__md5___default()(`${interfaceUrl(cid,ts)}${SECRETKEY_MINILOADER}`);
    let video = {};
    const types = ['low', 'mp4', 'flv'];
    for (let i of types) video[i] = await getVideoLink(url[i], null, retries, credentials, retryDelay);
    video.mediaDataSource = parseJsonforFlvjs(video.flv);
    video.hd = [];
    video.ld = [];
    const processVideoUrl = url => {
        if (!url) return;
        if (!url.match('ws.acgvideo.com')) url = url.replace(/^http:\/\//, "https://");
        if (url.match('hd.mp4')) video.hd.push(url);
        else if (url.match('.mp4')) video.ld.push(url);
    };
    const processVideoUrlObj = obj => {
        if (!(obj.durl && obj.durl[0] && obj.durl[0].url)) return;
        obj.durl.forEach(durl => processVideoUrl(durl.url));
        if (obj.durl[0].backup_url && obj.durl[0].backup_url[0]) obj.durl[0].backup_url.forEach(url => processVideoUrl(url));
    };
    for (let i of types) processVideoUrlObj(video[i]);
    if (video.mediaDataSource.type === 'mp4') {
        const ts = Math.ceil(Date.now() / 1000);
        url.flv = url._base + `${interfaceUrl(cid,ts)}&sign=${calcSign(cid,ts)}`;
        video.flv = await getVideoLink(url.flv, 'flv', retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    video.hd = video.hd.sort().reverse();
    video.ld = video.ld.sort().reverse();
    return video;
};
/* harmony default export */ __webpack_exports__["a"] = (bilibiliVideoProvider);

/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__crc32__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__crc32___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__crc32__);

const commentSenderQuery = async(hash, retries = 5) => {
    if (sessionStorage['commentSender_hash_' + hash]) return JSON.parse(sessionStorage['commentSender_hash_' + hash]);
    if (hash.indexOf('D') === 0) return {};
    let mid = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__crc32__["checkCRCHash"])(hash);
    if (!mid) return mid;
    try {
        let json = await fetch('http://api.bilibili.com/cardrich?mid=' + mid).then(res => res.json());
        if (hash && (__WEBPACK_IMPORTED_MODULE_0__crc32__["CRC32"].bstr("" + mid) >>> 0) === parseInt(hash, 16)) sessionStorage['commentSender_hash_' + hash] = JSON.stringify(json.data.card);
        return json.data.card;
    } catch (e) {
        if (--retries > 0) return await commentSenderQuery(hash, retries);
        else return mid;
    }
};
/* harmony default export */ __webpack_exports__["a"] = (commentSenderQuery);

/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var utils = {
    bindFn: function (e, f) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function () {
            return e.apply(f, d.concat(Array.prototype.slice.call(arguments)))
        }
    },
    cookie: {
        get: function (f) {
            var h = "" + document.cookie,
                e = h.indexOf(f + "=");
            if (-1 === e || "" === f) {
                return ""
            }
            var g = h.indexOf(";", e); - 1 === g && (g = h.length);
            return unescape(h.substring(e + f.length + 1, g))
        },
        set: function (f, h, e) {
            e = void 0 !== e ? e : 365;
            var g = new Date;
            g.setTime(g.getTime() + 86400000 * e);
            document.cookie = f + "=" + escape(h) + ";expires=" + g.toGMTString() + "; path=/; domain=.bilibili.com"
        },
        "delete": function (b) {
            this.set(b, "", -1)
        }
    }
};
const __GetCookie = utils.bindFn(utils.cookie.get, utils);
/* harmony export (immutable) */ __webpack_exports__["a"] = __GetCookie;

const __SetCookie = utils.bindFn(utils.cookie.set, utils);
/* unused harmony export __SetCookie */


/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony export (immutable) */ __webpack_exports__["b"] = getNiceSectionFilename;
/* harmony export (immutable) */ __webpack_exports__["a"] = getDownloadOptions;
// adapted from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
// remove node "Buffer" to work in browser.


/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @param  {Object} options {replacement: String, max: Number(<255)}
 * @return {String}         Sanitized filename
 */

// http://stackoverflow.com/questions/30960190/problematic-characters-for-filename-in-chrome-downloads-download
// Despite "~" is totally valid in filenames, Chrome thinks otherwise.
// so add "~" to illegalRe.
//
// TODO Through my own tests, I find actually Chrome can sanitize the file path
// automatically but there are no API found for it though?
var filenameSanitize = (function () {
    var illegalRe = /[\/\?<>\\:\*\|":~]/g;
    var controlRe = /[\x00-\x1f\x80-\x9f]/g;
    var reservedRe = /^\.+$/;
    var windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

    // Truncate string by size in bytes
    function truncate(str, maxByteSize) {
        var strLen = str.length,
            curByteSize = 0,
            codePoint = -1;

        for (var i = 0; i < strLen; i++) {
            codePoint = str.charCodeAt(i);

            // handle 4-byte non-BMP chars
            // low surrogate
            if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
                // when parsing previous hi-surrogate, 3 is added to curByteSize
                curByteSize++;
                if (curByteSize > maxByteSize) {
                    return str.substring(0, i - 1);
                }

                continue;
            }

            if (codePoint <= 0x7f) {
                curByteSize++;
            } else if (codePoint >= 0x80 && codePoint <= 0x7ff) {
                curByteSize += 2;
            } else if (codePoint >= 0x800 && codePoint <= 0xffff) {
                curByteSize += 3;
            }

            if (curByteSize > maxByteSize) {
                return str.substring(0, i);
            }
        }

        // never exceeds the upper limit
        return str;
    }

    function sanitize(input, replacement, max) {
        var sanitized = input
            .replace(illegalRe, replacement)
            .replace(controlRe, replacement)
            .replace(reservedRe, replacement)
            .replace(windowsReservedRe, replacement);
        return truncate(sanitized, max);
    }

    return function (input, options) {
        var replacement = (options && options.replacement) || '';
        var max = (options && options.max && (options.max < 255)) ? options.max : 255;
        var output = sanitize(input, replacement, max);
        if (replacement === '') {
            return output;
        }
        return sanitize(output, '');
    };
})();

function getNiceSectionFilename(avid, page, totalPage, idx, numParts) {
    // TODO inspect the page to get better section name
    var idName = 'av' + avid,
        // page/part name is only shown when there are more than one pages/parts
        pageIdName = (totalPage && (totalPage > 1)) ? ('p' + page) : "",
        pageName = "",
        partIdName = (numParts && (numParts > 1)) ? ('' + idx) : "";

    // try to find a good page name
    if (pageIdName) {
        pageName = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('.player-wrapper #plist > span').text();
        pageName = pageName.substr(pageName.indexOf('、') + 1);
        if (!partIdName) document.title = pageName + '_' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName + '_' + pageIdName;
        return partIdName ? pageName + '_' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName + '_' + pageIdName + '_' + partIdName : pageName + '_' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName + '_' + pageIdName;
    }
    if (!partIdName) document.title = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName;
    // document.title contains other info feeling too much
    return partIdName ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName + '_' + partIdName : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* _$ */])('div.v-title').text() + '_' + idName;
}

// Helper function, return object {url, filename}, options object used by
// "chrome.downloads.download"
function getDownloadOptions(url, filename) {
    // TODO Improve file extension determination process.
    //
    // Parsing the url should be ok in most cases, but the best way should
    // use MIME types and tentative file names returned by server. Not
    // feasible at this stage.
    var resFn = null,
        fileBaseName = url.split(/[\\/]/).pop().split('?')[0],
        // arbitrarily default to "mp4" for no better reason...
        fileExt = fileBaseName.match(/[.]/) ? fileBaseName.match(/[^.]+$/) : 'mp4';

    // file extension auto conversion.
    //
    // Some sources are known to give weird file extensions, do our best to
    // convert them.
    switch (fileExt) {
    case "letv":
        fileExt = "flv";
        break;
    default:
         // remain the same, nothing
    }

    resFn = filenameSanitize(filename, {
        replacement: '_',
        max: 255 - fileExt.length - 1
    }) + '.' + fileExt;

    return {
        "url": url,
        "filename": resFn
    };
}

/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


const genPageFunc = async(cid, videoInfo, redirectUrl) => {
    let tagList = "";
    let alist = "";
    if (videoInfo && videoInfo.list && videoInfo.list.length > 1) {
        alist += "<select id='dedepagetitles' onchange='location.href=this.options[this.selectedIndex].value;'>";
        alist += videoInfo.list.map(vPart => "<option value='/video/av" + videoInfo.avid + "/index_" + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(vPart.page) + ".html'>" + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(vPart.page) + "、" + (vPart.part ? vPart.part : ("P" + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(vPart.page))) + "</option>").join();
        alist += "</select>";
    }
    if (videoInfo && videoInfo.tag) tagList += videoInfo.tag.split(",").map(tag => '<li><a class="tag-val" href="/tag/' + encodeURIComponent(tag) + '/" title="' + tag + '" target="_blank">' + tag + '</a></li>').join();
    if (!videoInfo.tag) videoInfo.tag = "";
    const template = await fetch(chrome.extension.getURL("template.html")).then(res => res.text());
    const page = template.replace(/__bl_avid/g, videoInfo.avid).replace(/__bl_page/g, videoInfo.currentPage).replace(/__bl_cid/g, cid).replace(/__bl_tid/g, videoInfo.tid).replace(/__bl_mid/g, videoInfo.mid)
        .replace(/__bl_pic/g, videoInfo.pic).replace(/__bl_title/g, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(videoInfo.title)).replace(/__bl_sp_title_uri/g, videoInfo.sp_title ? encodeURIComponent(videoInfo.sp_title) : '')
        .replace(/__bl_sp_title/g, videoInfo.sp_title ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(videoInfo.sp_title) : '').replace(/__bl_spid/g, videoInfo.spid).replace(/__bl_season_id/g, videoInfo.season_id)
        .replace(/__bl_created_at/g, videoInfo.created_at).replace(/__bl_description/g, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* parseSafe */])(videoInfo.description)).replace(/__bl_redirectUrl/g, redirectUrl)
        .replace(/__bl_tags/g, JSON.stringify(videoInfo.tag.split(","))).replace(/__bl_tag_list/g, tagList).replace(/__bl_alist/g, alist).replace(/__bl_bangumi_cover/g, videoInfo.bangumi ? videoInfo.bangumi.cover : '')
        .replace(/__bl_bangumi_desc/g, videoInfo.bangumi ? videoInfo.bangumi.desc : '');
    document.open();
    document.write(page);
    document.close();
    await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* sleep */])(1500);
    await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* mySendMessage */])({command: "injectCSS"});
    return false;
};
/* harmony default export */ __webpack_exports__["a"] = (genPageFunc);

/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const errorCode = ["正常", "选择的弹幕模式错误", "用户被禁止", "系统禁止", "投稿不存在", "UP主禁止", "权限有误", "视频未审核/未发布", "禁止游客弹幕"];
const sendComment = async(avid, cid, page, commentData) => {
    commentData.cid = cid;
    const comment = Object.keys(commentData).map(key => encodeURIComponent(key).replace(/%20/g, "+") + "=" + encodeURIComponent(commentData[key]).replace(/%20/g, "+")).join('&');
    try {
        let result = await fetch(`${location.protocol}//interface.bilibili.com/dmpost?cid=${cid}&aid=${avid}&pid=${page}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: 'include',
            body: comment
        }).then(res => res.text());
        result = parseInt(result);
        return result < 0 ? {
            result: false,
            error: errorCode[-result]
        } : {
            result: true,
            id: result
        };
    } catch (e) {
        return {
            result: false,
            error: e.toString()
        };
    }
};
/* harmony default export */ __webpack_exports__["a"] = (sendComment);

/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
﻿// ** Ported from UserScript
// @namespace   https://github.com/tiansh
// @description 以 ASS 格式下载 bilibili 的弹幕
// @include     http://www.bilibili.com/video/av*
// @include     http://www.bilibili.tv/video/av*
// @include     http://bilibili.kankanews.com/video/av*
// @updateURL   https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.meta.js
// @downloadURL https://tiansh.github.io/us-danmaku/bilibili/bilibili_ASS_Danmaku_Downloader.user.js
// @version     1.10
// @grant       GM_addStyle
// @grant       GM_xmlhttpRequest
// @run-at      document-start
// @author      田生
// @copyright   2014+, 田生
// @license     Mozilla Public License 2.0; http://www.mozilla.org/MPL/2.0/
// @license     CC Attribution-ShareAlike 4.0 International; http://creativecommons.org/licenses/by-sa/4.0/

/*
	* Common
	*/

// 设置项
var config = {
    'playResX': 560,           // 屏幕分辨率宽（像素）
    'playResY': 420,           // 屏幕分辨率高（像素）
    'fontlist': [              // 字形（会自动选择最前面一个可用的）
        'PingFang SC',
        'Source Han Sans CN',
        'Microsoft YaHei UI',
        'Microsoft YaHei',
        '文泉驿正黑',
        'STHeitiSC',
        '黑体',
    ],
    'font_size': 1.0,          // 字号（比例）
    'r2ltime': 8,              // 右到左弹幕持续时间（秒）
    'fixtime': 4,              // 固定弹幕持续时间（秒）
    'opacity': 0.6,            // 不透明度（比例）
    'space': 0,                // 弹幕间隔的最小水平距离（像素）
    'max_delay': 6,            // 最多允许延迟几秒出现弹幕
    'bottom': 50,              // 底端给字幕保留的空间（像素）
    'use_canvas': null,        // 是否使用canvas计算文本宽度（布尔值，Linux下的火狐默认否，其他默认是，Firefox bug #561361）
    'debug': false,            // 打印调试信息
};

var debug = config.debug ? console.warn.bind(console) : function () { };

// 将字典中的值填入字符串
var fillStr = function (str) {
    var dict = Array.apply(Array, arguments);
    return str.replace(/{{([^}]+)}}/g, function (r, o) {
        var ret;
        dict.some(function (i) { return ret = i[o]; });
        return ret || '';
    });
};

// 将颜色的数值化为十六进制字符串表示
var RRGGBB = function (color) {
    var t = Number(color).toString(16).toUpperCase();
    return ('000000' + t).slice(-6)
};

// 将可见度转换为透明度
var hexAlpha = function (opacity) {
    var alpha = Math.round(0xFF * (1 - opacity)).toString(16).toUpperCase();
    return Array(3 - alpha.length).join('0') + alpha;
};

// 平方和开根
var hypot = Math.hypot ? Math.hypot.bind(Math) : function () {
    return Math.sqrt([0].concat(Array.apply(Array, arguments))
	.reduce(function (x, y) { return x + y * y; }));
};

// 计算文字宽度
var calcWidth = (function () {

	// 使用Canvas计算
    var calcWidthCanvas = function () {
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        return function (fontname, text, fontsize) {
            context.font = 'bold ' + fontsize + 'px ' + fontname;
            return Math.ceil(context.measureText(text).width + config.space);
        };
    }

	// 使用Div计算
    var calcWidthDiv = function () {
        var d = document.createElement('div');
        d.setAttribute('style', [
            'all: unset', 'top: -10000px', 'left: -10000px',
            'width: auto', 'height: auto', 'position: absolute',
            '',].join(' !important; '));
        var ld = function () { document.body.parentNode.appendChild(d); }
        if (!document.body) document.addEventListener('DOMContentLoaded', ld);
        else ld();
        return function (fontname, text, fontsize) {
            d.textContent = text;
            d.style.font = 'bold ' + fontsize + 'px ' + fontname;
            return d.clientWidth + config.space;
        };
    };

	// 检查使用哪个测量文字宽度的方法
    if (config.use_canvas === null) {
        if (navigator.platform.match(/linux/i) &&
	!navigator.userAgent.match(/chrome/i)) config.use_canvas = false;
    }
    debug('use canvas: %o', config.use_canvas !== false);
    if (config.use_canvas === false) return calcWidthDiv();
    return calcWidthCanvas();

}());

// 选择合适的字体
var choseFont = function (fontlist) {
	// 检查这个字串的宽度来检查字体是否存在
    var sampleText =
	'The quick brown fox jumps over the lazy dog' +
	'7531902468' + ',.!-' + '，。：！' +
	'天地玄黄' + '則近道矣';
	// 和这些字体进行比较
    var sampleFont = [
        'monospace', 'sans-serif', 'sans',
        'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
        'Times', 'Times New Roman',
        '宋体', '黑体', '文泉驿正黑', 'Microsoft YaHei', 'PingFang SC'
    ];
	// 如果被检查的字体和基准字体可以渲染出不同的宽度
	// 那么说明被检查的字体总是存在的
    var diffFont = function (base, test) {
        var baseSize = calcWidth(base, sampleText, 72);
        var testSize = calcWidth(test + ',' + base, sampleText, 72);
        return baseSize !== testSize;
    };
    var validFont = function (test) {
        var valid = sampleFont.some(function (base) {
            return diffFont(base, test);
        });
        debug('font %s: %o', test, valid);
        return valid;
    };
	// 找一个能用的字体
    var f = fontlist[fontlist.length - 1];
    fontlist = fontlist.filter(validFont);
    debug('fontlist: %o', fontlist);
    return fontlist[0] || f;
};

// 从备选的字体中选择一个机器上提供了的字体
var initFont = (function () {
    var done = false;
    return function () {
        if (done) return; done = true;
        calcWidth = calcWidth.bind(window,
	config.font = choseFont(config.fontlist)
	);
    };
}());

var generateASS = function (danmaku, info) {
    if (Number(info.opacity)) config.opacity = info.opacity;
    var assHeader = fillStr('[Script Info]\nTitle: {{title}}\nOriginal Script: 根据 {{ori}} 的弹幕信息，由 https://github.com/tiansh/us-danmaku 生成\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: {{playResX}}\nPlayResY: {{playResY}}\nTimer: 10.0000\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\nStyle: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n', config, info, {'alpha': hexAlpha(config.opacity) });
	// 补齐数字开头的0
    var paddingNum = function (num, len) {
        num = '' + num;
        while (num.length < len) num = '0' + num;
        return num;
    };
	// 格式化时间
    var formatTime = function (time) {
        time = 100 * time ^ 0;
        var l = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function (c) {
            var r = time % c[0];
            time = (time - r) / c[0];
            return paddingNum(r, c[1]);
        }).reverse();
        return l.slice(0, -1).join(':') + '.' + l[3];
    };
	// 格式化特效
    var format = (function () {
	// 适用于所有弹幕
        var common = function (line) {
            var s = '';
            var rgb = line.color.split(/(..)/).filter(function (x) { return x; })
	.map(function (x) { return parseInt(x, 16); });
	// 如果不是白色，要指定弹幕特殊的颜色
            if (line.color !== 'FFFFFF') // line.color 是 RRGGBB 格式
                s += '\\c&H' + line.color.split(/(..)/).reverse().join('');
	// 如果弹幕颜色比较深，用白色的外边框
            var dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 0x30;
            if (dark) s += '\\3c&HFFFFFF';
            if (line.size !== 25) s += '\\fs' + line.size;
            return s;
        };
	// 适用于从右到左弹幕
        var r2l = function (line) {
            return '\\move(' + [
                line.poss.x, line.poss.y, line.posd.x, line.posd.y
            ].join(',') + ')';
        };
	// 适用于固定位置弹幕
        var fix = function (line) {
            return '\\pos(' + [
                line.poss.x, line.poss.y
            ].join(',') + ')';
        };
        var withCommon = function (f) {
            return function (line) { return f(line) + common(line); };
        };
        return {
            'R2L': withCommon(r2l),
            'Fix': withCommon(fix),
        };
    }());
	// 转义一些字符
    var escapeAssText = function (s) {
	// "{"、"}"字符libass可以转义，但是VSFilter不可以，所以直接用全角补上
        return s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\r|\n/g, '');
    };
	// 将一行转换为ASS的事件
    var convert2Ass = function (line) {
        return 'Dialogue: ' + [
            0,
            formatTime(line.stime),
            formatTime(line.dtime),
            line.type,
            ',20,20,2,,',
        ].join(',')
	+ '{' + format[line.type](line) + '}'
	+ escapeAssText(line.text);
    };
    return assHeader +
	danmaku.map(convert2Ass)
	.filter(function (x) { return x; })
	.join('\n');
};

/*

下文字母含义：
0       ||----------------------x---------------------->
	_____________________c_____________________
=        /                     wc                      \      0
|       |                   |--v--|                 wv  |  |--v--|
|    d  |--v--|               d f                 |--v--|
y |--v--|  l                                         f  |  s    _ p
|       |              VIDEO           |--v--|          |--v--| _ m
v       |              AREA            (x ^ y)          |

v: 弹幕
c: 屏幕

0: 弹幕发送
a: 可行方案

s: 开始出现
f: 出现完全
l: 开始消失
d: 消失完全

p: 上边缘（含）
m: 下边缘（不含）

w: 宽度
h: 高度
b: 底端保留

t: 时间点
u: 时间段
r: 延迟

并规定
ts := t0s + r
tf := wv / (wc + ws) * p + ts
tl := ws / (wc + ws) * p + ts
td := p + ts

*/

// 滚动弹幕
var normalDanmaku = (function (wc, hc, b, u, maxr) {
    return function () {
	// 初始化屏幕外面是不可用的
        var used = [
	{ 'p': -Infinity, 'm': 0, 'tf': Infinity, 'td': Infinity, 'b': false },
	{ 'p': hc, 'm': Infinity, 'tf': Infinity, 'td': Infinity, 'b': false },
	{ 'p': hc - b, 'm': hc, 'tf': Infinity, 'td': Infinity, 'b': true },
        ];
	// 检查一些可用的位置
        var available = function (hv, t0s, t0l, b) {
            var suggestion = [];
	// 这些上边缘总之别的块的下边缘
            used.forEach(function (i) {
                if (i.m > hc) return;
                var p = i.m;
                var m = p + hv;
                var tas = t0s;
                var tal = t0l;
	// 这些块的左边缘总是这个区域里面最大的边缘
                used.forEach(function (j) {
                    if (j.p >= m) return;
                    if (j.m <= p) return;
                    if (j.b && b) return;
                    tas = Math.max(tas, j.tf);
                    tal = Math.max(tal, j.td);
                });
	// 最后作为一种备选留下来
                suggestion.push({
                    'p': p,
                    'r': Math.max(tas - t0s, tal - t0l),
                });
            });
	// 根据高度排序
            suggestion.sort(function (x, y) { return x.p - y.p; });
            var mr = maxr;
	// 又靠右又靠下的选择可以忽略，剩下的返回
            suggestion = suggestion.filter(function (i) {
                if (i.r >= mr) return false;
                mr = i.r;
                return true;
            });
            return suggestion;
        };
	// 添加一个被使用的
        var use = function (p, m, tf, td) {
            used.push({ 'p': p, 'm': m, 'tf': tf, 'td': td, 'b': false });
        };
	// 根据时间同步掉无用的
        var syn = function (t0s, t0l) {
            used = used.filter(function (i) { return i.tf > t0s || i.td > t0l; });
        };
	// 给所有可能的位置打分，分数是[0, 1)的
        var score = function (i) {
            if (i.r > maxr) return -Infinity;
            return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
        };
	// 添加一条
        return function (t0s, wv, hv, b) {
            var t0l = wc / (wv + wc) * u + t0s;
            syn(t0s, t0l);
            var al = available(hv, t0s, t0l, b);
            if (!al.length) return null;
            var scored = al.map(function (i) { return [score(i), i]; });
            var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
            })[1];
            var ts = t0s + best.r;
            var tf = wv / (wv + wc) * u + ts;
            var td = u + ts;
            use(best.p, best.p + hv, tf, td);
            return {
                'top': best.p,
                'time': ts,
            };
        };
    };
}(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));

// 顶部、底部弹幕
var sideDanmaku = (function (hc, b, u, maxr) {
    return function () {
        var used = [
	{ 'p': -Infinity, 'm': 0, 'td': Infinity, 'b': false },
	{ 'p': hc, 'm': Infinity, 'td': Infinity, 'b': false },
	{ 'p': hc - b, 'm': hc, 'td': Infinity, 'b': true },
        ];
	// 查找可用的位置
        var fr = function (p, m, t0s, b) {
            var tas = t0s;
            used.forEach(function (j) {
                if (j.p >= m) return;
                if (j.m <= p) return;
                if (j.b && b) return;
                tas = Math.max(tas, j.td);
            });
            return { 'r': tas - t0s, 'p': p, 'm': m };
        };
	// 顶部
        var top = function (hv, t0s, b) {
            var suggestion = [];
            used.forEach(function (i) {
                if (i.m > hc) return;
                suggestion.push(fr(i.m, i.m + hv, t0s, b));
            });
            return suggestion;
        };
	// 底部
        var bottom = function (hv, t0s, b) {
            var suggestion = [];
            used.forEach(function (i) {
                if (i.p < 0) return;
                suggestion.push(fr(i.p - hv, i.p, t0s, b));
            });
            return suggestion;
        };
        var use = function (p, m, td) {
            used.push({ 'p': p, 'm': m, 'td': td, 'b': false });
        };
        var syn = function (t0s) {
            used = used.filter(function (i) { return i.td > t0s; });
        };
	// 挑选最好的方案：延迟小的优先，位置不重要
        var score = function (i, is_top) {
            if (i.r > maxr) return -Infinity;
            var f = function (p) { return is_top ? p : (hc - p); };
            return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
        };
        return function (t0s, hv, is_top, b) {
            syn(t0s);
            var al = (is_top ? top : bottom)(hv, t0s, b);
            if (!al.length) return null;
            var scored = al.map(function (i) { return [score(i, is_top), i]; });
            var best = scored.reduce(function (x, y) {
                return x[0] > y[0] ? x : y;
            })[1];
            use(best.p, best.m, best.r + t0s + u)
            return { 'top': best.p, 'time': best.r + t0s };
        };
    };
}(config.playResY, config.bottom, config.fixtime, config.max_delay));

// 为每条弹幕安置位置
var setPosition = function (danmaku) {
    var normal = normalDanmaku(), side = sideDanmaku();
    return danmaku
	.sort(function (x, y) { return x.time - y.time; })
	.map(function (line) {
    var font_size = Math.round(line.size * config.font_size);
    var width = calcWidth(line.text, font_size);
    switch (line.mode) {
    case 'R2L': return (function () {
        var pos = normal(line.time, width, font_size, line.bottom);
        if (!pos) return null;
        line.type = 'R2L';
        line.stime = pos.time;
        line.poss = {
            'x': config.playResX + width / 2,
            'y': pos.top + font_size,
        };
        line.posd = {
            'x': -width / 2,
            'y': pos.top + font_size,
        };
        line.dtime = config.r2ltime + line.stime;
        return line;
    }());
    case 'TOP': case 'BOTTOM': return (function (isTop) {
        var pos = side(line.time, font_size, isTop, line.bottom);
        if (!pos) return null;
        line.type = 'Fix';
        line.stime = pos.time;
        line.posd = line.poss = {
            'x': Math.round(config.playResX / 2),
            'y': pos.top + font_size,
        };
        line.dtime = config.fixtime + line.stime;
        return line;
    }(line.mode === 'TOP'));
    default: return null;
    }
})
	.filter(function (l) { return l; })
	.sort(function (x, y) { return x.stime - y.stime; });
};

/*
	* bilibili
	*/

var parseXML = function (content, data) {
    data = data || (new DOMParser()).parseFromString(content, 'text/xml');
    return Array.apply(Array, data.querySelectorAll('d')).map(function (line) {
        var info = line.getAttribute('p').split(','), text = line.textContent;
        return {
            'text': text,
            'time': Number(info[0]),
            'mode': [undefined, 'R2L', 'R2L', 'R2L', 'BOTTOM', 'TOP'][Number(info[1])],
            'size': Number(info[2]),
            'color': RRGGBB(parseInt(info[3], 10) & 0xffffff),
            'bottom': Number(info[5]) > 0,
	// 'create': new Date(Number(info[4])),
	// 'pool': Number(info[5]),
	// 'sender': String(info[6]),
	// 'dmid': Number(info[7]),
        };
    });
};

initFont();
const xml2ass = (xmldoc, opts) =>  '\ufeff' + generateASS(setPosition(parseXML('', xmldoc)), opts);
/* harmony default export */ __webpack_exports__["a"] = (xml2ass);

/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__commentSenderQuery__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bilibiliVideoProvider__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__xml2ass__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__filename_sanitize__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__cookies__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__genPageFunc__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__addTitleLink__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__sendComment__ = __webpack_require__(8);
// require external libs











//main func
(async function() {
    const url = location.href;
    let avid, page, epid, cid, videoInfo, videoLink, options, isBangumi, genPage;
    //preload options
    const _options = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* storageGet */])();
    //prevent offical html5 autoload
    localStorage.removeItem('defaulth5');

    //get video info
    switch (location.hostname) {
    case 'www.bilibili.com':
        const _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
        if (!_avid) return console.warn('cannot match avid');
        avid = url.match(/bilibili.com\/video\/av([0-9]+)/)[1];
        const _page = url.match(/bilibili.com\/video\/av[0-9]+\/index_([0-9]+).html/);
        page = _page ? _page[1] : 1;
        videoInfo = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__["a" /* bilibiliVideoInfoProvider */])(avid, page);
        break;
    case 'bangumi.bilibili.com':
        const hash = location.hash;
        epid = hash.length > 1 && hash.match(/^\#[0-9]+$/) && hash.substr(1);
        const _epid = url.match(/bangumi.bilibili.com\/anime\/v\/([0-9]+)/);
        if (!epid && _epid) epid = _epid[1];
        if (!epid) return console.warn('cannot match epid');
        videoInfo = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__["b" /* bilibiliBangumiVideoInfoProvider */])(epid);
        avid = videoInfo.avid;
        page = Number(videoInfo.currentPage);
        isBangumi = true;
        break;
    default:
        return;
    }
    cid = videoInfo.list[page - 1].cid;
    if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');

    // preload video links
    const _videoLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__bilibiliVideoProvider__["a" /* default */])(cid, avid, page);
    let comment = {};

    // preload comments
    comment.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
    comment._xml = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* fetchretry */])(comment.url).then(res => res.text()).then(text => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["c" /* parseXmlSafe */])(text));
    options = await _options;

    const videoPic = videoInfo.pic || (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('img.cover_image') && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('img.cover_image').attr('src'));
    //genPage func
    if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.b-page-body')) genPage = decodeURIComponent(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__cookies__["a" /* __GetCookie */])('redirectUrl'));
    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.b-page-body .z-msg') > 0 && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage = 1;
    if (genPage) await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__genPageFunc__["a" /* default */])(cid, videoInfo, genPage);
    //addTitleLink func
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.viewbox .info .v-title h1').html(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__addTitleLink__["a" /* default */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.viewbox .info .v-title h1').attr('title'), options.rel_search));
    const titleNumbers = document.getElementsByClassName('titleNumber');
    if (titleNumbers.length > 0) titleNumbers.forEach(el => {
        el.append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="popuptext">\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent(el.attr("previous")) + '">' + el.attr("previous") + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent(el.attr("next")) + '">' + el.attr("next") + '</a></div>'));
        el.on('click', e => el.find('.popuptext').classList.toggle("show"));
        el.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.parentNode.style.overflow = 'visible';
    });
    //if (_$(".titleNumber")) _$(".titleNumber").onclick = e => (new MessageBox).show(e.target, '<span class="popuptext">\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent(e.target.attr("previous")) + '">' + e.target.attr("previous") + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent(e.target.attr("next")) + '">' + e.target.attr("next") + '</a></span>', 1e3);

    //some ui code from original helper
    let biliHelper = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(isBangumi && !genPage ? "<div class=\"v1-bangumi-info-btn helper\" id=\"bilibili_helper\"><span class=\"t\">哔哩哔哩助手</span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>" : "<div class=\"block helper\" id=\"bilibili_helper\"><span class=\"t\"><div class=\"icon\"></div><div class=\"t-right\"><span class=\"t-right-top middle\">助手</span><span class=\"t-right-bottom\">扩展菜单</span></div></span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
    biliHelper.find('.t').onclick = () => biliHelper.toggleClass('active');
    biliHelper.blockInfo = biliHelper.find('.info');
    biliHelper.mainBlock = biliHelper.find('.main');
    biliHelper.mainBlock.infoSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
    biliHelper.mainBlock.ondblclick = e => e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
    if (genPage && genPage.match && genPage.match('http')) {
        biliHelper.mainBlock.redirectSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section redirect">生成页选项: <a class="b-btn w" href="' + genPage + '">前往原始跳转页</a></div>');
        biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
    }
    biliHelper.mainBlock.speedSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section speed hidden"><h3>视频播放控制</h3><p><span id="bilibili_helper_html5_video_res"></span><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a><br>视频播放速度: <input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1.0" value=1.0 style="width: 40px;">    旋转视频: <input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value=0 style="width: 40px;"></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
    biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
    biliHelper.mainBlock.speedSection.input.step = 0.1;
    biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_res');
    biliHelper.mainBlock.speedSection.mirror = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_mirror');
    biliHelper.mainBlock.speedSection.rotate = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_rotate');
    biliHelper.mainBlock.speedSection.rotate.step = 90;
    biliHelper.mainBlock.switcherSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section switcher"><h3>播放器切换</h3></div>');
    biliHelper.mainBlock.switcherSection.button = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
    biliHelper.mainBlock.switcherSection.button.onclick = e => biliHelper.switcher[e.target.attr('type')]();
    biliHelper.mainBlock.switcherSection.append(biliHelper.mainBlock.switcherSection.button);
    if (biliHelper.redirectUrl) {
        biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
        biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
    }
    if (localStorage.getItem('bilimac_player_type')) biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
    biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
    biliHelper.mainBlock.downloaderSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
    biliHelper.mainBlock.querySection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);
    (isBangumi && !genPage ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.v1-bangumi-info-operate .v1-app-btn').empty() : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('.player-wrapper .arc-toolbar')).append(biliHelper);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<div id="player_placeholder" class="player"></div>');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').find('#player_placeholder').style.cssText =
        `background: url(${videoPic}) 50% 50% / cover no-repeat;
        -webkit-filter: blur(5px);
        overflow: hidden;
        visibility: visible;`;
    let replaceNotice = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div id="loading-notice">正在尝试替换播放器…<span id="cancel-replacing">取消</span></div>');
    replaceNotice.find('#cancel-replacing').onclick = () => !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#loading-notice').remove() && biliHelper.switcher.original();
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').append(replaceNotice);

    // process video links
    videoLink = await _videoLink;

    //downloaderSection code
    const clickDownLinkElementHandler = async(event) => !event.preventDefault() && await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* mySendMessage */])({
        command: 'requestForDownload',
        url: event.target.attr('href'),
        filename: event.target.attr('download')
    });
    const createDownLinkElement = (segmentInfo, index) => {
        const downloadOptions = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["a" /* getDownloadOptions */])(segmentInfo.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, index, videoLink.mediaDataSource.segments.length));
        const length = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["g" /* parseTime */])(segmentInfo.duration);
        const size = (segmentInfo.filesize / 1048576 + 0.5) >>> 0;
        const title = isNaN(size) ? (`长度: ${length}`) : (`长度: ${length} 大小: ${size} MB`);
        let bhDownLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(`<a class="b-btn w" rel="noreferrer" id="bili_helper_down_link_${index}" download="${downloadOptions.filename}" title="${title}" href="${segmentInfo.url}">${'分段 ' + (index + 1)}</a>`);
        bhDownLink.download = downloadOptions.filename;
        bhDownLink.onclick = clickDownLinkElementHandler;
        biliHelper.mainBlock.downloaderSection.find('p').append(bhDownLink);
    };
    biliHelper.mainBlock.downloaderSection.find('p').empty();
    videoLink.mediaDataSource.segments.forEach(createDownLinkElement);

    if (videoLink.mediaDataSource.segments.length > 1) {
        let bhDownAllLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(`<a class="b-btn">下载全部${videoLink.mediaDataSource.segments.length}个分段</a>`);
        biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
        bhDownAllLink.onclick = () => biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each(e => e.click());
    }
    biliHelper.mainBlock.downloaderSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
    biliHelper.mainBlock.downloaderSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));
    if (videoLink.mediaDataSource.type === 'mp4') delete videoLink.mediaDataSource.segments;

    // switcherSection begin
    if (videoLink.mediaDataSource.type === 'flv') biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
    if (videoLink.hd.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
    if (videoLink.ld.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');

    // comment begin
    biliHelper.downloadFileName = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["a" /* getDownloadOptions */])(comment.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, 1, 1)).filename;
    biliHelper.mainBlock.infoSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<span>cid: ' + cid + '</span>'));
    biliHelper.mainBlock.commentSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(`<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="${comment.url}" download="${biliHelper.downloadFileName}">下载 XML 格式弹幕</a></p></div>`);
    biliHelper.mainBlock.commentSection.find('a').onclick = clickDownLinkElementHandler;
    biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
    comment.xml = await comment._xml;
    let assData;
    const clickAssBtnHandler = event => {
        event.preventDefault();
        if (!assData) assData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__xml2ass__["a" /* default */])(comment.xml, {
            'title': __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, 1, 1),
            'ori': location.href,
            'opacity': options.opacity || 0.75
        });
        const assBlob = new Blob([assData], {type: 'application/octet-stream'}),
            assUrl = window.URL.createObjectURL(assBlob);
        event.target.href = assUrl;
        clickDownLinkElementHandler(event);
        document.addEventListener('unload',  () => window.URL.revokeObjectURL(assUrl));
    };
    let assBtn = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(`<a class="b-btn w" download="${biliHelper.downloadFileName.replace('.xml', '.ass')}" href>下载 ASS 格式弹幕</a>`);
    assBtn.onclick = clickAssBtnHandler;
    biliHelper.mainBlock.commentSection.find('p').append(assBtn);

    // begin comment user query
    biliHelper.comments = comment.xml.getElementsByTagName('d');
    let control = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><select class="list"><option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option></select><span class="result">选择弹幕查看发送者…</span></div>');
    control.find('.b-input').onkeyup = e => {
        const keyword = control.find('input').value,
            regex = new RegExp(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(keyword), 'gi');
        control.find('select.list').html('<option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option>');
        for (let node of biliHelper.comments){
            let text = node.childNodes[0];
            if (text && node && regex.test(text.nodeValue)) {
                text = text.nodeValue;
                const commentData = node.getAttribute('p').split(','),
    	                        sender = commentData[6],
    	                        time = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["g" /* parseTime */])(parseInt(commentData[0]) * 1000);
    	        let option = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* $h */])(`<option sender=${sender}></option>`);
    	        option.sender = sender;
    	        option.html('[' + time + '] ' + (keyword.trim() === '' ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(text) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(text).replace(regex, kw => '<span class="kw">' + kw + '</span>')));
    	        control.find('select.list').append(option);
    	    }
        }
    };
    control.find('.b-input').onkeyup();
    const displayUserInfo = (mid, data) => {
        control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(data.name) + '" mid="' + mid + '">' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(data.name) + '</a><div target="_blank" class="user-info-level l' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* parseSafe */])(data.level_info.current_level) + '"></div>');
        let s = document.createElement('script');
        s.appendChild(document.createTextNode('UserCard.bind($("#bilibili_helper .query .result"));'));
        document.body.appendChild(s);
        s.parentNode.removeChild(s);
    };

    const _selectList = control.find('select.list');
    _selectList.style.maxWidth = '272px';
    _selectList.style.borderRadius = '3px';
    _selectList.style.height = '22px';
    _selectList.onchange = e => {
        const sender = _selectList.selectedOptions[0].sender;
        control.find('.result').text('查询中…');
        if (sender.indexOf('D') == 0) return control.find('.result').text('游客弹幕');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__commentSenderQuery__["a" /* default */])(sender).then(data => displayUserInfo(data.mid,data));
    };
    biliHelper.mainBlock.querySection.find('p').empty().append(control);

    // video player switcher begin
    const restartVideo = video => !video.paused && !video.pause() && !video.play();
    const mirrorAndRotateHandler = e => {
        biliHelper.mainBlock.speedSection.rotate.value %= 360;
        let transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
        if (e.target == biliHelper.mainBlock.speedSection.mirror) {
        	if (e.target.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
        	e.target.toggleClass('w');
        } else if (!biliHelper.mainBlock.speedSection.mirror.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
        biliHelper.switcher.video.style.transform = transform;
    };
    biliHelper.switcher = {
        current: "original",
        inited: false,
        _init: function (video) {
            this.video = video;
            biliHelper.mainBlock.speedSection.input.on("change", e => {
                if (Number(e.target.value)) {
                    biliHelper.switcher.video.playbackRate = Number(e.target.value);
                    restartVideo(biliHelper.switcher.video);
                } else {
                    e.target.value = 1.0;
                }
            });
            biliHelper.mainBlock.speedSection.rotate.on("change", mirrorAndRotateHandler);
            biliHelper.mainBlock.speedSection.mirror.on("click", mirrorAndRotateHandler);
            this.inited = 1;
        },
        bind: function (video) {
            this.video = video;
            video.on("loadedmetadata", e => biliHelper.mainBlock.speedSection.res.innerText = '分辨率: ' + e.target.videoWidth + "x" + e.target.videoHeight);
            if (!this.inited) this._init(video);
            biliHelper.mainBlock.speedSection.removeClass('hidden');
        },
        unbind: function () {
            this.video = null;
            biliHelper.mainBlock.speedSection.addClass('hidden');
        },
        set: function (newMode) {
            biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + this.current + '"]').addClass('w');
            biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + newMode + '"]').removeClass('w');
            localStorage.removeItem('defaulth5');
            if (this.current == 'html5' && this.flvPlayer) this.flvPlayer.destroy();
            if (this.checkFinished) clearInterval(this.checkFinished);
            if (this.interval) clearInterval(this.interval);
            if (!newMode.match('html5')) this.unbind();
            biliHelper.mainBlock.speedSection.res.innerText = "";
            biliHelper.mainBlock.speedSection.input.onchange = null;
            biliHelper.mainBlock.speedSection.input.value = 1.0;
            this.current = newMode;
        },
        original: function () {
            this.set('original');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html(biliHelper.originalPlayer);
            if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi embed').attr('width') == 950) __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi embed').setAttribute('width', 980);
        },
        swf: function () {
            this.set('swf');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=' + cid + '&aid=' + avid + '"></object>');
        },
        iframe: function () {
            this.set('iframe');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=' + cid + '&aid=' + avid + '" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>');
        },
        bilih5: function () {
            this.set('bilih5');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<div class="player"><div id="bilibiliPlayer"></div></div>');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* fetchretry */])("https://static.hdslb.com/player/js/bilibiliPlayer.min.js").then(res => res.text()).then(text => {
                let script = document.createElement('script');
                script.appendChild(document.createTextNode(text + ";var player = new bilibiliPlayer({aid: " + avid + ",cid: " + cid + ",autoplay: false,as_wide: false,player_type: 0,pre_ad: 0,lastplaytime: null,enable_ssl: 1,extra_params: null,p: " + page + "})"));
                document.getElementsByTagName('head')[0].appendChild(script);
            });
            biliHelper.switcher.interval = setInterval(function () {
                try {
                    let bilibilivideo = document.getElementsByClassName('bilibili-player-video')[0].firstChild;
                    if (bilibilivideo.tagName == "VIDEO") {
                        this.bind(bilibilivideo);
                        clearInterval(biliHelper.switcher.interval);
                    }
                } catch (e) {}
            }, 500);
        },
        html5: function (type) {
            let html5VideoUrl;
            switch (type) {
            case 'html5ld':
                this.set('html5ld');
                html5VideoUrl = videoLink.ld[0];
                break;
            case 'html5hd':
                this.set('html5hd');
                html5VideoUrl = videoLink.hd[0];
                break;
            default:
                this.set('html5');
                html5VideoUrl = videoLink.hd[0];
                if (videoLink.mediaDataSource.type === 'mp4') return console.warn('No Flv urls available, switch back to html5 hd',biliHelper.switcher.html5hd());
            }
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
            let abp = ABP.create(document.getElementById("bilibili_helper_html5_player"), {
                src: {
                    playlist: [{
                        video: document.getElementById("bilibili_helper_html5_player_video"),
                        comments: BilibiliParser(comment.xml)
                    }]
                },
                width: "100%",
                height: "100%",
                config: options
            });
            abp.playerUnit.addEventListener("wide", () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])("#bofqi").addClass("wide"));
            abp.playerUnit.addEventListener("normal", () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])("#bofqi").removeClass("wide"));
            abp.playerUnit.addEventListener("sendcomment", function (e) {
                const commentId = e.detail.id,
                    commentData = e.detail;
                delete e.detail.id;
                __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__sendComment__["a" /* default */])(avid, cid, page, commentData).then(function (response) {
                    response.tmp_id = commentId;
                    abp.commentCallback(response);
                });
            });
            abp.playerUnit.addEventListener("saveconfig",  e => e.detail && Object.assign(options, e.detail) && chrome.storage.local.set(options));
            this.bind(abp.video);
            if (type && type.match(/hd|ld/)) return abp;
            this.flvPlayer = flvjs.createPlayer(videoLink.mediaDataSource);
            biliHelper.switcher.interval = setInterval(function () {
                if (abp.commentObjArray && biliHelper.switcher.flvPlayer) {
                    clearInterval(biliHelper.switcher.interval);
                    biliHelper.switcher.flvPlayer.attachMediaElement(abp.video);
                    biliHelper.switcher.flvPlayer.load();
                    biliHelper.switcher.flvPlayer.on(flvjs.Events.ERROR, e => console.warn(e, 'Switch back to HTML5 HD.', biliHelper.switcher.html5hd()));
                    biliHelper.switcher.flvPlayer.on(flvjs.Events.MEDIA_INFO, e => console.log('分辨率: ' + e.width + "x" + e.height + ', FPS: ' + e.fps, '视频码率: ' + Math.round(e.videoDataRate * 100) / 100, '音频码率: ' + Math.round(e.audioDataRate * 100) / 100));
                }
            }, 1000);
            let lastTime;
            biliHelper.switcher.checkFinished = setInterval(function () {
                if (abp.video.currentTime !== lastTime) {
                    lastTime = abp.video.currentTime;
                } else {
                    if ((abp.video.duration - abp.video.currentTime) / abp.video.currentTime < 0.001 && !abp.video.paused) {
                        abp.video.currentTime = 0;
                        if (!abp.video.loop) {
                            abp.video.pause();
                            setTimeout(abp.video.pause, 200);
                            document.querySelector('.button.ABP-Play.ABP-Pause.icon-pause').className = "button ABP-Play icon-play";
                        }
                    }
                }
            }, 600);
        },
        html5hd: function () {
            this.set('html5hd');
            let abp = biliHelper.switcher.html5('html5hd');
            abp.video.querySelector('source').on('error', e => {
                if (videoLink.hd.length > 1) {
                    console.warn(e, 'HTML5 HD Error, try another link...');
                    videoLink.hd.splice(0, 1);
                    biliHelper.switcher.html5('html5hd');
                } else console.warn(e, 'HTML5 HD Error, switch back to HTML5 LD.', biliHelper.switcher.html5ld());
            });
        },
        html5ld: function () {
            this.set('html5ld');
            let abp = biliHelper.switcher.html5('html5ld');
            abp.video.querySelector('source').on('error', e => {
                if (videoLink.ld.length > 1) {
                    console.warn(e, 'HTML5 LD Error, try another link...');
                    videoLink.ld.splice(0, 1);
                    biliHelper.switcher.html5('html5ld');
                }
            });
        },
        bilimac: function () {
            this.set('bilimac');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').find('#player_placeholder').style.cssText =
                `background: url(${videoPic}) 50% 50% / cover no-repeat;
                -webkit-filter: blur(20px);
                overflow: hidden;
                visibility: visible;`;
            fetch("http://localhost:23330/rpc", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: `action=playVideoByCID&data=${cid}|${window.location.href}|${document.title}|1`
            }).then(res => res.ok && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载'))
                .catch(e => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* _$ */])('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :('));
        }
    };
    biliHelper.switcher[options.player]();
})();


/***/ }),
/* 11 */
/***/ (function(module, exports) {

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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/* global define */

(function ($) {
    'use strict'

  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
    function safeAdd (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF)
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
        return (msw << 16) | (lsw & 0xFFFF)
    }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
    function bitRotateLeft (num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt))
    }

  /*
  * These functions implement the four basic operations the algorithm uses.
  */
    function md5cmn (q, a, b, x, s, t) {
        return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
    }
    function md5ff (a, b, c, d, x, s, t) {
        return md5cmn((b & c) | ((~b) & d), a, b, x, s, t)
    }
    function md5gg (a, b, c, d, x, s, t) {
        return md5cmn((b & d) | (c & (~d)), a, b, x, s, t)
    }
    function md5hh (a, b, c, d, x, s, t) {
        return md5cmn(b ^ c ^ d, a, b, x, s, t)
    }
    function md5ii (a, b, c, d, x, s, t) {
        return md5cmn(c ^ (b | (~d)), a, b, x, s, t)
    }

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
    function binlMD5 (x, len) {
    /* append padding */
        x[len >> 5] |= 0x80 << (len % 32)
        x[(((len + 64) >>> 9) << 4) + 14] = len

        var i
        var olda
        var oldb
        var oldc
        var oldd
        var a = 1732584193
        var b = -271733879
        var c = -1732584194
        var d = 271733878

        for (i = 0; i < x.length; i += 16) {
            olda = a
            oldb = b
            oldc = c
            oldd = d

            a = md5ff(a, b, c, d, x[i], 7, -680876936)
            d = md5ff(d, a, b, c, x[i + 1], 12, -389564586)
            c = md5ff(c, d, a, b, x[i + 2], 17, 606105819)
            b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330)
            a = md5ff(a, b, c, d, x[i + 4], 7, -176418897)
            d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426)
            c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341)
            b = md5ff(b, c, d, a, x[i + 7], 22, -45705983)
            a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416)
            d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417)
            c = md5ff(c, d, a, b, x[i + 10], 17, -42063)
            b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162)
            a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682)
            d = md5ff(d, a, b, c, x[i + 13], 12, -40341101)
            c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290)
            b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329)

            a = md5gg(a, b, c, d, x[i + 1], 5, -165796510)
            d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632)
            c = md5gg(c, d, a, b, x[i + 11], 14, 643717713)
            b = md5gg(b, c, d, a, x[i], 20, -373897302)
            a = md5gg(a, b, c, d, x[i + 5], 5, -701558691)
            d = md5gg(d, a, b, c, x[i + 10], 9, 38016083)
            c = md5gg(c, d, a, b, x[i + 15], 14, -660478335)
            b = md5gg(b, c, d, a, x[i + 4], 20, -405537848)
            a = md5gg(a, b, c, d, x[i + 9], 5, 568446438)
            d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690)
            c = md5gg(c, d, a, b, x[i + 3], 14, -187363961)
            b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501)
            a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467)
            d = md5gg(d, a, b, c, x[i + 2], 9, -51403784)
            c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473)
            b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734)

            a = md5hh(a, b, c, d, x[i + 5], 4, -378558)
            d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463)
            c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562)
            b = md5hh(b, c, d, a, x[i + 14], 23, -35309556)
            a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060)
            d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353)
            c = md5hh(c, d, a, b, x[i + 7], 16, -155497632)
            b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640)
            a = md5hh(a, b, c, d, x[i + 13], 4, 681279174)
            d = md5hh(d, a, b, c, x[i], 11, -358537222)
            c = md5hh(c, d, a, b, x[i + 3], 16, -722521979)
            b = md5hh(b, c, d, a, x[i + 6], 23, 76029189)
            a = md5hh(a, b, c, d, x[i + 9], 4, -640364487)
            d = md5hh(d, a, b, c, x[i + 12], 11, -421815835)
            c = md5hh(c, d, a, b, x[i + 15], 16, 530742520)
            b = md5hh(b, c, d, a, x[i + 2], 23, -995338651)

            a = md5ii(a, b, c, d, x[i], 6, -198630844)
            d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415)
            c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905)
            b = md5ii(b, c, d, a, x[i + 5], 21, -57434055)
            a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571)
            d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606)
            c = md5ii(c, d, a, b, x[i + 10], 15, -1051523)
            b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799)
            a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359)
            d = md5ii(d, a, b, c, x[i + 15], 10, -30611744)
            c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380)
            b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649)
            a = md5ii(a, b, c, d, x[i + 4], 6, -145523070)
            d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379)
            c = md5ii(c, d, a, b, x[i + 2], 15, 718787259)
            b = md5ii(b, c, d, a, x[i + 9], 21, -343485551)

            a = safeAdd(a, olda)
            b = safeAdd(b, oldb)
            c = safeAdd(c, oldc)
            d = safeAdd(d, oldd)
        }
        return [a, b, c, d]
    }

  /*
  * Convert an array of little-endian words to a string
  */
    function binl2rstr (input) {
        var i
        var output = ''
        var length32 = input.length * 32
        for (i = 0; i < length32; i += 8) {
            output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
        }
        return output
    }

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
    function rstr2binl (input) {
        var i
        var output = []
        output[(input.length >> 2) - 1] = undefined
        for (i = 0; i < output.length; i += 1) {
            output[i] = 0
        }
        var length8 = input.length * 8
        for (i = 0; i < length8; i += 8) {
            output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
        }
        return output
    }

  /*
  * Calculate the MD5 of a raw string
  */
    function rstrMD5 (s) {
        return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
    }

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
    function rstrHMACMD5 (key, data) {
        var i
        var bkey = rstr2binl(key)
        var ipad = []
        var opad = []
        var hash
        ipad[15] = opad[15] = undefined
        if (bkey.length > 16) {
            bkey = binlMD5(bkey, key.length * 8)
        }
        for (i = 0; i < 16; i += 1) {
            ipad[i] = bkey[i] ^ 0x36363636
            opad[i] = bkey[i] ^ 0x5C5C5C5C
        }
        hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
        return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
    }

  /*
  * Convert a raw string to a hex string
  */
    function rstr2hex (input) {
        var hexTab = '0123456789abcdef'
        var output = ''
        var x
        var i
        for (i = 0; i < input.length; i += 1) {
            x = input.charCodeAt(i)
            output += hexTab.charAt((x >>> 4) & 0x0F) +
      hexTab.charAt(x & 0x0F)
        }
        return output
    }

  /*
  * Encode a string as utf-8
  */
    function str2rstrUTF8 (input) {
        return unescape(encodeURIComponent(input))
    }

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
    function rawMD5 (s) {
        return rstrMD5(str2rstrUTF8(s))
    }
    function hexMD5 (s) {
        return rstr2hex(rawMD5(s))
    }
    function rawHMACMD5 (k, d) {
        return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
    }
    function hexHMACMD5 (k, d) {
        return rstr2hex(rawHMACMD5(k, d))
    }

    function md5 (string, key, raw) {
        if (!key) {
            if (!raw) {
                return hexMD5(string)
            }
            return rawMD5(string)
        }
        if (!raw) {
            return hexHMACMD5(key, string)
        }
        return rawHMACMD5(key, string)
    }

    if (true) {
        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
            return md5
        }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
    } else if (typeof module === 'object' && module.exports) {
        module.exports = md5
    } else {
        $.md5 = md5
    }
}(this))

/***/ })
/******/ ]);