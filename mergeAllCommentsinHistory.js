//function parseXmlSafe by myfreeer
//https://gist.github.com/myfreeer/ad95050ab5fc22c466fcc65c6e95444e
let parseXmlSafe = text => {
    "use strict";
    text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, "");
    if (window.DOMParser) return (new window.DOMParser()).parseFromString(text, "text/xml");
    else if (ActiveXObject) {
        let activeXObject = new ActiveXObject("Microsoft.XMLDOM");
        activeXObject.async = false;
        activeXObject.loadXML(text);
        return activeXObject;
    } else throw new Error("parseXmlSafe: XML Parser Not Found.");
}

//rewrite from https://github.com/jonbern/fetch-retry
let fetchretry = (url, options) => {
    var retries = (options && options.retries) ? options.retries : 3;
    var retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
        let wrappedFetch = n => fetch(url, options).then(response => resolve(response)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
        wrappedFetch(retries);
    });
};

let downloadStringAsFile = (str, filename) => {
    if (filename && !filename.match(/\.xml$/)) filename += '.xml';
    if (!filename) console.warn('downloadStringAsFile: No filename provided.');
    let blob = new Blob([str], {
        type: "application/octet-stream"
    });
    let objectURL = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = objectURL;
    a.style.display = "none";
    document.body.appendChild(a);
    let cleanup = (element, url) => {
        if (element) element.parentNode.removeChild(element);
        if (url) window.URL.revokeObjectURL(url);
    };
    if (filename) a.download = filename;
    try {
        a.click();
        setTimeout(() => cleanup(a, blob), 2000);
    } catch (e) {
        cleanup(a, blob);
        window.navigator.msSaveOrOpenBlob(blob, filename);
    }
    return str;
};

//resolvePromiseArrayWait: https://gist.github.com/myfreeer/019ce116d241a0ec640db0f412e2c741
let resolvePromiseArrayWait = (array, myPromise, timeout = 0, retries = 0) => {
    return new Promise((resolve, reject) => {
        let resultArray = [];
        let resolver = index => setTimeout(() => myResolver(index), timeout);
        let fails = (index, e) => array[index + 1] ? console.warn('resolvePromiseArrayWait: index', index, 'failed! ', ', target:', array[index], ', error:', e, ',continue to next.', resolver(++index)) : console.warn('resolvePromiseArrayWait: index', index, 'failed! ', 'target:', array[index], ', error:', e, ', process done.', resolve(resultArray));
        let myResolver = index => myPromise(array[index]).then(result => resultArray[index] = (result)).then(e => typeof (array[++index]) === "undefined" ? resolve(resultArray) : resolver(index)).catch(e => retries-- > 0 ? resolver(index) : fails(index, e));
        myResolver(0);
    });
};

'use strict';
class CommentsInHistory {
    constructor() {
        this.xmltext = '';
        this.commentsAll = [];
        this.dbids = {};
    }
    array(obj) {
        return Array.prototype.slice.call(obj);
    }
    serialize(xmldom) {
        return (new XMLSerializer()).serializeToString(xmldom);
    }
    parseXML(text) {
        text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, "");
        return (new DOMParser()).parseFromString(text, "text/xml");
    }
    getResult() {
        return decodeURIComponent("%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>") + this.cid + "</chatid><mission>0</mission><maxlimit>" + this.commentsAll.length + "</maxlimit>\n" + this.commentsAll.join('\n') + "\n</i>";
    }
    add(string) {
        let response = this.parseXML(string);
        if (this.cid && this.cid !== this.array(response.getElementsByTagName('chatid')).reduce(e => e).textContent) console.warn('CommentsInHistory: cid not match, continue.');
        if (!this.cid) this.cid = this.array(response.getElementsByTagName('chatid')).reduce(e => e).textContent;
        let comments = response.getElementsByTagName('d');
        this.commentsAll = this.commentsAll.concat(this.array(comments).filter(e => {
            let opt = e.getAttribute('p');
            if (!opt) return true;
            opt = opt.split(',');
            let dbid = parseInt(opt[7], 10);
            if (!dbid) return true;
            if (this.dbids[dbid] !== 1) {
                this.dbids[dbid] = 1;
                return true;
            }
        }).map(this.serialize));
    }
}

//get error of cors
/* Promise mergeAllCommentsinHistory
 * Usage:
   var cid=document.body.innerHTML.match(/cid.*?(\d+)/)[1];
   mergeAllCommentsinHistory(cid).then(str=>downloadStringAsFile(str, document.title + '.' + cid + "_full.xml")) //to download all comments in history
 * mergeAllCommentsinHistory(cid).then(str=>downloadStringAsFile(str, filename)) //to download all comments in history as filename
 * mergeAllCommentsinHistory(cid) //to merge but not download, result return as promise
 * Example :mergeAllCommentsinHistory(1725101).then(res=>console.log(res))
 */
/* Batch Download (in pages like http://api.bilibili.com/view?type=json&batch=true&id=371561&page=1&appkey=)
var url = location.href;
var jsonText = document.body.innerText;
var json, myPromise;
if (url.match('api.bilibili.com/view') || url.match('biliplus.com/api/view') || url.match('kanbilibili.com/api/video/')) {
    json = JSON.parse(jsonText);
    if (url.match('kanbilibili.com/api/video/')) json = json.data;
    myPromise = e => new Promise((resolve, reject) => {
        let j = mergeAllCommentsinHistory(e.cid);
        j.then(str => downloadStringAsFile(str, e.page + '、' + e.part + '.full.xml')).then(e => resolve());//using resolve(e) here may increase memory cost.
    });
} else if (url.match('bilibilijj.com/Api/AvToCid/')) {
    json = JSON.parse(jsonText);
    myPromise = e => new Promise((resolve, reject) => {
        let j = mergeAllCommentsinHistory(e.CID);
        j.then(str => downloadStringAsFile(str, e.P + '、'+ e.Title + '.full.xml')).then(e => resolve());
    });
}
resolvePromiseArrayWait(json.list, myPromise, 1000);
 */
function mergeAllCommentsinHistory(cid) {
    if (!cid) return false;
    var startTime = performance.now();
    var rolldate = "http://comment.bilibili.com/rolldate," + cid;
    var dmroll = ['http://comment.bilibili.com/' + cid + '.xml'];
    var count = 0;
    var cmts = new CommentsInHistory();
    let checkCount = (count, array) => {
        if (count < array.length) return;
        let xmltext = cmts.getResult();
        console.log("mergeAllCommentsinHistory: took", (performance.now() - startTime), "milliseconds.");
        return xmltext;
    };
    return fetchretry(rolldate).then(res => res.json().then(json => {
        for (let i in json)
            if (json[i].timestamp) dmroll.push('http://comment.bilibili.com/dmroll,' + json[i].timestamp + ',' + cid);
        return Promise.all(dmroll.map(url => fetchretry(url).then(res => res.text()).then(res => {
            cmts.add(res);
            return checkCount(++count, dmroll);
        }).catch(e => checkCount(++count, dmroll)))).then(array => array.filter(e => e === 0 || e).reduce(e => e));
    }));
}
