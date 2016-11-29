//function parseXmlSafe by myfreeer
//https://gist.github.com/myfreeer/ad95050ab5fc22c466fcc65c6e95444e
let parseXmlSafe = text => {
    "use strict";
    text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "");
    if (window.DOMParser) return (new window.DOMParser()).parseFromString(text, "text/xml");
    else if (ActiveXObject) {
        let activeXObject = new ActiveXObject("Microsoft.XMLDOM");
        activeXObject.async = false;
        activeXObject.loadXML(text);
        return activeXObject;
    } else throw new Error("parseXmlSafe: XML Parser Not Found.");
};

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
    if (filename) a.download = filename;
    try {
        a.click();
        setTimeout(() => a.parentNode.removeChild(a), 1000);
    } catch (e) {
        a.parentNode.removeChild(a);
        window.navigator.msSaveOrOpenBlob(blob, filename);
    }
    return str;
};

//get error of cors
/* Promise mergeAllCommentsinHistory
 * Usage:
 * mergeAllCommentsinHistory(cid).then(str=>downloadStringAsFile(str, cid + "_full.xml")) to download all comments in history as cid + "_full.xml"
 * mergeAllCommentsinHistory(cid).then(str=>downloadStringAsFile(str, filename)) to download all comments in history as filename
 * mergeAllCommentsinHistory(cid) to merge but not download
 * Example :mergeAllCommentsinHistory(1725101).then(res=>console.log(res))
 * Use your callback function as callback
 */
/* Batch Download (in pages like http://api.bilibili.com/view?type=json&batch=true&id=371561&page=1&appkey=)
   var q=JSON.parse(document.body.innerText);
   q.list.map((e,index)=>setTimeout(()=>mergeAllCommentsinHistory(e.cid, ,true, (index + 1) + '、' + e.part),index*10000));
 */
function mergeAllCommentsinHistory(cid) {
    if (!cid) return false;
    var startTime = performance.now();
    var xmltext;
    var commentsAll = [];
    var rolldate = "http://comment.bilibili.com/rolldate," + cid;
    var dmroll = ['http://comment.bilibili.com/' + cid + '.xml'];
    var count = 0;
    let checkCount = (count, array) => {
        if (count < array.length) return;
        commentsAll = [...new Set(commentsAll)];
        xmltext = decodeURIComponent("%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>") + cid + "</chatid><mission>0</mission><maxlimit>" + commentsAll.length + "</maxlimit>\n" + commentsAll.join('\n') + "\n</i>";
        console.log("mergeAllCommentsinHistory: took", (performance.now() - startTime), "milliseconds.");
        return xmltext;
    };
    return fetchretry(rolldate).then(res => res.json().then(json => {
        for (let i in json)
            if (json[i].timestamp) dmroll.push('http://comment.bilibili.com/dmroll,' + json[i].timestamp + ',' + cid);
        return Promise.all(dmroll.map(url => fetchretry(url).then(res => res.text()).then(res => {
            let response = parseXmlSafe(res);
            let comments = response.getElementsByTagName('d');
            let array = x => Array.prototype.slice.call(x);
            commentsAll = commentsAll.concat(array(comments).map(e => e.outerHTML));
            return checkCount(++count, dmroll);
        }).catch(e => checkCount(++count, dmroll)))).then(array=>{let t;array.map(text => text ? t = text : null);return t});
    }));
}
