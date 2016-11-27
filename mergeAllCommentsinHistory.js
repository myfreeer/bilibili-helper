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

//get error of cors
/* Usage:
 * mergeAllCommentsinHistory(cid) to download all comments in history as cid + "_full.xml"
 * mergeAllCommentsinHistory(cid, filename) to download all comments in history as filename
 * mergeAllCommentsinHistory(cid, filename, true) to merge but not download
 * Example :mergeAllCommentsinHistory(1725101,null,1).then(array=>array.map(data=>data.then(text=>text?callback(text):null)))
 * Use your callback function as callback
 */
function mergeAllCommentsinHistory(cid, filename, nodownload) {
    if (!cid) return false;
    var startTime = performance.now();
    var xmltext;
    var commentsAll = [];
    var rolldate = "http://comment.bilibili.com/rolldate," + cid;
    var dmroll = ['http://comment.bilibili.com/' + cid + '.xml'];
    var count = 0;
    if (filename && !filename.match(/\.xml$/)) filename += '.xml';
    if (!filename) filename = cid + "_full.xml";
    let checkCount = (count, array) => {
        if (count < array.length) return;
        commentsAll = [...new Set(commentsAll)];
        xmltext = decodeURIComponent("%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>") + cid + "</chatid><mission>0</mission><maxlimit>" + commentsAll.length + "</maxlimit>\n" + commentsAll.join('\n') + "\n</i>";
        if (nodownload) {
            console.log("mergeAllCommentsinHistory: took " + (performance.now() - startTime) + " milliseconds.");
            return xmltext;
        }
        let blob = new Blob([xmltext], {
            type: "application/octet-stream"
        });
        let objectURL = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = objectURL;
        a.style.display = "none";
        document.body.appendChild(a);
        a.download = filename;
        console.log("mergeAllCommentsinHistory: took " + (performance.now() - startTime) + " milliseconds.");
        try {
            a.click();
            setTimeout(() => a.parentNode.removeChild(a), 1000);
        } catch (e) {
            a.parentNode.removeChild(a);
            window.navigator.msSaveOrOpenBlob(blob, filename);
        }
        return xmltext;
    };
    return fetch(rolldate).then(res => res.json().then(json => {
        for (let i in json)
            if (json[i].timestamp) dmroll.push('http://comment.bilibili.com/dmroll,' + json[i].timestamp + ',' + cid);
        return dmroll.map(url => fetch(url).then(res => res.text()).then(res => {
            let response = parseXmlSafe(res);
            let comments = response.getElementsByTagName('d');
            let array = x => Array.prototype.slice.call(x);
            commentsAll = commentsAll.concat(array(comments).map(e => e.outerHTML));
            return checkCount(++count, dmroll);
        }).catch(e => checkCount(++count, dmroll)));
    }));
}
