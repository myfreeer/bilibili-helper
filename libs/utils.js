const sleep = (time = 0) => new Promise(r => setTimeout(r, time));
const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
const parseSafe = text =>('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const parseTime = timecount => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
const mySendMessage = obj => new Promise((resolve, reject) => chrome.runtime.sendMessage(obj,resolve));
const parseXmlSafe = text => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ""), "text/xml");
const storageSet = data => new Promise((resolve, reject) => chrome.storage.local.set(data, resolve));
const storageGet = keys => new Promise((resolve, reject) => chrome.storage.local.get(keys, resolve));
const storageRemove = keys => new Promise((resolve, reject) => chrome.storage.local.remove(keys, resolve));
const storageClear = () => new Promise((resolve, reject) => chrome.storage.local.clear(resolve));
const fetchretry = (url, options) => {
    var retries = (options && options.retries) ? options.retries : 3;
    var retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = n => fetch(url, options).then(response => resolve(response)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};
var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) module.exports = {sleep, parseSafe, parseTime, mySendMessage, parseXmlSafe, fetchretry, storageSet, storageGet, storageRemove, storageClear};