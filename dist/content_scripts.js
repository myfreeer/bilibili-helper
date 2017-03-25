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
/******/ 	return __webpack_require__(__webpack_require__.s = 9);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const sleep = (time = 0) => new Promise(r => setTimeout(r, time));
/* harmony export (immutable) */ __webpack_exports__["h"] = sleep;

const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
/* unused harmony export formatInt */

const parseSafe = text =>('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
/* harmony export (immutable) */ __webpack_exports__["f"] = parseSafe;

const parseTime = timecount => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
/* harmony export (immutable) */ __webpack_exports__["e"] = parseTime;

const mySendMessage = obj => new Promise((resolve, reject) => chrome.runtime.sendMessage(obj,resolve));
/* harmony export (immutable) */ __webpack_exports__["d"] = mySendMessage;

const parseXmlSafe = text => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ""), "text/xml");
/* harmony export (immutable) */ __webpack_exports__["c"] = parseXmlSafe;

const storageSet = data => new Promise((resolve, reject) => chrome.storage.local.set(data, resolve));
/* harmony export (immutable) */ __webpack_exports__["g"] = storageSet;

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


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var lastMessageBoxLayer=20000;function MessageBox(b){this.params={evType:"over",center:!0,Overlap:!1,focusShowPos:"up",zIndex:null,animation:"fade",position:null,event:null,bound:!0,margin:5,backdrop:!1,bindInput:!1};"string"==typeof b&&(b={evType:b});if("object"==typeof b){for(var d in this.params){b.hasOwnProperty(d)&&(this.params[d]=b[d])}}}MessageBox.prototype={timer:null,msgbox:null,bindobj:null,backobj:null,incomingTimer:null,position:{},reverseMap:{up:"down",down:"up",left:"right",right:"left"},show:function(i,o,h,n,l){i=$(i);if(!1!=this.params.Overlap||"yes"!=i.attr("hasMessageBox")){i.attr("hasMessageBox","yes");"undefined"==typeof h&&(h=1000);"undefined"==typeof n&&(n="msg");"button"==h&&(l=n,n=h,h=1000);var k=h;0==h&&(k=50);var j=this;j.leftTimer=function(){"button"!=n&&(clearTimeout(j.timer),j.timer=setTimeout(function(){clearTimeout(j.timer);j.close(j)},k))};j.incomingTimer=function(){clearTimeout(j.timer)};this.bindobj=i;this.msgbox=$('<div class="m-layer m_layer"><div class="bg"><div class="content"><div class="mini"><div class="msg-text"><i class="b-icon"></i>'+o+"</div>"+("button"==n?'<div class="btnbox"><a class="b-btn ok">\u786e\u8ba4</a><a class="b-btn-cancel cancel">\u53d6\u6d88</a></div>':"")+"</div></div></div></div>").prependTo("body");this.msgbox.addClass("m-"+n);j.params.backdrop&&(j.backobj=$('<div class="m-backdrop"></div>').css({position:"fixed",top:0,left:0,right:0,bottom:0,opacity:0.6,backgroundColor:"#000",zIndex:(j.params.zIndex||lastMessageBoxLayer)-1}).appendTo("body"));"over"==this.params.evType?(i.bind("mouseleave",j.leftTimer),i.bind("mouseenter",j.incomingTimer),this.msgbox.bind("mouseenter",function(){clearTimeout(j.timer)}),this.msgbox.bind("mouseleave",j.leftTimer)):i.bind("blur",j.leftTimer);this.setPos();this.msgbox.css("z-index",j.params.zIndex||lastMessageBoxLayer++);if(this.params.bindInput&&"error"==n){if(i.is(":text")||i.is("textarea")){i.addClass("error").on("focus.m-error",this.closeErrHandler())}else{if(0<i.find(":text,textarea").length){i.addClass("error").find(":text,textarea").on("focus.m-error",this.closeErrHandler())}}}"button"==n&&(this.msgbox.find(".ok").click(function(){"undefined"!=typeof l&&!1==l(j)||j.close()}),this.msgbox.find(".cancel").click(function(){j.close()}));0!=h&&j.leftTimer();"fade"!=this.params.animation?this.msgbox.addClass(this.params.animation):this.moveIn(this.params.focusShowPos);this.bindobj.data("b-msgbox",this);return this.msgbox}},close:function(){var b=this,d=function(){b.msgbox.remove();b.params.backdrop&&b.backobj.remove();"over"==b.params.evType&&b.bindobj.off("mouseenter",b.incomingTimer);b.bindobj.off("over"==b.params.evType?"mouseleave":"blur",b.leftTimer)};this.bindobj.attr("hasMessageBox","");"fade"!=this.params.animation?this.msgbox.removeClass(this.params.animation).fadeOut(200,d):this.msgbox.fadeOut(200,d)},closeErrHandler:function(){var b=this;return function(){var a=b.bindobj.removeClass("error");b.close();a.is(":text")||a.is("textarea")?a.off("focus.m-error"):0<a.find(":text,textarea").length&&a.find(":text,textarea").off("focus.m-error")}},moveIn:function(f){var h={opacity:1},e=5,g=5;switch(f){case"up":h.top="-=5";g=0;break;case"down":h.top="+=5";e=-e;g=0;break;case"left":h.left="-=5";e=0;break;case"right":h.left="+=5";g=-g;e=0;break;default:h.top="-=5",g=0}this.msgbox.show().css({top:this.position.top+e,left:this.position.left+g,opacity:0});this.msgbox.animate(h,200)},setPos:function(){this.params.position?(this.position=this.params.position,this.resetBound()):this._pos(this.params.focusShowPos);this.msgbox.css("left",this.position.left);this.msgbox.css("top",this.position.top)},_pos:function(e,f){var d=this.bindobj;this.params.focusShowPos=e;switch(e){case"up":this.position.top=d.offset().top-this.msgbox.outerHeight()-this.params.margin;this.position.left=d.offset().left;this.params.center&&(this.position.left=this.position.left-this.msgbox.outerWidth()/2+d.outerWidth()/2);break;case"down":this.position.top=d.offset().top+d.outerHeight()+this.params.margin;this.position.left=d.offset().left;this.params.center&&(this.position.left=this.position.left-this.msgbox.outerWidth()/2+d.outerWidth()/2);break;case"left":this.position.top=d.offset().top;this.position.left=d.offset().left-this.msgbox.outerWidth()-this.params.margin;break;case"right":this.position.top=d.offset().top,this.position.left=d.offset().left+d.outerWidth()+this.params.margin}if(!this.checkBound(e)){if(!0!==f){return this._pos(this.reverseMap[e],!0)}this.setBound("down");this.setBound("left");this.position.top-=10;this.position.left+=10}this.resetBound();return this.position},resetBound:function(e){if(this.params.bound||!0===e){e=["up","down","left","right"];for(var f=0;f<e.length;f++){var d=e[f];this.checkBound(d)||this.setBound(d)}}},checkBound:function(b){switch(b){case"up":return this.position.top>=$(window).scrollTop();case"down":return this.position.top+this.msgbox.outerHeight()<=$(window).height()+$(window).scrollTop();case"left":return this.position.left>=$(window).scrollLeft();case"right":return this.position.left+this.msgbox.outerWidth()<=$(window).width()+$(window).scrollLeft();default:return !0}},setBound:function(b){switch(b){case"up":this.position.top=$(window).scrollTop();break;case"down":this.position.top=$(window).height()+$(window).scrollTop()-this.msgbox.outerHeight();break;case"left":this.position.left=$(window).scrollLeft();break;case"right":this.position.left=$(window).width()+$(window).scrollLeft()-this.msgbox.outerWidth()}}};
/* unused harmony default export */ var _unused_webpack_default_export = (MessageBox);

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var SelectModule=function(){function b(c,e){this.params={};this._isMobile=!1;if("undefined"!=typeof c&&("string"==typeof c||c instanceof $?(this.obj=$(c),this.params=e||{}):(this.params=c,this.obj=$(this.params.item)),this.obj.length)){this.obj.hasClass("b-slt")||(this.obj=this.obj.find(".b-slt"));this._active=!1;if("undefined"!=typeof this.params.onInit){this.params.onInit(this.obj)}if(0==this.obj.children().length||this.params.selectorData){this.obj=this.createMenu(this.obj)}this.list=this.obj.find(".list");this.init();d.push(this)}}var d=[];window.bindSlt=b.bind=function(a,e){return new b(a,e)};b.create=function(a){var r=$('<div class="b-slt"></div>');$("<span>").addClass("txt").appendTo(r);$("<div>").addClass("b-slt-arrow").appendTo(r);var q=$("<ul>").addClass("list").appendTo(r);a.wrapper&&r.wrap(a.wrapper);var p=a.items||[];1>=p.length&&r.hide();for(var o=0;o<p.length;o++){var n=p[o],i=$("<li></li>").text(n.name).appendTo(q);n.selected&&b.prototype._setSelect.call(this,i);if(n.attributes){for(var j in n.attributes){i.attr(j,n.attributes[j])}}}a.wrapper&&(r=r.parent());return r};b.prototype.init=function(){var f=this.obj,h=this,g=this.list.find("[selected]");0==g.length&&(g=this.list.find("li").eq(0));this._setSelect(g);f.off("mouseenter.selectMenu");f.off("mouseleave.selectMenu");f.off("click.selectMenu");f.on("click.selectMenu",function(c){h._tap(c)});this._isMobile||!1===this.params.hover||(f.on("mouseenter.selectMenu",function(c){h._mover(c)}),f.on("mouseleave.selectMenu",function(c){h._mout(c)}));this.list.find("li").off("click.selectMenu");this.list.on("click","li",function(c){c.stopPropagation();h.select(c,$(this))});f.data("select-menu",this)};b.prototype._mover=function(c){c.stopPropagation();for(var g=0;g<d.length;g++){d[g]._mout(c)}if(!this.obj.attr("disabled")&&this.list.length){var f=this;this.obj.addClass("on");this.list.show();this._active=!0;this.setPos(this.list);if(this._isMobile||!1===this.params.hover){$(document).off("click.selectMenu"),$(document).one("click.selectMenu",function(e){f._mout(e)})}}};b.prototype._mout=function(c){this.obj.removeClass("on");this.list.hide();this._active=!1;(this._isMobile||!1===this.params.hover)&&$(document).off("click.selectMenu")};b.prototype._tap=function(c){this._active?this._mout(c):this._mover(c)};b.prototype.select=function(e,f){this._mout(e);if(!f||this._change(f)){"undefined"==typeof f&&(f=this.value()),this.change(f,e)}};b.prototype.change=function(e,f){e=e||this.value();"function"==typeof this.params.onChange&&this.params.onChange.call(this,e,f)};b.prototype._change=function(c){if(c.attr("selected")||c.attr("disabled")){return !1}this._cancelSelect();this._setSelect(c);return !0};b.prototype._setSelect=function(c){c.attr("selected","selected").addClass("b-state-selected");$(".txt",this.obj).html(c.html())};b.prototype._cancelSelect=function(){$("li",this.list).removeAttr("selected").removeClass("b-state-selected")};b.prototype.value=function(f,h){if(h){var g=this.list.find("["+f+'="'+h+'"]');g.length&&this._change(g);return g}return f?this.getSelected().attr(f):this.getSelected()};b.prototype.getSelected=function(){return this.list.find('[selected="selected"]')};b.prototype.createMenu=function(f){$("<span>").addClass("txt").appendTo(f);$("<div>").addClass("b-slt-arrow").appendTo(f);var h=this.params;this.list=$("<ul>").addClass("list").appendTo(f);"undefined"!=typeof h.createList&&h.createList(this.list);if("undefined"!=typeof h.selectorData){for(var g in h.selectorData){this.add(h.selectorData[g].name,h.selectorData[g].attributes)}}return f};b.prototype.add=function(g,j){var i=$("<li>").html(g).appendTo(this.list);if("undefined"!=typeof j){for(var h in j){i.attr(h,j[h])}}return i};b.prototype.setPos=function(c){c.offset().left+c.width()-10>$(window).scrollLeft()+$(window).width()?c.css({left:"auto",right:"-1px"}):c.css({left:"-1px",right:"auto"})};b.prototype.close=function(c){null!=c&&(c.originalEvent?$(".b-slt").each(function(f,g){var e=$(g);$(".list",e).hide()}):$(".list",c).hide())};b.prototype.getList=function(){return this.obj.find(".list")};b.prototype.reset=function(){var c=this.list.children().first();$("li",this.list).removeAttr("selected").removeClass("b-state-selected");c.attr("selected","selected");$(".txt",this.obj).html(c.html());c.attr("disabled")||this.change(c)};b.prototype.disable=function(){this.obj.addClass("disabled");this.obj.off("mouseenter.selectMenu");this.obj.off("mouseleave.selectMenu");this.obj.off("click.selectMenu");this.list.find("li").off("click.selectMenu")};b.prototype.enable=function(){this.obj.removeClass("disabled");this.init()};return b}();
/* harmony default export */ __webpack_exports__["a"] = (SelectModule);

/***/ }),
/* 3 */
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
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* sleep */])(retryDelay);
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
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__utils__["h" /* sleep */])(retryDelay);
            videoInfo = await bilibiliBangumiVideoInfoProvider(epid, credentials, retries, retryDelay, n);
        } else throw e;
    }
    sessionStorage['ep_' + epid] = JSON.stringify(videoInfo);
    return videoInfo;
};
/* harmony export (immutable) */ __webpack_exports__["b"] = bilibiliBangumiVideoInfoProvider;


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__md5___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__md5__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);



// from project youtube-dl (Public Domain)
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
                if (typeof (obj[nodeName]) == "undefined") obj[nodeName] = xml2obj(item);
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
    if (!mediaDataSource.segments[0].url.match('flv')) mediaDataSource.type = 'mp4';
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
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* sleep */])(retryDelay);
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
            await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["h" /* sleep */])(retryDelay);
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
    url.flv = url._base + url._query('flv') +'&sign=' + __WEBPACK_IMPORTED_MODULE_0__md5___default()(url._query('flv') + APPSECRET);
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
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__crc32__ = __webpack_require__(10);
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
/* 6 */
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
            if (-1 == e || "" == f) {
                return ""
            }
            var g = h.indexOf(";", e); - 1 == g && (g = h.length);
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
/* 7 */
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
        pageName = $('.player-wrapper #plist > span').text();
        pageName = pageName.substr(pageName.indexOf('、') + 1);
        if (!partIdName) document.title = pageName + '_' + $('div.v-title').text() + '_' + idName + '_' + pageIdName;
        return partIdName ? pageName + '_' + $('div.v-title').text() + '_' + idName + '_' + pageIdName + '_' + partIdName : pageName + '_' + $('div.v-title').text() + '_' + idName + '_' + pageIdName;
    }
    if (!partIdName) document.title = $('div.v-title').text() + '_' + idName;
    // document.title contains other info feeling too much
    return partIdName ? $('div.v-title').text() + '_' + idName + '_' + partIdName : $('div.v-title').text() + '_' + idName;
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
        ; // remain the same, nothing
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
/* 8 */
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

var debug = config.debug ? console.log.bind(console) : function () { };

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

// 创建下载
var startDownload = function (data, filename) {
  var blob = new Blob([data], { type: 'application/octet-stream' });
  var url = window.URL.createObjectURL(blob);
  var saveas = document.createElement('a');
  saveas.href = url;
  saveas.style.display = 'none';
  document.body.appendChild(saveas);
  saveas.download = filename;
  saveas.click();
  setTimeout(function () { saveas.parentNode.removeChild(saveas); }, 1000)
  document.addEventListener('unload', function () { window.URL.revokeObjectURL(url); });
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
      return 1 - (i.r / maxr * (31/32) + f(i.p) / hc * (1/32));
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
      };
    })
    .filter(function (l) { return l; })
    .sort(function (x, y) { return x.stime - y.stime; });
};

/*
 * bilibili
 */

var parseXML = function (content, data) {
  var data = data || (new DOMParser()).parseFromString(content, 'text/xml');
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
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__utils__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__commentSenderQuery__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__bilibiliVideoProvider__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__xml2ass__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__filename_sanitize__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__cookies__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__MessageBox_min__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__SelectModule_min__ = __webpack_require__(2);
// require external libs










// shortcuts
Element.prototype.find=Element.prototype.querySelector;
Element.prototype.findAll=Element.prototype.querySelectorAll;
Element.prototype.attr=Element.prototype.getAttribute;
Element.prototype.on=Element.prototype.addEventListener;
Element.prototype.off=Element.prototype.removeEventListener;
// arrow functions binds no this nor arguments
Element.prototype.data=function(str){return this.dataset[str];};
Element.prototype.text=function(str){return str ? (this.innerText = str) : this.innerText;};
Element.prototype.empty=function(){this.innerHTML = ''; return this;};
Element.prototype.html=function(str){str ? (this.innerHTML = str) : this.innerHTML;return this;};
Element.prototype.hide=function(){this.style.display = 'none';};
Element.prototype.show=function(){this.style.display = '';};
Element.prototype.addClass=function(){return this.classList.add(...arguments);};
Element.prototype.removeClass=function(){return this.classList.remove(...arguments);};
Element.prototype.toggleClass=function(){return this.classList.toggle(...arguments);};
Element.prototype.hasClass=function(){return this.classList.contains(...arguments);};
Element.prototype.replaceClass=function(){return this.classList.replace(...arguments);};
NodeList.prototype.map = HTMLCollection.prototype.map = Array.prototype.map;
NodeList.prototype.each = HTMLCollection.prototype.each = NodeList.prototype.forEach;
NodeList.prototype.filter = HTMLCollection.prototype.filter = Array.prototype.filter;
NodeList.prototype.reduce = HTMLCollection.prototype.reduce = Array.prototype.reduce;
NodeList.prototype.reduceRight = HTMLCollection.prototype.reduceRight = Array.prototype.reduceRight;
NodeList.prototype.every = HTMLCollection.prototype.every = Array.prototype.every;
NodeList.prototype.some = HTMLCollection.prototype.some = Array.prototype.some;
const _$ = e =>document.querySelector(e);
const _$$ = e => document.querySelectorAll(e);
const $h = html => {
	let template = document.createElement('template');
	template.innerHTML = html;
	return template.content.firstChild;
};

//main func
(async function() {
	const url = location.href;
	let avid, page, epid, cid, videoInfo, videoLink, options, isBangumi, genPage;
	//preload options
	const _options = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["a" /* storageGet */])();

	//get video info
	switch(location.hostname){
		case 'www.bilibili.com':
			const _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
			if (!_avid) return console.log('cannot match avid');
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
			if (!epid) return console.log('cannot match epid');
			videoInfo = await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__bilibiliVideoInfoProvider__["b" /* bilibiliBangumiVideoInfoProvider */])(epid);
			avid = videoInfo.avid;
			page = Number(videoInfo.currentPage);
			isBangumi = true;
			break;
		default:
			return;
	}
	cid = videoInfo.list[page-1].cid;
	if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');

	// preload video links
	const _videoLink = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__bilibiliVideoProvider__["a" /* default */])(cid, avid, page);
	let comment = {};

	// preload comments
	comment.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
	comment._xml = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* fetchretry */])(comment.url).then(res=>res.text()).then(text=>__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["c" /* parseXmlSafe */])(text));
	options = await _options;

	//some ui code from original helper
	if (!_$('.b-page-body')) genPage = decodeURIComponent(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__cookies__["a" /* __GetCookie */])('redirectUrl'));
	if (_$('.b-page-body .z-msg') > 0 && _$('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage =1;
	let biliHelper = $h(isBangumi && !genPage ? "<div class=\"v1-bangumi-info-btn helper\" id=\"bilibili_helper\"><span class=\"t\">哔哩哔哩助手</span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>" : "<div class=\"block helper\" id=\"bilibili_helper\"><span class=\"t\"><div class=\"icon\"></div><div class=\"t-right\"><span class=\"t-right-top middle\">助手</span><span class=\"t-right-bottom\">扩展菜单</span></div></span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
	biliHelper.find('.t').onclick=()=>biliHelper.toggleClass('active');
	biliHelper.blockInfo = biliHelper.find('.info');
	biliHelper.mainBlock = biliHelper.find('.main');
	biliHelper.mainBlock.infoSection = $h('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
	biliHelper.mainBlock.ondblclick=e=>e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
	if (genPage && genPage.match && genPage.match('http')) {
	    biliHelper.mainBlock.redirectSection = $h('<div class="section redirect"><h3>生成页选项</h3><p><a class="b-btn w" href="' + biliHelper.redirectUrl + '">前往原始跳转页</a></p></div>');
	    biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
	}
	biliHelper.mainBlock.speedSection = $h('<div class="section speed hidden"><h3>视频播放控制</h3><p><span id="bilibili_helper_html5_video_res"></span><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a><br>视频播放速度<input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1.0" value=1.0></br>旋转视频<input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value=0></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
	biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
	biliHelper.mainBlock.speedSection.input.step = 0.1;
	biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_res');
	biliHelper.mainBlock.speedSection.mirror = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_mirror');
	biliHelper.mainBlock.speedSection.rotate = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_rotate');
	biliHelper.mainBlock.speedSection.rotate.step = 90;
	biliHelper.mainBlock.switcherSection = $h('<div class="section switcher"><h3>播放器切换</h3></div>');
	biliHelper.mainBlock.switcherSection.button = $h('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
	biliHelper.mainBlock.switcherSection.button.onclick = e =>biliHelper.switcher[e.target.attr('type')]();
	biliHelper.mainBlock.switcherSection.append(biliHelper.mainBlock.switcherSection.button);
	if (biliHelper.redirectUrl) {
	    biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
	    biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
	}
	if (localStorage.getItem('bilimac_player_type')) biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
	biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
	biliHelper.mainBlock.downloaderSection = $h('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
	biliHelper.mainBlock.querySection = $h('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);
	(isBangumi && !genPage ? _$('.v1-bangumi-info-operate .v1-app-btn') : _$('.player-wrapper .arc-toolbar')).append(biliHelper);
	console.log(await _videoLink, videoInfo);

	// process video links
	videoLink = await _videoLink;

	//downloaderSection code
	const clickDownLinkElementHandler = async(event) => !event.preventDefault() && await __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["d" /* mySendMessage */])({
	    command: 'requestForDownload',
	    url: event.target.attr('href'),
	    filename: event.target.attr('download')
	});
	const createDownLinkElement = (segmentInfo, index) => {
	    const downloadOptions = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["a" /* getDownloadOptions */])(segmentInfo.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, index, videoLink.mediaDataSource.segments.length));
	    const length = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* parseTime */])(segmentInfo.duration);
	    const size = (segmentInfo.filesize / 1048576 + 0.5) >>> 0;
	    const title = isNaN(size) ? (`长度: ${length}`) : (`长度: ${length} 大小: ${size} MB`);
	    let bhDownLink = $h(`<a class="b-btn w" rel="noreferrer" id="bili_helper_down_link_${index}" download="${downloadOptions.filename}" title="${title}" href="${segmentInfo.url}">${'分段 ' + (index + 1)}</a>`);
	    bhDownLink.download = downloadOptions.filename;
	    bhDownLink.onclick = clickDownLinkElementHandler;
	    biliHelper.mainBlock.downloaderSection.find('p').append(bhDownLink);
	};
	biliHelper.mainBlock.downloaderSection.find('p').empty();
	videoLink.mediaDataSource.segments.forEach(createDownLinkElement);

	const videoPic = videoInfo.pic || videoLink.low.img;
	if (videoLink.mediaDataSource.segments.length > 1) {
	    var bhDownAllLink = $h(`<a class="b-btn">下载全部${videoLink.mediaDataSource.segments.length}个分段</a>`);
	    biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
	    bhDownAllLink.onclick=e=> biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each(e=>e.click());
	}
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));

	// switcherSection begin
	if (videoLink.mediaDataSource.type === 'flv') biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
	if (videoLink.hd.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
	if (videoLink.ld.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');

	// comment begin
	biliHelper.downloadFileName = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["a" /* getDownloadOptions */])(comment.url, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(avid, page, videoInfo.pages || 1, 1, 1)).filename;
	biliHelper.mainBlock.infoSection.find('p').append($h('<span>cid: ' + cid + '</span>'));
	biliHelper.mainBlock.commentSection = $h(`<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="${comment.url}" download="${biliHelper.downloadFileName}">下载 XML 格式弹幕</a></p></div>`);
	biliHelper.mainBlock.commentSection.find('a').onclick = clickDownLinkElementHandler;
	biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
	comment.xml = await comment._xml;
	let assData;
	const clickAssBtnHandler = event => {
	    event.preventDefault();
	    if (!assData) assData = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__xml2ass__["a" /* default */])(comment.xml, {
	        'title': __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__filename_sanitize__["b" /* getNiceSectionFilename */])(biliHelper.avid, biliHelper.page, biliHelper.totalPage, 1, 1),
	        'ori': location.href,
	        'opacity': options.opacity || 0.75
	    });
	    const assBlob = new Blob([assData], {type: 'application/octet-stream'}),
	        assUrl = window.URL.createObjectURL(assBlob);
	    event.target.href = assUrl;
	    clickDownLinkElementHandler(event);
	    document.addEventListener('unload',  () =>window.URL.revokeObjectURL(assUrl));
	};
	let assBtn = $h(`<a class="b-btn w" download="${biliHelper.downloadFileName.replace('.xml', '.ass')}" href>下载 ASS 格式弹幕</a>`);
	assBtn.onclick = clickAssBtnHandler;
	biliHelper.mainBlock.commentSection.find('p').append(assBtn);

	// begin comment user query
	biliHelper.comments = comment.xml.getElementsByTagName('d');
	let control = $h('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><div class="b-slt"><span class="txt">请选择需要查询的弹幕…</span><div class="b-slt-arrow"></div><ul class="list"><li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li></ul></div><span></span><span class="result">选择弹幕查看发送者…</span></div>');
	control.find('.b-input').onkeyup = e => {
		const keyword = control.find('input').value,
			regex = new RegExp(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(keyword), 'gi');
		control.find('ul.list').html('<li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li>');
		if (control.find('.b-slt .txt').text() != '请选择需要查询的弹幕' && keyword.trim() != '') control.find('.b-slt .txt').html(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(control.find('.b-slt .txt').text()));
		if (keyword.trim() != '') control.find('.b-slt .txt').text(control.find('.b-slt .txt').text());
		for (let node of biliHelper.comments){
			let text = node.childNodes[0];
			if (text && node && regex.test(text.nodeValue)) {
				text = text.nodeValue;
				const commentData = node.getAttribute('p').split(','),
		                        sender = commentData[6],
		                        time = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["e" /* parseTime */])(parseInt(commentData[0]) * 1000);
		        let li = $h(`<li sender=${sender}></li>`);
		        li.sender = sender;
		        li.html('[' + time + '] ' + (keyword.trim() == '' ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(text) : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(text).replace(regex, kw =>'<span class="kw">' + kw + '</span>')));
		        control.find('ul.list').append(li);
		    }
		}
	};
	control.find('.b-input').onkeyup();
	const displayUserInfo = (mid, data) => {
	    control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(data.name) + '" data-usercard-mid="' + mid + '">' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(data.name) + '</a><div target="_blank" class="user-info-level l' + __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["f" /* parseSafe */])(data.level_info.current_level) + '"></div>');
	    let s = document.createElement('script');
	    s.appendChild(document.createTextNode('UserCard.bind($("#bilibili_helper .query .result"));'));
	    document.body.appendChild(s);
	    s.parentNode.removeChild(s);
	};
	//jQuery is required here.
	__WEBPACK_IMPORTED_MODULE_8__SelectModule_min__["a" /* default */].bind($(control.find('div.b-slt')), {
	    onChange: item => {
	        const sender = item[0].sender;
	        control.find('.result').text('查询中…');
	        if (sender.indexOf('D') == 0) return control.find('.result').text('游客弹幕');
	        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__commentSenderQuery__["a" /* default */])(sender).then(data=>displayUserInfo(data.mid,data));
	    }
	});
	biliHelper.mainBlock.querySection.find('p').empty().append(control);

	// video player switcher begin
	const restartVideo = video => !video.paused && !video.pause() && !video.play();
	const mirrorAndRotateHandler = e => {
	    if (biliHelper.mainBlock.speedSection.mirror.className === "b-btn w") {
	        biliHelper.switcher.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
	        biliHelper.mainBlock.speedSection.mirror.className = "b-btn";
	    } else {
	        biliHelper.switcher.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
	        biliHelper.mainBlock.speedSection.mirror.className = "b-btn w";
	    }
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
	        _$('#bofqi').html(biliHelper.originalPlayer);
	        if (_$('#bofqi embed').attr('width') == 950) $('#bofqi embed').attr('width', 980);
	    },
	    swf: function () {
	        this.set('swf');
	        _$('#bofqi').html('<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=' + cid + '&aid=' + avid + '"></object>');
	    },
	    iframe: function () {
	        this.set('iframe');
	        _$('#bofqi').html('<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=' + cid + '&aid=' + avid + '" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>');
	    },
	    bilih5: function () {
	        this.set('bilih5');
	        _$('#bofqi').html('<div class="player"><div id="bilibiliPlayer"></div></div>');
	        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["b" /* fetchretry */])("https://static.hdslb.com/player/js/bilibiliPlayer.min.js").then(res => res.text()).then(text => {
	            var script = document.createElement('script');
	            script.appendChild(document.createTextNode(text + ";var player = new bilibiliPlayer({aid: " + avid + ",cid: " + cid + ",autoplay: false,as_wide: false,player_type: 0,pre_ad: 0,lastplaytime: null,enable_ssl: 1,extra_params: null,p: " + page + "})"));
	            document.getElementsByTagName('head')[0].appendChild(script);
	        });
	        biliHelper.switcher.interval = setInterval(function () {
	            try {
	                var bilibilivideo = document.getElementsByClassName('bilibili-player-video')[0].firstChild;
	                if (bilibilivideo.tagName == "VIDEO") {
	                    this.bind(bilibilivideo);
	                    clearInterval(biliHelper.switcher.interval);
	                }
	            } catch (e) {}
	        }, 500);
	    },
	    html5: function (type) {
	        var html5VideoUrl;
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
	        }
	        _$('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
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
	        abp.playerUnit.addEventListener("wide", () => $("#bofqi").addClass("wide"));
	        abp.playerUnit.addEventListener("normal", () => $("#bofqi").removeClass("wide"));
	        abp.playerUnit.addEventListener("sendcomment", function (e) {
	            const commentId = e.detail.id,
	                commentData = e.detail;
	            delete e.detail.id;
	            chrome.runtime.sendMessage({
	                command: "sendComment",
	                avid: avid,
	                cid: cid,
	                page: page,
	                comment: commentData
	            }, function (response) {
	                response.tmp_id = commentId;
	                abp.commentCallback(response);
	            });
	        });
	        abp.playerUnit.addEventListener("saveconfig",  e =>e.detail && Object.assign(options, e.detail) && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__utils__["g" /* storageSet */])(options));
	        this.bind(abp.video);
	        if (type && type.match(/hd|ld/)) return abp;
	        this.flvPlayer = flvjs.createPlayer(videoLink.mediaDataSource);
	        biliHelper.switcher.interval = setInterval(function () {
	            if (abp.commentObjArray && abp.commentObjArray.length > 0 && biliHelper.switcher.flvPlayer) {
	                clearInterval(biliHelper.switcher.interval);
	                biliHelper.switcher.flvPlayer.attachMediaElement(abp.video);
	                biliHelper.switcher.flvPlayer.load();
	                biliHelper.switcher.flvPlayer.on(flvjs.Events.ERROR, e => console.warn(e, 'Switch back to HTML5 HD.', biliHelper.switcher.html5hd()));
	                biliHelper.switcher.flvPlayer.on(flvjs.Events.MEDIA_INFO, e => console.log('分辨率: ' + e.width + "x" + e.height + ', FPS: ' + e.fps, '视频码率: ' + Math.round(e.videoDataRate * 100) / 100, '音频码率: ' + Math.round(e.audioDataRate * 100) / 100));
	            }
	        }, 1000);
	        var lastTime;
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
	        var abp = biliHelper.switcher.html5('html5hd');
	        abp.video.querySelector('source').on('error', e => console.warn(e, 'Switch back to HTML5 LD.', biliHelper.switcher.html5ld()));
	    },
	    html5ld: function () {
	        this.set('html5ld');
	        var abp = biliHelper.switcher.html5('html5ld');
	    },
	    bilimac: function () {
	        // this need jQuery
	        this.set('bilimac');
	        $('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
	        $('#bofqi').find('#player_placeholder').css({
	            background: 'url(' + videoPic + ') 50% 50% / cover no-repeat',
	            '-webkit-filter': 'blur(20px)',
	            overflow: 'hidden',
	            visibility: 'visible'
	        });
	        $.post("http://localhost:23330/rpc", {
	            action: 'playVideoByCID',
	            data: cid + '|' + window.location.href + '|' + document.title + '|' + 1
	        }, function () {
	            $('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载');
	        }).fail(function () {
	            $('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :(');
	        });
	    }
	};
	biliHelper.switcher.html5();
})();

/***/ }),
/* 10 */
/***/ (function(module, exports) {

(function (root) {
    'use strict';
    var crctable = function () {
        var c = 0,
            table = typeof Int32Array !== 'undefined' ? new Int32Array(256) : new Array(256);
        for (var n = 0; n != 256; ++n) {
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
        if (typeof input != 'string') input = "" + input;
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
        if (typeof input != 'string') input = "" + input;
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
            if (crcIndex[_i3] == t) return _i3;

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
            if (lastindex == index[3]) {
                deepCheckData = deepCheck(i, index);
                if (deepCheckData[0]) break;
            }
        }
        if (i == 100000) return -1;
        return i + '' + deepCheckData[1];
    };

    root.CRC32 = CRC32;
    root.checkCRCHash = checkCRCHash;
    if (typeof module == 'object' && module.exports) module.exports = {CRC32, checkCRCHash};
})(this);

/***/ }),
/* 11 */
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

;(function ($) {
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