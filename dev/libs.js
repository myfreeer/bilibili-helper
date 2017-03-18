const sleep = (ms = 0)=> new Promise(r => setTimeout(r, ms));
const parseSafe=text=>('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
const parseTime=timecount=> formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
const mySendMessage=obj=>new Promise((_resolve, _reject) => chrome.runtime.sendMessage(obj,_resolve));
var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) module.exports = {sleep, parseSafe, parseTime, mySendMessage};