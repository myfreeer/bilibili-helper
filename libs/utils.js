Element.prototype.find = Element.prototype.querySelector;
Element.prototype.findAll = Element.prototype.querySelectorAll;
Element.prototype.attr = Element.prototype.getAttribute;
Element.prototype.on = Element.prototype.addEventListener;
Element.prototype.off = Element.prototype.removeEventListener;
// arrow functions binds no this nor arguments
Element.prototype.data = function(str){ return this.dataset[str]; };
Element.prototype.text = function(str){ return str ? (this.innerText = str) : this.innerText; };
Element.prototype.empty = function(){ this.innerHTML = ''; return this; };
Element.prototype.html = function(str){ return str ? (this.innerHTML = str) && this : this.innerHTML; };
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
export const sleep = (time = 0) => new Promise(r => setTimeout(r, time));
export const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
export const parseSafe = text => ('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
export const parseTime = timecount => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
export const mySendMessage = obj => new Promise((resolve, reject) => chrome.runtime.sendMessage(obj,resolve));
export const parseXmlSafe = text => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ""), "text/xml");
export const storageSet = data => new Promise((resolve, reject) => chrome.storage.local.set(data, () => resolve()));
export const storageGet = keys => new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve));
export const storageRemove = keys => new Promise((resolve, reject) => chrome.storage.local.remove(keys, resolve));
export const storageClear = () => new Promise((resolve, reject) => chrome.storage.local.clear(resolve));
//https://gist.github.com/myfreeer/44f23611451119869804f8c28ee1a190
export const fetchretry = (url, options) => {
    var retries = (options && options.retries) ? options.retries : 3;
    var retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = n => fetch(url, options).then(response => resolve(response)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};
export const _$ = e => document.querySelector(e);
export const $h = html => {
    let template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};
//http://stackoverflow.com/a/15724300/30529
export const getCookie = name => {
  const value = "; " + document.cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}
//http://stackoverflow.com/a/11986374
export const findPosTop = obj => {
    let curtop = obj.offsetTop;
    if (obj.offsetParent) {
        while (obj = obj.offsetParent) {
            curtop += obj.offsetTop;
        }
    }
    return curtop;
};

export const unsafeEval = string => {
	let script = document.createElement('script');
	script.appendChild(document.createTextNode(string));
	(document.body || document.getElementsByTagName('body')[0]).appendChild(script);
	script.parentNode.removeChild(script);
};