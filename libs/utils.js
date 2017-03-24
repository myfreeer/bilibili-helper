const sleep = (time = 0) => new Promise(r => setTimeout(r, time));
const formatInt = (Source, Length) => (Source + '').padStart(Length, '0');
const parseSafe = text =>('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const parseTime = timecount => formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
const mySendMessage = obj => new Promise((resolve, reject) => chrome.runtime.sendMessage(obj,resolve));
const parseXmlSafe = text => (new window.DOMParser()).parseFromString(text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, ""), "text/xml")
var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) module.exports = {sleep, parseSafe, parseTime, mySendMessage, parseXmlSafe};