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
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
let ep = Element.prototype,
    hp = HTMLCollection.prototype,
    np = NodeList.prototype,
    ap = Array.prototype;

ep.find = ep.querySelector;
ep.findAll = ep.querySelectorAll;
ep.attr = ep.getAttribute;
ep.on = ep.addEventListener;
ep.off = ep.removeEventListener;

// arrow functions binds no this nor arguments
ep.data = function(str) {
    return this.dataset[str];
};
ep.text = function(str) {
    return str ? (this.innerText = str) : this.innerText;
};
ep.empty = function() {
    this.innerHTML = '';
    return this;
};
ep.html = function(str) {
    return str ? (this.innerHTML = str) && this : this.innerHTML;
};
ep.hide = function() {
    this.style.display = 'none';
};
ep.show = function() {
    this.style.display = '';
};
ep.addClass = function(...args) {
    return this.classList.add(...args);
};
ep.removeClass = function(...args) {
    return this.classList.remove(...args);
};
ep.toggleClass = function(...args) {
    return this.classList.toggle(...args);
};
ep.hasClass = function(...args) {
    return this.classList.contains(...args);
};
ep.replaceClass = function(...args) {
    return this.classList.replace(...args);
};
np.map = hp.map = ap.map;
np.each = hp.each = np.forEach;
np.filter = hp.filter = ap.filter;
np.reduce = hp.reduce = ap.reduce;
np.reduceRight = hp.reduceRight = ap.reduceRight;
np.every = hp.every = ap.every;
np.some = hp.some = ap.some;
hp.forEach = ap.forEach;

const sleep = (time = 0) => new Promise((r) => setTimeout(r, time));
/* harmony export (immutable) */ __webpack_exports__["k"] = sleep;

const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
/* unused harmony export formatInt */

const parseSafe = (text) => ('' + text).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
/* harmony export (immutable) */ __webpack_exports__["i"] = parseSafe;

const parseTime = (timecount) => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
/* harmony export (immutable) */ __webpack_exports__["g"] = parseTime;

const mySendMessage = (obj) => new Promise((resolve) => chrome.runtime.sendMessage(obj, resolve));
/* harmony export (immutable) */ __webpack_exports__["f"] = mySendMessage;

const parseXmlSafe = (text) => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ''), 'text/xml');
/* harmony export (immutable) */ __webpack_exports__["l"] = parseXmlSafe;

const storageSet = (data) => new Promise((resolve) => chrome.storage.local.set(data, () => resolve()));
/* unused harmony export storageSet */

const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
/* harmony export (immutable) */ __webpack_exports__["a"] = storageGet;

const storageRemove = (keys) => new Promise((resolve) => chrome.storage.local.remove(keys, resolve));
/* unused harmony export storageRemove */

const storageClear = () => new Promise((resolve) => chrome.storage.local.clear(resolve));
/* unused harmony export storageClear */

// https://gist.github.com/myfreeer/44f23611451119869804f8c28ee1a190
const fetchretry = (url, options) => {
    let retries = (options && options.retries) ? options.retries : 3;
    let retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = (n) => fetch(url, options).then((response) => resolve(response)).catch((error) => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};
/* harmony export (immutable) */ __webpack_exports__["h"] = fetchretry;

const _$ = (e) => document.querySelector(e);
/* harmony export (immutable) */ __webpack_exports__["b"] = _$;

const $h = (html) => {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};
/* harmony export (immutable) */ __webpack_exports__["d"] = $h;

// http://stackoverflow.com/a/15724300/30529
const getCookie = (name) => {
    const value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
};
/* harmony export (immutable) */ __webpack_exports__["c"] = getCookie;

// http://stackoverflow.com/a/11986374
const findPosTop = (obj) => {
    let curtop = obj.offsetTop;
    if (obj.offsetParent) {
        while (obj = obj.offsetParent) {
            curtop += obj.offsetTop;
        }
    }
    return curtop;
};
/* harmony export (immutable) */ __webpack_exports__["e"] = findPosTop;


const unsafeEval = (string) => {
    let script = document.createElement('script');
    script.appendChild(document.createTextNode(string));
    (document.body || document.getElementsByTagName('body')[0]).appendChild(script);
    script.parentNode.removeChild(script);
};
/* harmony export (immutable) */ __webpack_exports__["j"] = unsafeEval;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


// Fix comments to be valid
const foramtTab = (text) => text.replace(/\t/, '\\t');
// Fix Mode7 comments when they are bad
const formatMode7 = (text) => {
    if (text.charAt(0) === '[') {
        switch (text.charAt(text.length - 1)) {
        case ']':
            return text;
        case '"':
            return text + ']';
        case ',':
            return text.substring(0, text.length - 1) + '"]';
        default:
            return formatMode7(text.substring(0, text.length - 1));
        }
    } else {
        return text;
    }
};

/**
 * Bilibili Format Parser
 * @license MIT License
 * @param {Node} elem - a single xml element containing comment
 * @return {Object} comment
 * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
 **/
const parseSingleComment = (elem) => {
    let params;
    try {
        params = elem.getAttribute('p').split(',');
    } catch (e) {
    // Probably not XML
        return null;
    }
    let text = elem.textContent;
    let comment = {};
    comment.time = params[0];
    comment.stime = Math.round(parseFloat(params[0]) * 1000);
    comment.size = parseInt(params[2]);
    comment.color = parseInt(params[3]);
    comment.mode = parseInt(params[1]);
    comment.date = parseInt(params[4]);
    comment.pool = parseInt(params[5]);
    comment.position = 'absolute';
    if (params[7]) {
        comment.dbid = parseInt(params[7]);
    }
    comment.hash = params[6];
    comment.border = false;
    if (comment.mode < 7) {
        comment.text = text.replace(/(\/n|\\n|\n|\r\n)/g, '\n');
    } else {
        if (comment.mode === 7) {
            try {
                text = foramtTab(formatMode7(text));
                comment.mode7Text = text;
                let extendedParams = JSON.parse(text);
                comment.shadow = true;
                comment.x = parseFloat(extendedParams[0]);
                comment.y = parseFloat(extendedParams[1]);
                if (Math.floor(comment.x) < comment.x || Math.floor(comment.y) < comment.y) {
                    comment.position = 'relative';
                }
                comment.text = extendedParams[4].replace(/(\/n|\\n|\n|\r\n)/g, '\n');
                comment.rZ = 0;
                comment.rY = 0;
                if (extendedParams.length >= 7) {
                    comment.rZ = parseInt(extendedParams[5], 10);
                    comment.rY = parseInt(extendedParams[6], 10);
                }
                comment.motion = [];
                comment.movable = false;
                if (extendedParams.length >= 11) {
                    comment.movable = true;
                    let singleStepDur = 500;
                    let motion = {
                        'x': {
                            'from': comment.x,
                            'to': parseFloat(extendedParams[7]),
                            'dur': singleStepDur,
                            'delay': 0,
                        },
                        'y': {
                            'from': comment.y,
                            'to': parseFloat(extendedParams[8]),
                            'dur': singleStepDur,
                            'delay': 0,
                        },
                    };
                    if (extendedParams[9] !== '') {
                        singleStepDur = parseInt(extendedParams[9], 10);
                        motion.x.dur = singleStepDur;
                        motion.y.dur = singleStepDur;
                    }
                    if (extendedParams[10] !== '') {
                        motion.x.delay = parseInt(extendedParams[10], 10);
                        motion.y.delay = parseInt(extendedParams[10], 10);
                    }
                    if (extendedParams.length > 11) {
                        comment.shadow = (extendedParams[11] !== 'false' && extendedParams[11] !== false);
                        if (extendedParams[12]) {
                            comment.font = extendedParams[12];
                        }
                        if (extendedParams.length > 14) {
              // Support for Bilibili advanced Paths
                            if (comment.position === 'relative') {
                                console.warn('Cannot mix relative and absolute positioning!');
                                comment.position = 'absolute';
                            }
                            let path = extendedParams[14];
                            let lastPoint = {
                                x: motion.x.from,
                                y: motion.y.from,
                            };
                            let pathMotion = [];
                            let regex = new RegExp('([a-zA-Z])\\s*(\\d+)[, ](\\d+)', 'g');
                            let counts = path.split(/[a-zA-Z]/).length - 1;
                            let m = regex.exec(path);
                            while (m !== null) {
                                switch (m[1]) {
                                case 'M':
                                    {
                                        lastPoint.x = parseInt(m[2], 10);
                                        lastPoint.y = parseInt(m[3], 10);
                                    }
                                    break;
                                case 'L':
                                    {
                                        pathMotion.push({
                                            'x': {
                                                'from': lastPoint.x,
                                                'to': parseInt(m[2], 10),
                                                'dur': singleStepDur / counts,
                                                'delay': 0,
                                            },
                                            'y': {
                                                'from': lastPoint.y,
                                                'to': parseInt(m[3], 10),
                                                'dur': singleStepDur / counts,
                                                'delay': 0,
                                            },
                                        });
                                        lastPoint.x = parseInt(m[2], 10);
                                        lastPoint.y = parseInt(m[3], 10);
                                    }
                                    break;
                                }
                                m = regex.exec(path);
                            }
                            motion = null;
                            comment.motion = pathMotion;
                        }
                    }
                    if (motion !== null) {
                        comment.motion.push(motion);
                    }
                }
                comment.dur = 2500;
                if (extendedParams[3] < 12) {
                    comment.dur = extendedParams[3] * 1000;
                }
                let tmp = extendedParams[2].split('-');
                if (tmp && tmp.length > 1) {
                    let alphaFrom = parseFloat(tmp[0]);
                    let alphaTo = parseFloat(tmp[1]);
                    comment.opacity = alphaFrom;
                    if (alphaFrom !== alphaTo) {
                        comment.alpha = {
                            'from': alphaFrom,
                            'to': alphaTo,
                        };
                    }
                }
            } catch (e) {
                console.warn('Error occurred in JSON parsing. Could not parse comment:', text);
            }
        } else if (comment.mode === 8) {
            comment.code = text; // Code comments are special. Treat them that way.
        } else {
            console.warn('Unknown comment type : ' + comment.mode + '. Not doing further parsing.', text);
        }
    }
    if (comment.text !== null && typeof comment.text === 'string') {
        comment.text = comment.text.replace(/\u25a0/g, '\u2588');
    }
    return comment;
};
const serializeCommment = (comment) => `<d p="${comment.time},${comment.mode},${comment.size},${comment.color},${comment.pool},${comment.hash},${comment.dbid}">${comment.code || comment.mode7Text || comment.text}</d>`;

class CommmentProvider {
    constructor(cid) {
        this.dbids = {};
        this.comments = [];
        this.cid = cid;
        this.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
    }
    set url(url) {
        this._url = url;
        this.status = this.pushUrl(url);
    }
    get url() {
        return this._url;
    }
    async pushUrl(url) {
        const xml = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* fetchretry */])(url).then((res) => res.text()).then((text) => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["l" /* parseXmlSafe */])(text));
        const comments = [...xml.getElementsByTagName('d')].map(parseSingleComment);
        this.comments = [...this.comments, ...comments.filter((e) => {
            if (!e.dbid) return true;
            if (this.dbids[e.dbid] !== 1) {
                this.dbids[e.dbid] = 1;
                return true;
            }
        })];
    }
    toString() {
        return decodeURIComponent('%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>') + this.cid + '</chatid><mission>0</mission><maxlimit>' + this.comments.length + '</maxlimit>\n' + this.comments.map(serializeCommment).join('\n') + '\n</i>';
    }
    get xml() {
        return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["l" /* parseXmlSafe */])(this.toString());
    }
}

/* harmony default export */ __webpack_exports__["a"] = (CommmentProvider);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__sendComment__ = __webpack_require__(15);


const restartVideo = (video) => !video.paused && !video.pause() && !video.play();

const mirrorAndRotateHandler = (e, speedSection, video) => {
    speedSection.rotate.value %= 360;
    let transform = 'rotate(' + Number(speedSection.rotate.value) + 'deg)';
    if (e.target === speedSection.mirror) {
        if (e.target.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
        e.target.toggleClass('w');
    } else if (!speedSection.mirror.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
    video.style.transform = transform;
};
const cssFilterHandler = (e, speedSection, video) => {
    let filter = '';
    for (let i of ['brightness', 'contrast', 'saturate']) filter += `${i}(${speedSection[i].value}) `;
    video.style.filter = filter;
};

const hdErrorHandler = (e, playerSwitcherObj) => {
    if (e.toString().match('request was interrupted by a call')) throw e;
    let videoLink = playerSwitcherObj.videoLink;
    if (videoLink.hd.length > 1) {
        console.warn(e, 'HTML5 HD Error, try another link...');
        videoLink.hd.shift();
        playerSwitcherObj.setVideoLink(videoLink);
        playerSwitcherObj.html5('html5hd');
    } else console.warn(e, 'HTML5 HD Error, switch back to HTML5 LD.', playerSwitcherObj.html5ld());
};

const ldErrorHandler = (e, playerSwitcherObj) => {
    if (e.toString().match('request was interrupted by a call')) throw e;
    let videoLink = playerSwitcherObj.videoLink;
    if (videoLink.ld.length > 1) {
        console.warn(e, 'HTML5 LD Error, try another link...');
        videoLink.ld.shift();
        playerSwitcherObj.setVideoLink(videoLink);
        playerSwitcherObj.html5('html5ld');
    } else throw e;
};

class PlayerSwitcher {
    constructor(avid, cid, page, videoPic, options, optionsChangeCallback, switcherSection, speedSection, originalPlayerHTML) {
        this.avid = avid;
        this.cid = cid;
        this.page = page;
        this.videoPic = videoPic;
        this.options = options;
        this.optionsChangeCallback = optionsChangeCallback;
        this.switcherSection = switcherSection;
        this.speedSection = speedSection;
        this.originalPlayer = originalPlayerHTML;
        this._isInited = false;
        this.current = 'original';
    }
    _init(video) {
        this.video = video;
        const elements = this.speedSection;
        elements.input.on('change', (e) => {
            if (Number(e.target.value)) {
                this.video.playbackRate = Number(e.target.value);
                restartVideo(this.video);
            } else {
                e.target.value = 1.0;
            }
        });
        elements.rotate.on('change', (e) => mirrorAndRotateHandler(e, this.speedSection, this.video));
        elements.mirror.on('click', (e) => mirrorAndRotateHandler(e, this.speedSection, this.video));
        for (let i of ['brightness', 'contrast', 'saturate']) elements[i].on('change', (e) => cssFilterHandler(e, this.speedSection, this.video));
        this.inited = true;
    }
    _bind(video) {
        this.video = video;
        video.on('loadedmetadata', (e) => this.speedSection.res.innerText = '分辨率: ' + e.target.videoWidth + 'x' + e.target.videoHeight);
        if (!this._isInited) this._init(video);
        this.speedSection.removeClass('hidden');
    }
    _unbind() {
        this.video = null;
        this.speedSection.addClass('hidden');
    }
    setVideoLink(videoLink) {
        this.videoLink = videoLink;
    }
    setComment(ccl) {
        this.ccl = ccl;
    }
    set(newMode) {
        this.switcherSection.find('a.b-btn[type="' + this.current + '"]').addClass('w');
        this.switcherSection.find('a.b-btn[type="' + newMode + '"]').removeClass('w');
        localStorage.removeItem('defaulth5');
        if (this.current === 'html5' && this.flvPlayer) this.flvPlayer.destroy();
        if (this.checkFinished) clearInterval(this.checkFinished);
        if (this.interval) clearInterval(this.interval);
        if (this.cmManager) this.cmManager = null;
        if (!newMode.match('html5')) this._unbind();
        this.speedSection.res.innerText = '';
        this.speedSection.input.onchange = null;
        this.speedSection.input.value = 1.0;
        this.current = newMode;
    }
    original() {
        this.set('original');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html(this.originalPlayer);
        if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi object').attr('width') === 950) __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi object').setAttribute('width', 980);
    }
    swf() {
        this.set('swf');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html(`<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=${this.cid}&aid=${this.avid}"></object>`);
    }
    iframe() {
        this.set('iframe');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html(`<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=${this.cid}&aid=${this.avid}" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>`);
    }
    bilih5() {
        this.set('bilih5');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html(`<iframe height="536" width="980" class="player" src="//www.bilibili.com/html/html5player.html?cid=${this.cid}&aid=${this.avid}" scrolling="no" border="0" frameborder="no" framespacing="0"></iframe>`);
    }
    bilimac() {
        this.set('bilimac');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').find('#player_placeholder').style.cssText =
      `background: url(${this.videoPic}) 50% 50% / cover no-repeat;
                -webkit-filter: blur(20px);
                overflow: hidden;
                visibility: visible;`;
        fetch('http://localhost:23330/rpc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=playVideoByCID&data=${this.cid}|${window.location.href}|${document.title}|1`,
        }).then((res) => res.ok && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载'))
      .catch(() => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :('));
    }
    html5(type) {
        let html5VideoUrl;
        switch (type) {
        case 'html5ld':
            this.set('html5ld');
            html5VideoUrl = this.videoLink.ld[0];
            break;
        case 'html5hd':
            this.set('html5hd');
            html5VideoUrl = this.videoLink.hd[0];
            break;
        default:
            this.set('html5');
            html5VideoUrl = this.videoLink.hd[0];
            if (this.videoLink.mediaDataSource.type === 'mp4') return console.warn('No Flv urls available, switch back to html5 hd', this.html5hd());
        }
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + this.videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
        let abp = ABP.create(document.getElementById('bilibili_helper_html5_player'), {
            src: {
                playlist: [{
                    video: document.getElementById('bilibili_helper_html5_player_video'),
                    comments: this.ccl,
                }],
            },
            width: '100%',
            height: '100%',
            config: this.options,
        });
        abp.playerUnit.addEventListener('wide', () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').addClass('wide'));
        abp.playerUnit.addEventListener('normal', () => __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('#bofqi').removeClass('wide'));
        abp.playerUnit.addEventListener('sendcomment', (e) => {
            const commentId = e.detail.id,
                commentData = e.detail;
            delete e.detail.id;
            __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__sendComment__["a" /* default */])(this.avid, this.cid, this.page, commentData).then((response) => {
                response.tmp_id = commentId;
                abp.commentCallback(response);
            });
        });
        abp.playerUnit.addEventListener('saveconfig', (e) => e.detail && Object.assign(this.options, e.detail) && this.optionsChangeCallback(this.options));
        this._bind(abp.video);
        this.cmManager = abp.cmManager;
        if (type && type.match(/hd|ld/)) return abp;
        this.flvPlayer = flvjs.createPlayer(this.videoLink.mediaDataSource);
        this.interval = setInterval(() => {
            if (abp.commentObjArray && this.flvPlayer) {
                clearInterval(this.interval);
                this.flvPlayer.attachMediaElement(abp.video);
                this.flvPlayer.load();
                this.flvPlayer.on(flvjs.Events.ERROR, (e) => {
                    if (this.videoLink.hd.length > 0)
                        console.warn(e, 'Switch down to HTML5 HD.', this.html5hd());
                    else if (this.videoLink.ld.length > 0)
                        console.warn(e, 'Switch down to HTML5 LD.', this.html5hd());
                });
                this.flvPlayer.on(flvjs.Events.MEDIA_INFO, (e) => console.info('分辨率: ' + e.width + 'x' + e.height + ', FPS: ' + e.fps, '视频码率: ' + Math.round(e.videoDataRate * 100) / 100, '音频码率: ' + Math.round(e.audioDataRate * 100) / 100));
            }
        }, 100);
        let lastTime;
        this.checkFinished = setInterval(() => {
            if (abp.video.currentTime !== lastTime) {
                lastTime = abp.video.currentTime;
            } else {
                if ((abp.video.duration - abp.video.currentTime) / abp.video.currentTime < 0.001 && !abp.video.paused) {
                    abp.video.currentTime = 0;
                    if (!abp.video.loop) {
                        abp.video.pause();
                        setTimeout(abp.video.pause, 200);
                        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["b" /* _$ */])('.button.ABP-Play.ABP-Pause.icon-pause').className = 'button ABP-Play icon-play';
                    }
                }
            }
        }, 200);
    }
    html5hd() {
        this.set('html5hd');
        let abp = this.html5('html5hd');
        abp.video.querySelector('source').on('error', (e) => hdErrorHandler(e, this));
        abp.video.on('error', (e) => hdErrorHandler(e, this));
    }
    html5ld() {
        this.set('html5ld');
        let abp = this.html5('html5ld');
        abp.video.querySelector('source').on('error', (e) => ldErrorHandler(e, this));
        abp.video.on('error', (e) => ldErrorHandler(e, this));
    }
}
/* harmony default export */ __webpack_exports__["a"] = (PlayerSwitcher);


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
function addTitleLink(text, mode) {
    if (mode === 'off') return text;
    return text.replace(/(\d+)/g, function(mathchedText, $1, offset, str) {
        for (let i = offset; i >= 0; i--) {
            if (str[i] === '】') break;
            else if (str[i] === '【') return mathchedText;
        }
        let previous = str.substring(0, offset) + ((parseInt(mathchedText) - 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) - 1).toString()) : ('0' + (parseInt(mathchedText) - 1).toString())) + str.substring(offset + mathchedText.length, str.length)),
            next = str.substring(0, offset) + ((parseInt(mathchedText) + 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) + 1).toString()) : ('0' + (parseInt(mathchedText) + 1).toString())) + str.substring(offset + mathchedText.length, str.length));
        previous = previous.replace(/(#)/g, ' ');
        next = next.replace(/(#)/g, ' ');
        if (mode === 'without') {
            previous = previous.replace(/(\【.*?\】)/g, '');
            next = next.replace(/(\【.*?\】)/g, '');
        }
        return '<span class="titleNumber" previous = "' + previous + '" next = "' + next + '">' + mathchedText + '</span>';
    });
}
/* harmony default export */ __webpack_exports__["a"] = (addTitleLink);


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


const bilibiliVideoInfoProvider = async(avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    if (!avid) throw new Error('bilibiliVideoInfoProvider: avid is reuired');
    const url = [location.protocol + '//api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=' + avid + '&page=' + page + '&batch=true', 'https://www.biliplus.com/api/view?id=' + avid];
    if (sessionStorage[avid + '_' + page]) return JSON.parse(sessionStorage[avid + '_' + page]);
    let json;
    try {
        json = await fetch(n % 2 ? url[1] : url[0], {credentials}).then((response) => response.json());
        if (!json || !(json && json.list && json.list.length) || json && json.code === -503) throw new Error('Can not get valid JSON.');
    } catch (e) {
        if (++n < retries) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["k" /* sleep */])(retryDelay);
            json = await bilibiliVideoInfoProvider(avid, page, credentials, retries, retryDelay, n);
        } else throw e;
    }
    json.pages = json.list.length;
    json.avid = avid;
    json.currentPage = page;
    sessionStorage[avid + '_' + page] = JSON.stringify(json);
    return json;
};
/* harmony export (immutable) */ __webpack_exports__["a"] = bilibiliVideoInfoProvider;


const bilibiliBangumiVideoInfoProvider = async(epid, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    if (!epid) throw new Error('bilibiliBangumiVideoInfoProvider: epid is required');
    let url = location.protocol + '//bangumi.bilibili.com/web_api/episode/' + epid + '.json';
    if (sessionStorage['ep_' + epid]) return JSON.parse(sessionStorage['ep_' + epid]);
    let json, videoInfo;
    try {
        json = await fetch(url, {credentials}).then((response) => response.json());
        if (!json || !(json && json.result && json.result.currentEpisode && json.result.currentEpisode.avId) || json && json.code === -503) throw new Error('Can not get valid JSON.');
        videoInfo = await bilibiliVideoInfoProvider(json.result.currentEpisode.avId, json.result.currentEpisode.page || 1);
    } catch (e) {
        if (++n < retries) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["k" /* sleep */])(retryDelay);
            videoInfo = await bilibiliBangumiVideoInfoProvider(epid, credentials, retries, retryDelay, n);
        } else throw e;
    }
    videoInfo.isBangumi = 1;
    sessionStorage['ep_' + epid] = JSON.stringify(videoInfo);
    return videoInfo;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = bilibiliBangumiVideoInfoProvider;



/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__md5__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);



// from project youtube-dl (Unlicense)
// https://github.com/rg3/youtube-dl/blob/bd8f48c78b952ebe3bf335185c819e265f63cb50/youtube_dl/extractor/bilibili.py#L59-L60
const APPKEY = '84956560bc028eb7';
const APPSECRET = '94aba54af9065f71de72f5508f1cd42e';

// from project you-get (license MIT)
// https://github.com/soimort/you-get/blob/0f0da0ccd72e93a3c93d51b5b90c81513ef77d15/src/you_get/extractors/bilibili.py#L15
const SECRETKEY_MINILOADER = '1c15888dc316e05a15fdd0a02ed6584f';

// from project you-get (license MIT)
// https://github.com/soimort/you-get/blob/a129903da61930472d1bb46a64a0e557cf4184b7/src/you_get/extractors/bilibili.py#L30
const BANGUMI_API_SEC = '9b288147e5474dd2aa67085f716c560d';

const processXmlObj = (obj) => {
    if (obj.video) obj = obj.video;
    if (obj.durl && !obj.durl.push) obj.durl = [obj.durl];
    if (obj.durl.length && obj.durl.length > 0 && obj.durl[0] && obj.durl[0].backup_url && !obj.durl[0].backup_url.push && obj.durl[0].backup_url.url) {
        obj.durl[0].backup_url = obj.durl[0].backup_url.url;
        if (!obj.durl[0].backup_url.push) obj.durl[0].backup_url = [obj.durl[0].backup_url];
    }
    if (obj.accept_quality && !obj.accept_quality.push) obj.accept_quality = obj.accept_quality.split(',').map((e) => Number(e));
    return obj;
};

const xml2obj = (xml) => {
    try {
        let text, obj = {};
        if (xml.children.length > 0) {
            [...xml.children].map((item) => {
                let nodeName = item.nodeName;
                if (typeof (obj[nodeName]) === 'undefined') obj[nodeName] = xml2obj(item);
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
    let mediaDataSource = {};
    mediaDataSource.type = 'flv';
    if (parseInt(json.timelength)) mediaDataSource.duration = parseInt(json.timelength);
    if (json.durl) mediaDataSource.segments = json.durl.map((obj) => ({
        'duration': obj.length,
        'filesize': obj.size,
        'url': obj.url.replace(/^http:\/\//, 'https://'),
    }));
    if (!json.durl) return console.warn('parseJsonforFlvjs Failed: Nothing to play.');
    if (mediaDataSource.segments.length === 1 && json.durl[0].backup_url && json.durl[0].backup_url.length === 1 && !mediaDataSource.segments[0].url.match('flv') && json.durl[0].backup_url[0].match('flv')) mediaDataSource.segments[0].url = json.durl[0].backup_url[0].replace(/^http:\/\//, 'https://');
    if (!mediaDataSource.segments[0].url.match('flv') && mediaDataSource.segments.length === 1) mediaDataSource.type = 'mp4';
    if (mediaDataSource.type === 'mp4') Object.assign(mediaDataSource, mediaDataSource.segments[0]);
    return mediaDataSource;
};

const getVideoLink = async (url, type, retries = 5, credentials = 'include', retryDelay = 500) => {
    let json;
    try {
        if (type === 'flv') {
            let xmltext = await fetch(url, {credentials}).then((res) => res.text());
            json = processXmlObj(xml2obj((new DOMParser()).parseFromString(xmltext, 'text/xml')));
        } else json = await fetch(url, {credentials}).then((response) => response.json());
    } catch (error) {
        if (--retries > 0) {
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["k" /* sleep */])(retryDelay);
            return await getVideoLink(url, type, retries);
        } else json = {
            'code': -1,
            'message': error,
        };
    }
    return json;
};

const bilibiliVideoProvider = async (cid, avid, page = 1, isBangumi = 0, credentials = 'include', retries = 5, retryDelay = 500) => {
    let url = {};
    url._base = location.protocol + '//interface.bilibili.com/playurl?';
    url._query = (type) => `appkey=${APPKEY}&cid=${cid}&otype=json&type=${type}`;
    url.mp4 = url._base + url._query('hdmp4') + '&sign=' + __WEBPACK_IMPORTED_MODULE_0__md5___default()(url._query('hdmp4') + APPSECRET);
    url.flv = url._base + url._query('flv') + '&sign=' + __WEBPACK_IMPORTED_MODULE_0__md5___default()(url._query('flv') + APPSECRET);
    const interfaceUrl = (cid, ts) => `cid=${cid}&player=1&ts=${ts}`;
    const calcSign = (cid, ts) => __WEBPACK_IMPORTED_MODULE_0__md5___default()(`${interfaceUrl(cid, ts)}${SECRETKEY_MINILOADER}`);
    let video = {};
    const types = ['mp4', 'flv'];
    for (let i of types) video[i] = await getVideoLink(url[i], null, retries, credentials, retryDelay);
    video.mediaDataSource = parseJsonforFlvjs(video.flv);
    video.hd = [];
    video.ld = [];
    const processVideoUrl = (url) => {
        if (!url) return;
        url = url.replace(/^http:\/\//, 'https://');
        if (url.match('hd.mp4') || url.match('-48.mp4')) video.hd.push(url);
        else if (url.match('.mp4')) video.ld.push(url);
    };
    const processVideoUrlObj = (obj) => {
        if (!(obj.durl && obj.durl[0] && obj.durl[0].url)) return;
        obj.durl.forEach((durl) => processVideoUrl(durl.url));
        if (obj.durl[0].backup_url && obj.durl[0].backup_url[0]) obj.durl[0].backup_url.forEach((url) => processVideoUrl(url));
    };
    for (let i of types) processVideoUrlObj(video[i]);
    // if flv urls not available, retry with alternative api
    if (!isBangumi && !(video.mediaDataSource && video.mediaDataSource.type === 'flv')) {
        const ts = Math.ceil(Date.now() / 1000);
        url.flv = url._base + `${interfaceUrl(cid, ts)}&sign=${calcSign(cid, ts)}`;
        video.flv = await getVideoLink(url.flv, 'flv', retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    // if flv urls still not available, retry with biliplus api (a 3rd-party api)
    if (!isBangumi && !(video.mediaDataSource && video.mediaDataSource.type === 'flv')) {
        video.flv = await getVideoLink(`${location.protocol}//www.biliplus.com/BPplayurl.php?cid=${cid}&otype=json&quality=4&type=flv&update=1`, null, retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    // if mediaDataSource for bangumis is not available, try bangumi api instead
    if (!video.mediaDataSource && isBangumi) {
        const bgmUrlBase = `cid=22383138&module=bangumi&player=1&ts=${(new Date() / 1000) | 0}`;
        url.flv = `${location.protocol}//bangumi.bilibili.com/player/web_api/playurl?${bgmUrlBase}&sign=${__WEBPACK_IMPORTED_MODULE_0__md5___default()(bgmUrlBase + BANGUMI_API_SEC)}`;
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
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__commentSenderQuery__ = __webpack_require__(11);



const commentQuerySection = (comments, element) => {
    let control = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* $h */])('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><select class="list"><option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option></select><span class="result">选择弹幕查看发送者…</span></div>');
    control.find('.b-input').onkeyup = () => {
        const keyword = control.find('input').value,
            regex = new RegExp(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(keyword), 'gi');
        control.find('select.list').html('<option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option>');
        for (const comment of comments) {
            let text = comment.text;
            if (text && regex.test(text.nodeValue)) {
                const sender = comment.hash,
                    time = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["g" /* parseTime */])(comment.stime);
                let option = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["d" /* $h */])(`<option sender=${sender}></option>`);
                option.sender = sender;
                option.html('[' + time + '] ' + (keyword.trim() === '' ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(text) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(text).replace(regex, (kw) => '<span class="kw">' + kw + '</span>')));
                control.find('select.list').append(option);
            }
        }
    };
    control.find('.b-input').onkeyup();
    const displayUserInfo = (mid, data) => {
        if (!mid) return control.find('.result').text('查询失败');
        control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(data.name) + '" mid="' + mid + '">' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(data.name) + '</a><div target="_blank" class="user-info-level l' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(data.level_info.current_level) + '"></div>');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["j" /* unsafeEval */])('UserCard.bind($("#bilibili_helper .query .result"));');
    };

    const _selectList = control.find('select.list');
    _selectList.style.maxWidth = '272px';
    _selectList.style.borderRadius = '3px';
    _selectList.style.height = '25px';
    _selectList.onchange = () => {
        const sender = _selectList.selectedOptions[0].sender;
        control.find('.result').text('查询中…');
        if (sender.indexOf('D') === 0) return control.find('.result').text('游客弹幕');
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__commentSenderQuery__["a" /* default */])(sender).then((data) => displayUserInfo(data.mid, data));
    };
    element.empty().append(control);
};
/* harmony default export */ __webpack_exports__["a"] = (commentQuerySection);


/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


const commentsHistorySection = async(cid, element, changeComments) => {
    let _rolldate = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* fetchretry */])(`${location.protocol}//comment.bilibili.com/rolldate,${cid}`).then((res) => res.json());
    let dmrollUI = document.createElement('select');
    dmrollUI.style.cssText = 'max-width: 272px;height: 25px;border-radius: 4px;';
    let rolldate;
    try {
        rolldate = await _rolldate;
    } catch (e) {
        return e;
    }
    let date = new Date();
    if (!(rolldate && rolldate.length > 0)) return false;
    dmrollUI.innerHTML = `<option value="${location.protocol}//comment.bilibili.com/${cid}.xml" selected="selected">历史弹幕：现在</option>` + rolldate.map((e) => `<option value="${location.protocol + '//comment.bilibili.com/dmroll,' + e.timestamp + ',' + cid}">历史弹幕：${(date.setTime(parseInt(e.timestamp) * 1000, 10)) && date.toLocaleDateString()}，新增${e.new}条</option>`).join('');
    dmrollUI.onchange = () => changeComments(dmrollUI.selectedOptions[0].value);
    element.empty().appendChild(dmrollUI);
    return true;
};
/* harmony default export */ __webpack_exports__["a"] = (commentsHistorySection);


/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
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
const illegalRe = /[\/\?<>\\:\*\|":~]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

// Truncate string by size in bytes
function truncate(str, maxByteSize) {
    let strLen = str.length,
        curByteSize = 0,
        codePoint = -1;

    for (let i = 0; i < strLen; i++) {
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
    const sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement);
    return truncate(sanitized, max);
}

let filenameSanitize = function(input, options) {
    const replacement = (options && options.replacement) || '';
    const max = (options && options.max && (options.max < 255)) ? options.max : 255;
    const output = sanitize(input, replacement, max);
    if (replacement === '') {
        return output;
    }
    return sanitize(output, '');
};

function getNiceSectionFilename(avid, page, totalPage, idx, numParts, videoInfo) {
    // TODO inspect the page to get better section name
    let idName = 'av' + avid,
        // page/part name is only shown when there are more than one pages/parts
        pageIdName = (totalPage && (totalPage > 1)) ? ('p' + page) : '',
        pageName = '',
        partIdName = (numParts && (numParts > 1)) ? ('' + idx) : '';

    // try to find a good page name
    if (pageIdName) {
        pageName = videoInfo.list[page - 1].part;
        pageName = pageName.substr(pageName.indexOf('、') + 1);
        if (!partIdName) document.title = pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName;
        return partIdName ? pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName + '_' + partIdName : pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName;
    }
    if (!partIdName) document.title = videoInfo.title + '_' + idName;
    // document.title contains other info feeling too much
    return partIdName ? videoInfo.title + '_' + idName + '_' + partIdName : videoInfo.title + '_' + idName;
}

// Helper function, return object {url, filename}, options object used by
// "chrome.downloads.download"
function getDownloadOptions(url, filename) {
    // TODO Improve file extension determination process.
    //
    // Parsing the url should be ok in most cases, but the best way should
    // use MIME types and tentative file names returned by server. Not
    // feasible at this stage.
    let resFn = null,
        fileBaseName = url.split(/[\\/]/).pop().split('?')[0],
        // arbitrarily default to "mp4" for no better reason...
        fileExt = fileBaseName.match(/[.]/) ? fileBaseName.match(/[^.]+$/) : 'mp4';

    // file extension auto conversion.
    //
    // Some sources are known to give weird file extensions, do our best to
    // convert them.
    switch (fileExt) {
    case 'letv':
        fileExt = 'flv';
        break;
    default:
         // remain the same, nothing
    }

    resFn = filenameSanitize(filename, {
        replacement: '_',
        max: 255 - fileExt.length - 1,
    }) + '.' + fileExt;

    return {
        'url': url,
        'filename': resFn,
    };
}


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);

const docReady = () => new Promise((r) => document.addEventListener('DOMContentLoaded', r));
const replaceList = ['avid', 'author', 'play', 'video_review', 'coins', 'favorites', 'tid', 'mid', 'pic', 'spid', 'season_id', 'created_at', 'face'];
const genPageFunc = async(cid, videoInfo, redirectUrl) => {
    let tagList = '';
    let alist = '';
    if (videoInfo && videoInfo.list && videoInfo.list.length > 1) {
        alist += '<select id=\'dedepagetitles\' onchange=\'location.href=this.options[this.selectedIndex].value;\'>';
        alist += videoInfo.list.map((vPart) => '<option value=\'/video/av' + videoInfo.avid + '/index_' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(vPart.page) + '.html\'>' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(vPart.page) + '、' + (vPart.part ? vPart.part : ('P' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(vPart.page))) + '</option>').join();
        alist += '</select>';
    }
    if (videoInfo && videoInfo.tag) tagList += videoInfo.tag.split(',').map((tag) => '<li><a class="tag-val" href="/tag/' + encodeURIComponent(tag) + '/" title="' + tag + '" target="_blank">' + tag + '</a></li>').join('');
    if (!videoInfo.tag) videoInfo.tag = '';
    const template = await fetch(chrome.runtime.getURL('template.html')).then((res) => res.text());
    let page = template.replace(/__bl_page/g, videoInfo.currentPage)
        .replace(/__bl_cid/g, cid)
        .replace(/__bl_title/g, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(videoInfo.title))
        .replace(/__bl_sp_title_uri/g, videoInfo.sp_title ? encodeURIComponent(videoInfo.sp_title) : '')
        .replace(/__bl_sp_title/g, videoInfo.sp_title ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(videoInfo.sp_title) : '')
        .replace(/__bl_description/g, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["i" /* parseSafe */])(videoInfo.description))
        .replace(/__bl_redirectUrl/g, redirectUrl)
        .replace(/__bl_tags/g, JSON.stringify(videoInfo.tag.split(',')))
        .replace(/__bl_tag_list/g, tagList)
        .replace(/__bl_alist/g, alist)
        .replace(/__bl_bangumi_cover/g, videoInfo.pic)
        .replace(/__bl_bangumi_desc/g, videoInfo.description);
    for (let i of replaceList) page = page.replace(new RegExp('__bl_' + i, 'g'), videoInfo[i]);
    document.open();
    document.write(page);
    document.close();
    await docReady();
    await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["k" /* sleep */])(500);
    await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["f" /* mySendMessage */])({command: 'injectCSS'});
    return false;
};
/* harmony default export */ __webpack_exports__["a"] = (genPageFunc);


/***/ }),
/* 10 */
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
let config = {
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

let debug = config.debug ? console.warn.bind(console) : function() { };

// 将字典中的值填入字符串
let fillStr = function(str) {
    let dict = Array.apply(Array, arguments);
    return str.replace(/{{([^}]+)}}/g, function(r, o) {
        let ret;
        dict.some(function(i) {
            return ret = i[o];
        });
        return ret || '';
    });
};

// 将颜色的数值化为十六进制字符串表示
let RRGGBB = function(color) {
    let t = Number(color).toString(16).toUpperCase();
    return ('000000' + t).slice(-6);
};

// 将可见度转换为透明度
let hexAlpha = function(opacity) {
    let alpha = Math.round(0xFF * (1 - opacity)).toString(16).toUpperCase();
    return Array(3 - alpha.length).join('0') + alpha;
};

// 平方和开根
let hypot = Math.hypot ? Math.hypot.bind(Math) : function() {
    return Math.sqrt([0].concat(Array.apply(Array, arguments))
	.reduce(function(x, y) {
    return x + y * y;
}));
};

// 计算文字宽度
let calcWidth = (function() {
	// 使用Canvas计算
    let calcWidthCanvas = function() {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        return function(fontname, text, fontsize) {
            context.font = 'bold ' + fontsize + 'px ' + fontname;
            return Math.ceil(context.measureText(text).width + config.space);
        };
    };

	// 使用Div计算
    let calcWidthDiv = function() {
        let d = document.createElement('div');
        d.setAttribute('style', [
            'all: unset', 'top: -10000px', 'left: -10000px',
            'width: auto', 'height: auto', 'position: absolute',
            ''].join(' !important; '));
        let ld = function() {
            document.body.parentNode.appendChild(d);
        };
        if (!document.body) document.addEventListener('DOMContentLoaded', ld);
        else ld();
        return function(fontname, text, fontsize) {
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
let choseFont = function(fontlist) {
	// 检查这个字串的宽度来检查字体是否存在
    let sampleText =
	'The quick brown fox jumps over the lazy dog' +
	'7531902468' + ',.!-' + '，。：！' +
	'天地玄黄' + '則近道矣';
	// 和这些字体进行比较
    let sampleFont = [
        'monospace', 'sans-serif', 'sans',
        'Symbol', 'Arial', 'Comic Sans MS', 'Fixed', 'Terminal',
        'Times', 'Times New Roman',
        '宋体', '黑体', '文泉驿正黑', 'Microsoft YaHei', 'PingFang SC',
    ];
	// 如果被检查的字体和基准字体可以渲染出不同的宽度
	// 那么说明被检查的字体总是存在的
    let diffFont = function(base, test) {
        let baseSize = calcWidth(base, sampleText, 72);
        let testSize = calcWidth(test + ',' + base, sampleText, 72);
        return baseSize !== testSize;
    };
    let validFont = function(test) {
        let valid = sampleFont.some(function(base) {
            return diffFont(base, test);
        });
        debug('font %s: %o', test, valid);
        return valid;
    };
	// 找一个能用的字体
    let f = fontlist[fontlist.length - 1];
    fontlist = fontlist.filter(validFont);
    debug('fontlist: %o', fontlist);
    return fontlist[0] || f;
};

// 从备选的字体中选择一个机器上提供了的字体
let initFont = (function() {
    let done = false;
    return function() {
        if (done) return; done = true;
        calcWidth = calcWidth.bind(window,
	config.font = choseFont(config.fontlist)
	);
    };
}());

let generateASS = function(danmaku, info) {
    if (Number(info.opacity)) config.opacity = info.opacity;
    let assHeader = fillStr('[Script Info]\nTitle: {{title}}\nOriginal Script: 根据 {{ori}} 的弹幕信息，由 https://github.com/tiansh/us-danmaku 生成\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: {{playResX}}\nPlayResY: {{playResY}}\nTimer: 10.0000\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Fix,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\nStyle: R2L,{{font}},25,&H{{alpha}}FFFFFF,&H{{alpha}}FFFFFF,&H{{alpha}}000000,&H{{alpha}}000000,0,0,0,0,100,100,0,0,1,2,0,2,20,20,2,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n', config, info, {'alpha': hexAlpha(config.opacity)});
	// 补齐数字开头的0
    let paddingNum = function(num, len) {
        num = '' + num;
        while (num.length < len) num = '0' + num;
        return num;
    };
	// 格式化时间
    let formatTime = function(time) {
        time = 100 * time ^ 0;
        let l = [[100, 2], [60, 2], [60, 2], [Infinity, 0]].map(function(c) {
            let r = time % c[0];
            time = (time - r) / c[0];
            return paddingNum(r, c[1]);
        }).reverse();
        return l.slice(0, -1).join(':') + '.' + l[3];
    };
	// 格式化特效
    let format = (function() {
	// 适用于所有弹幕
        let common = function(line) {
            let s = '';
            let rgb = line.color.split(/(..)/).filter(function(x) {
                return x;
            })
	.map(function(x) {
    return parseInt(x, 16);
});
	// 如果不是白色，要指定弹幕特殊的颜色
            if (line.color !== 'FFFFFF') // line.color 是 RRGGBB 格式
                s += '\\c&H' + line.color.split(/(..)/).reverse().join('');
	// 如果弹幕颜色比较深，用白色的外边框
            let dark = rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 0x30;
            if (dark) s += '\\3c&HFFFFFF';
            if (line.size !== 25) s += '\\fs' + line.size;
            return s;
        };
	// 适用于从右到左弹幕
        let r2l = function(line) {
            return '\\move(' + [
                line.poss.x, line.poss.y, line.posd.x, line.posd.y,
            ].join(',') + ')';
        };
	// 适用于固定位置弹幕
        let fix = function(line) {
            return '\\pos(' + [
                line.poss.x, line.poss.y,
            ].join(',') + ')';
        };
        let withCommon = function(f) {
            return function(line) {
                return f(line) + common(line);
            };
        };
        return {
            'R2L': withCommon(r2l),
            'Fix': withCommon(fix),
        };
    }());
	// 转义一些字符
    let escapeAssText = function(s) {
	// "{"、"}"字符libass可以转义，但是VSFilter不可以，所以直接用全角补上
        return s.replace(/{/g, '｛').replace(/}/g, '｝').replace(/\r|\n/g, '');
    };
	// 将一行转换为ASS的事件
    let convert2Ass = function(line) {
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
	.filter(function(x) {
    return x;
})
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
let normalDanmaku = (function(wc, hc, b, u, maxr) {
    return function() {
	// 初始化屏幕外面是不可用的
        let used = [
	{'p': -Infinity, 'm': 0, 'tf': Infinity, 'td': Infinity, 'b': false},
	{'p': hc, 'm': Infinity, 'tf': Infinity, 'td': Infinity, 'b': false},
	{'p': hc - b, 'm': hc, 'tf': Infinity, 'td': Infinity, 'b': true},
        ];
	// 检查一些可用的位置
        let available = function(hv, t0s, t0l, b) {
            let suggestion = [];
	// 这些上边缘总之别的块的下边缘
            used.forEach(function(i) {
                if (i.m > hc) return;
                let p = i.m;
                let m = p + hv;
                let tas = t0s;
                let tal = t0l;
	// 这些块的左边缘总是这个区域里面最大的边缘
                used.forEach(function(j) {
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
            suggestion.sort(function(x, y) {
                return x.p - y.p;
            });
            let mr = maxr;
	// 又靠右又靠下的选择可以忽略，剩下的返回
            suggestion = suggestion.filter(function(i) {
                if (i.r >= mr) return false;
                mr = i.r;
                return true;
            });
            return suggestion;
        };
	// 添加一个被使用的
        let use = function(p, m, tf, td) {
            used.push({'p': p, 'm': m, 'tf': tf, 'td': td, 'b': false});
        };
	// 根据时间同步掉无用的
        let syn = function(t0s, t0l) {
            used = used.filter(function(i) {
                return i.tf > t0s || i.td > t0l;
            });
        };
	// 给所有可能的位置打分，分数是[0, 1)的
        let score = function(i) {
            if (i.r > maxr) return -Infinity;
            return 1 - hypot(i.r / maxr, i.p / hc) * Math.SQRT1_2;
        };
	// 添加一条
        return function(t0s, wv, hv, b) {
            let t0l = wc / (wv + wc) * u + t0s;
            syn(t0s, t0l);
            let al = available(hv, t0s, t0l, b);
            if (!al.length) return null;
            let scored = al.map(function(i) {
                return [score(i), i];
            });
            let best = scored.reduce(function(x, y) {
                return x[0] > y[0] ? x : y;
            })[1];
            let ts = t0s + best.r;
            let tf = wv / (wv + wc) * u + ts;
            let td = u + ts;
            use(best.p, best.p + hv, tf, td);
            return {
                'top': best.p,
                'time': ts,
            };
        };
    };
}(config.playResX, config.playResY, config.bottom, config.r2ltime, config.max_delay));

// 顶部、底部弹幕
let sideDanmaku = (function(hc, b, u, maxr) {
    return function() {
        let used = [
	{'p': -Infinity, 'm': 0, 'td': Infinity, 'b': false},
	{'p': hc, 'm': Infinity, 'td': Infinity, 'b': false},
	{'p': hc - b, 'm': hc, 'td': Infinity, 'b': true},
        ];
	// 查找可用的位置
        let fr = function(p, m, t0s, b) {
            let tas = t0s;
            used.forEach(function(j) {
                if (j.p >= m) return;
                if (j.m <= p) return;
                if (j.b && b) return;
                tas = Math.max(tas, j.td);
            });
            return {'r': tas - t0s, 'p': p, 'm': m};
        };
	// 顶部
        let top = function(hv, t0s, b) {
            let suggestion = [];
            used.forEach(function(i) {
                if (i.m > hc) return;
                suggestion.push(fr(i.m, i.m + hv, t0s, b));
            });
            return suggestion;
        };
	// 底部
        let bottom = function(hv, t0s, b) {
            let suggestion = [];
            used.forEach(function(i) {
                if (i.p < 0) return;
                suggestion.push(fr(i.p - hv, i.p, t0s, b));
            });
            return suggestion;
        };
        let use = function(p, m, td) {
            used.push({'p': p, 'm': m, 'td': td, 'b': false});
        };
        let syn = function(t0s) {
            used = used.filter(function(i) {
                return i.td > t0s;
            });
        };
	// 挑选最好的方案：延迟小的优先，位置不重要
        let score = function(i, is_top) {
            if (i.r > maxr) return -Infinity;
            let f = function(p) {
                return is_top ? p : (hc - p);
            };
            return 1 - (i.r / maxr * (31 / 32) + f(i.p) / hc * (1 / 32));
        };
        return function(t0s, hv, is_top, b) {
            syn(t0s);
            let al = (is_top ? top : bottom)(hv, t0s, b);
            if (!al.length) return null;
            let scored = al.map(function(i) {
                return [score(i, is_top), i];
            });
            let best = scored.reduce(function(x, y) {
                return x[0] > y[0] ? x : y;
            })[1];
            use(best.p, best.m, best.r + t0s + u);
            return {'top': best.p, 'time': best.r + t0s};
        };
    };
}(config.playResY, config.bottom, config.fixtime, config.max_delay));

// 为每条弹幕安置位置
let setPosition = function(danmaku) {
    let normal = normalDanmaku(), side = sideDanmaku();
    return danmaku
	.sort(function(x, y) {
    return x.time - y.time;
})
	.map(function(line) {
    let font_size = Math.round(line.size * config.font_size);
    let width = calcWidth(line.text, font_size);
    switch (line.mode) {
    case 'R2L': return (function() {
        let pos = normal(line.time, width, font_size, line.bottom);
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
    case 'TOP': case 'BOTTOM': return (function(isTop) {
        let pos = side(line.time, font_size, isTop, line.bottom);
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
	.filter(function(l) {
    return l;
})
	.sort(function(x, y) {
    return x.stime - y.stime;
});
};

/*
	* bilibili
	*/

let parseXML = function(content, data) {
    data = data || (new DOMParser()).parseFromString(content, 'text/xml');
    return Array.apply(Array, data.querySelectorAll('d')).map(function(line) {
        let info = line.getAttribute('p').split(','), text = line.textContent;
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
const xml2ass = (xmldoc, opts) => '\ufeff' + generateASS(setPosition(parseXML('', xmldoc)), opts);
/* harmony default export */ __webpack_exports__["a"] = (xml2ass);


/***/ }),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__crc32__ = __webpack_require__(13);

const commentSenderQuery = async(hash, retries = 5) => {
    if (sessionStorage['commentSender_hash_' + hash]) return JSON.parse(sessionStorage['commentSender_hash_' + hash]);
    if (hash.indexOf('D') === 0) return {};
    let mid = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__crc32__["a" /* checkCRCHash */])(hash);
    if (!mid) return {mid};
    try {
        let json = await fetch(`${location.protocol}//api.bilibili.com/x/web-interface/card?mid=${mid}&type=json`).then((res) => res.json());
        if (hash && (__WEBPACK_IMPORTED_MODULE_0__crc32__["b" /* CRC32 */].bstr('' + mid) >>> 0) === parseInt(hash, 16)) sessionStorage['commentSender_hash_' + hash] = JSON.stringify(json.data.card);
        return json.data.card;
    } catch (e) {
        if (--retries > 0) return await commentSenderQuery(hash, retries);
        else return mid;
    }
};
/* harmony default export */ __webpack_exports__["a"] = (commentSenderQuery);


/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__commentQuerySection__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__commentsHistorySection__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__bilibiliVideoProvider__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__xml2ass__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__filename_sanitize__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__genPageFunc__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__addTitleLink__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__PlayerSwitcher__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__CommmentProvider__ = __webpack_require__(1);
// require external libs












// main func
(async function() {
    const url = location.href;
    let avid, page, epid, cid, videoInfo, videoLink, options, isBangumi, genPage;
    // preload options
    const _options = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* storageGet */])();
    // prevent offical html5 autoload
    localStorage.removeItem('defaulth5');

    // get video info
    switch (location.hostname) {
    case 'www.bilibili.com': {
        let _avid, _page;
        if (url.match('bilibili.com/watchlater')) {
            _avid = url.match(/bilibili.com\/watchlater\/#\/av(\d+)/);
            _page = url.match(/bilibili.com\/watchlater\/#\/av\d+/);
        } else {
            _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
            _page = url.match(/bilibili.com\/video\/av[0-9]+\/index_([0-9]+)/);
        }
        if (!(_avid && _avid[1])) return console.warn('cannot match avid');
        avid = _avid[1];
        page = (_page && _page[1]) ? _page[1] : 1;
        videoInfo = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__["a" /* bilibiliVideoInfoProvider */])(avid, page);
        break;
    }
    case 'bangumi.bilibili.com': {
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
    }
    default:
        return;
    }
    cid = videoInfo.list[page - 1].cid;
    if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');

    // workaround for hash-based page change
    window.onhashchange = (e) => {
        let page;
        if (page = location.hash.match(/^#page=(\d+)$/)) location.href = `index_${page[1]}.html`;
    };

    // preload video links
    if (!__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.b-page-body')) genPage = decodeURIComponent(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["c" /* getCookie */])('redirectUrl'));
    const _videoLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__bilibiliVideoProvider__["a" /* default */])(cid, avid, page, videoInfo.isBangumi || isBangumi || (genPage && genPage.match && genPage.match('bangumi')));

    // preload comments
    let comment = new __WEBPACK_IMPORTED_MODULE_10__CommmentProvider__["a" /* default */](cid);
    options = await _options;
    const optionsChangeCallback = (newOpts) => (options = newOpts) && chrome.storage.local.set(options);

    const videoPic = videoInfo.pic || (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('img.cover_image') && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('img.cover_image').attr('src'));

    // genPage func
    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.b-page-body .z-msg') > 0 && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage = 1;
    if (genPage) await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__genPageFunc__["a" /* default */])(cid, videoInfo, genPage);

    // addTitleLink func
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.viewbox .info .v-title h1').html(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__addTitleLink__["a" /* default */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.viewbox .info .v-title h1').attr('title'), options.rel_search));
    const titleNumbers = document.getElementsByClassName('titleNumber');
    if (titleNumbers.length > 0) titleNumbers.forEach((el) => {
        el.append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="popuptext">\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent(el.attr('previous')) + '">' + el.attr('previous') + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent(el.attr('next')) + '">' + el.attr('next') + '</a></div>'));
        el.on('click', () => el.find('.popuptext').classList.toggle('show'));
        el.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.parentNode.style.overflow = 'visible';
    });

    // some ui code from original helper
    let biliHelper = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])(isBangumi && !genPage ? '<div class="v1-bangumi-info-btn helper" id="bilibili_helper"><span class="t">哔哩哔哩助手</span><div class="info"><div class="main"></div><div class="version">哔哩哔哩助手 ' + chrome.runtime.getManifest().version + '<a class="setting b-btn w" href="' + chrome.runtime.getURL('options.html') + '" target="_blank">设置</a></div></div></div>' : '<div class="block helper" id="bilibili_helper"><span class="t"><div class="icon"></div><div class="t-right"><span class="t-right-top middle">助手</span><span class="t-right-bottom">扩展菜单</span></div></span><div class="info"><div class="main"></div><div class="version">哔哩哔哩助手 ' + chrome.runtime.getManifest().version + '<a class="setting b-btn w" href="' + chrome.runtime.getURL('options.html') + '" target="_blank">设置</a></div></div></div>');
    biliHelper.find('.t').onclick = () => biliHelper.toggleClass('active');
    biliHelper.blockInfo = biliHelper.find('.info');
    biliHelper.mainBlock = biliHelper.find('.main');
    biliHelper.mainBlock.infoSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span><span id="bilibili_helper_html5_video_res"></span></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
    biliHelper.mainBlock.ondblclick = (e) => e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
    if (genPage && genPage.match && genPage.match('http')) {
        biliHelper.mainBlock.redirectSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section redirect">生成页选项: <a class="b-btn w" href="' + genPage + '">前往原始跳转页</a></div>');
        biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
    }
    biliHelper.mainBlock.speedSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section speed hidden"><h3>视频播放控制</h3><p><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a>  旋转视频: <input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value="0" style="padding: 0px;width: 40px;" step="90">  亮度: <input id="bilibili_helper_html5_video_brightness" type="number" class="b-input" placeholder="1" value="1" step="0.1"><br>播放速度: <input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1" value="1" step="0.1">对比度:<input id="bilibili_helper_html5_video_contrast" type="number" class="b-input" placeholder="1" value="1" step="0.1">饱和度:<input id="bilibili_helper_html5_video_saturate" type="number" class="b-input" placeholder="1" value="1" step="0.1"></p></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
    biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
    biliHelper.mainBlock.speedSection.input.step = 0.1;
    biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.infoSection.find('#bilibili_helper_html5_video_res');
    for (let i of ['mirror', 'rotate', 'brightness', 'speed', 'contrast', 'saturate']) biliHelper.mainBlock.speedSection[i] = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_' + i);
    biliHelper.mainBlock.speedSection.rotate.step = 90;
    biliHelper.mainBlock.switcherSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section switcher"><h3>播放器切换</h3></div>');
    biliHelper.mainBlock.switcherSection.button = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
    biliHelper.mainBlock.switcherSection.button.onclick = (e) => playerSwitcher[e.target.attr('type')]();
    biliHelper.mainBlock.switcherSection.append(biliHelper.mainBlock.switcherSection.button);
    if (genPage) {
        biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
        biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
    }
    if (localStorage.getItem('bilimac_player_type')) biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
    biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
    biliHelper.mainBlock.downloaderSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
    biliHelper.mainBlock.querySection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);
    biliHelper.mainBlock.historySection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div class="section history"><h3>历史弹幕切换</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.historySection);
    biliHelper.originalPlayerHTML = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#bofqi').innerHTML;
    (isBangumi && !genPage ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.v1-bangumi-info-operate .v1-app-btn').empty() : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('.player-wrapper .arc-toolbar')).append(biliHelper);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#bofqi').html('<div id="player_placeholder" class="player"></div>');
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#bofqi').find('#player_placeholder').style.cssText =
        `background: url(${videoPic}) 50% 50% / cover no-repeat;
        -webkit-filter: blur(5px);
        overflow: hidden;
        visibility: visible;`;
    let replaceNotice = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<div id="loading-notice">正在尝试替换播放器…<span id="cancel-replacing">取消</span></div>');
    replaceNotice.find('#cancel-replacing').onclick = () => !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#loading-notice').remove() && playerSwitcher.original();
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#bofqi').append(replaceNotice);
    if (options.scrollToPlayer) window.scroll(window.pageXOffset, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* findPosTop */])(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* _$ */])('#bofqi')) - 30);
    // Initize PlayerSwitcher
    let playerSwitcher = new __WEBPACK_IMPORTED_MODULE_9__PlayerSwitcher__["a" /* default */](avid, cid, page, videoPic, options, optionsChangeCallback, biliHelper.mainBlock.switcherSection, biliHelper.mainBlock.speedSection, biliHelper.originalPlayerHTML);

    // process video links
    videoLink = await _videoLink;
    // follow ws video url redircet
    for (let i in videoLink.hd) if (videoLink.hd[i].match('ws.acgvideo.com')) fetch(videoLink.hd[i], {method: 'head'}).then((resp) => resp.ok && (videoLink.hd[i] = resp.url) && playerSwitcher.setVideoLink(videoLink));
    for (let i in videoLink.ld) if (videoLink.ld[i].match('ws.acgvideo.com')) fetch(videoLink.ld[i], {method: 'head'}).then((resp) => resp.ok && (videoLink.ld[i] = resp.url) && playerSwitcher.setVideoLink(videoLink));
    playerSwitcher.setVideoLink(videoLink);

    // downloaderSection code
    const clickDownLinkElementHandler = async(event) => !event.preventDefault() && await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* mySendMessage */])({
        command: 'requestForDownload',
        url: event.target.attr('href'),
        filename: event.target.attr('download'),
    });
    const createDownLinkElement = (segmentInfo, index) => {
        const downloadOptions = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__filename_sanitize__["a" /* getDownloadOptions */])(segmentInfo.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, index, videoLink.mediaDataSource.segments.length, videoInfo));
        const length = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["g" /* parseTime */])(segmentInfo.duration);
        const size = (segmentInfo.filesize / 1048576 + 0.5) >>> 0;
        const title = isNaN(size) ? (`长度: ${length}`) : (`长度: ${length} 大小: ${size} MB`);
        let bhDownLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])(`<a class="b-btn w" rel="noreferrer" id="bili_helper_down_link_${index}" download="${downloadOptions.filename}" title="${title}" href="${segmentInfo.url}">${'分段 ' + (index + 1)}</a>`);
        bhDownLink.download = downloadOptions.filename;
        bhDownLink.onclick = clickDownLinkElementHandler;
        biliHelper.mainBlock.downloaderSection.find('p').append(bhDownLink);
    };
    biliHelper.mainBlock.downloaderSection.find('p').empty();
    videoLink.mediaDataSource.segments.forEach(createDownLinkElement);

    if (videoLink.mediaDataSource.segments.length > 1) {
        let bhDownAllLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])(`<a class="b-btn">下载全部${videoLink.mediaDataSource.segments.length}个分段</a>`);
        biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
        bhDownAllLink.onclick = () => biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each((e) => e.click());
    }
    biliHelper.mainBlock.downloaderSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
    biliHelper.mainBlock.downloaderSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));
    if (videoLink.mediaDataSource.type === 'mp4') delete videoLink.mediaDataSource.segments;

    // switcherSection begin
    if (videoLink.mediaDataSource.type === 'flv') biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
    if (videoLink.hd.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
    if (videoLink.ld.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');

    // comment begin
    biliHelper.downloadFileName = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__filename_sanitize__["a" /* getDownloadOptions */])(comment.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, 1, 1, videoInfo)).filename;
    biliHelper.mainBlock.infoSection.find('p').append(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])('<span>cid: ' + cid + '</span>'));
    biliHelper.mainBlock.commentSection = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])(`<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="${comment.url}" download="${biliHelper.downloadFileName}">下载 XML 格式弹幕</a></p></div>`);
    biliHelper.mainBlock.commentSection.find('a').onclick = clickDownLinkElementHandler;
    biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
    await comment.status;
    let assData;
    const clickAssBtnHandler = (event) => {
        event.preventDefault();
        if (!assData) assData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__xml2ass__["a" /* default */])(comment.xml, {
            'title': __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, 1, 1, videoInfo),
            'ori': location.href,
            'opacity': options.opacity || 0.75,
        });
        const assBlob = new Blob([assData], {type: 'application/octet-stream'}),
            assUrl = window.URL.createObjectURL(assBlob);
        event.target.href = assUrl;
        clickDownLinkElementHandler(event);
        document.addEventListener('unload', () => window.URL.revokeObjectURL(assUrl));
    };
    let assBtn = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* $h */])(`<a class="b-btn w" download="${biliHelper.downloadFileName.replace('.xml', '.ass')}" href>下载 ASS 格式弹幕</a>`);
    assBtn.onclick = clickAssBtnHandler;
    biliHelper.mainBlock.commentSection.find('p').append(assBtn);

    // begin comment user query
    playerSwitcher.setComment(comment.comments);
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__commentQuerySection__["a" /* default */])(comment.comments, biliHelper.mainBlock.querySection.find('p'));
    const changeComments = async(url) => {
        await comment.pushUrl(url);
        playerSwitcher.setComment(comment.comments);
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__commentQuerySection__["a" /* default */])(comment.comments, biliHelper.mainBlock.querySection.find('p'));
        biliHelper.mainBlock.commentSection.find('a[download*=xml]').href = comment.url;
        if (playerSwitcher.cmManager) {
            playerSwitcher.cmManager.timeline = [];
            comment.comments.forEach((cmt) => playerSwitcher.cmManager.insert(cmt));
        }
    };
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__commentsHistorySection__["a" /* default */])(cid, biliHelper.mainBlock.historySection.find('p'), changeComments).then((event) => (event !== true) && biliHelper.mainBlock.historySection.hide());

    // video player switcher begin
    playerSwitcher[options.player]();
})();


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils__ = __webpack_require__(0);


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
const CRC32 = {bstr: crc32_bstr};
/* harmony export (immutable) */ __webpack_exports__["b"] = CRC32;


const checkCRCHash = async(input) => {
    let obj;
    try {
        obj = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* fetchretry */])(`https://biliquery.typcn.com/api/user/hash/${input}`).then((res) => res.json());
        if (obj && obj.data && obj.data[0] && obj.data[0].id) return obj.data[0].id;
    } catch (e) {
        console.warn(e);
    }
    return false;
};
/* harmony export (immutable) */ __webpack_exports__["a"] = checkCRCHash;



/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/*
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



/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safeAdd(x, y) {
	var lsw = (x & 0xFFFF) + (y & 0xFFFF)
	var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
	return (msw << 16) | (lsw & 0xFFFF)
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bitRotateLeft(num, cnt) {
	return (num << cnt) | (num >>> (32 - cnt))
}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5cmn(q, a, b, x, s, t) {
	return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
}

function md5ff(a, b, c, d, x, s, t) {
	return md5cmn((b & c) | ((~b) & d), a, b, x, s, t)
}

function md5gg(a, b, c, d, x, s, t) {
	return md5cmn((b & d) | (c & (~d)), a, b, x, s, t)
}

function md5hh(a, b, c, d, x, s, t) {
	return md5cmn(b ^ c ^ d, a, b, x, s, t)
}

function md5ii(a, b, c, d, x, s, t) {
	return md5cmn(c ^ (b | (~d)), a, b, x, s, t)
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length.
 */
function binlMD5(x, len) {
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
function binl2rstr(input) {
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
function rstr2binl(input) {
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
function rstrMD5(s) {
	return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
}

/*
 * Convert a raw string to a hex string
 */
function rstr2hex(input) {
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
function str2rstrUTF8(input) {
	return unescape(encodeURIComponent(input))
}

/*
 * Take string arguments and return either raw or hex encoded strings
 */
function rawMD5(s) {
	return rstrMD5(str2rstrUTF8(s))
}

function hexMD5(s) {
	return rstr2hex(rawMD5(s))
}

module.exports = hexMD5

/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const errorCode = ['正常', '选择的弹幕模式错误', '用户被禁止', '系统禁止', '投稿不存在', 'UP主禁止', '权限有误', '视频未审核/未发布', '禁止游客弹幕'];
const sendComment = async(avid, cid, page, commentData) => {
    commentData.cid = cid;
    const comment = Object.keys(commentData).map((key) => encodeURIComponent(key).replace(/%20/g, '+') + '=' + encodeURIComponent(commentData[key]).replace(/%20/g, '+')).join('&');
    try {
        let result = await fetch(`${location.protocol}//interface.bilibili.com/dmpost?cid=${cid}&aid=${avid}&pid=${page}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: comment,
        }).then((res) => res.text());
        result = parseInt(result);
        return result < 0 ? {
            result: false,
            error: errorCode[-result],
        } : {
            result: true,
            id: result,
        };
    } catch (e) {
        return {
            result: false,
            error: e.toString(),
        };
    }
};
/* harmony default export */ __webpack_exports__["a"] = (sendComment);


/***/ })
/******/ ]);