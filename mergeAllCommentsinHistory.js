var parseXmlSafe = function parseXmlSafe(text) {
    "use strict";
    text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "");
    if (window.DOMParser) return new window.DOMParser().parseFromString(text, "text/xml");
    else if (ActiveXObject) {
        var activeXObject = new ActiveXObject("Microsoft.XMLDOM");
        activeXObject.async = false;
        activeXObject.loadXML(text);
        return activeXObject;
    } else throw new Error("parseXmlSafe: XML Parser Not Found.");
};
var commentsAll = [];
var xmltext;
var count = 0;

//get error of cors
function mergeAllCommentsinHistory(cid) {
    if (!cid) return false;
    var rolldate = "http://comment.bilibili.com/rolldate," + cid;
    var dmroll = ['http://comment.bilibili.com/' + cid + '.xml'];
    let checkCount = (count, array) => {
        if (count < array.length) return;
        xmltext = decodeURIComponent("%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>") + cid + " < /chatid><mission>0</mission > < maxlimit > " + commentsAll.length + " < /maxlimit>" + "\n" + commentsAll.join('\n') + "</i > ";
        let blob = new Blob([xmltext], {
            type: "application/octet-stream"
        });
        let objectURL = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = objectURL;
        a.style.display = "none";
        document.body.appendChild(a);
        a.download = cid + "_full.xml";
        try {
            a.click();
            setTimeout(function() {
                a.parentNode.removeChild(a);
            }, 1000);
        } catch (e) {
            a.parentNode.removeChild(a);
            window.navigator.msSaveOrOpenBlob(blob, cid + "_full.xml");
        }
    };
    fetch(rolldate).then(res => res.json().then(json => {
        for (let i in json)
            if (json[i].timestamp) dmroll.push('http://comment.bilibili.com/dmroll,' + json[i].timestamp + ',' + cid);
            //count=dmroll.length;
        dmroll.map(url => fetch(url).then(res => res.text()).then(res => {
            let response = parseXmlSafe(res);
            let comments = response.getElementsByTagName('d');
            let array = x => Array.prototype.slice.call(x);
            array(comments).map(e => (e.outerHTML && commentsAll.indexOf(e.outerHTML) < 0) ? commentsAll.push(e.outerHTML) : null);
            checkCount(++count, dmroll);
        }).catch(e => checkCount(++count, dmroll)));
    }));
}
