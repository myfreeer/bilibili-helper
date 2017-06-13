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

export const sleep = (time = 0) => new Promise((r) => setTimeout(r, time));
export const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
export const parseSafe = (text) => ('' + text).replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
export const parseTime = (timecount) => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
export const mySendMessage = (obj) => new Promise((resolve) => chrome.runtime.sendMessage(obj, resolve));
export const parseXmlSafe = (text) => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ''), 'text/xml');
export const storageSet = (data) => new Promise((resolve) => chrome.storage.local.set(data, () => resolve()));
export const storageGet = (keys) => new Promise((resolve) => chrome.storage.local.get(keys, resolve));
export const storageRemove = (keys) => new Promise((resolve) => chrome.storage.local.remove(keys, resolve));
export const storageClear = () => new Promise((resolve) => chrome.storage.local.clear(resolve));
// https://gist.github.com/myfreeer/44f23611451119869804f8c28ee1a190
export const fetchretry = (url, options) => {
    let retries = (options && options.retries) ? options.retries : 3;
    let retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = (n) => fetch(url, options).then((response) => resolve(response)).catch((error) => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};
export const _$ = (e) => document.querySelector(e);
export const $h = (html) => {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};
// http://stackoverflow.com/a/15724300/30529
export const getCookie = (name) => {
    const value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
};
// http://stackoverflow.com/a/11986374
export const findPosTop = (obj) => {
    let curtop = obj.offsetTop;
    if (obj.offsetParent) {
        while (obj = obj.offsetParent) {
            curtop += obj.offsetTop;
        }
    }
    return curtop;
};

export const unsafeEval = (string) => {
    let script = document.createElement('script');
    script.appendChild(document.createTextNode(string));
    (document.body || document.getElementsByTagName('body')[0]).appendChild(script);
    script.parentNode.removeChild(script);
};
