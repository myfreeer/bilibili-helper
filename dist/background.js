var secureAvailable = false,
    videoPlaybackHosts = ["http://*.hdslb.com/*", "https://*.hdslb.com/*", "http://*.acgvideo.com/*", "http://*/*.acgvideo.com/*", "https://*.acgvideo.com/*", "https://*/*.acgvideo.com/*"];

var bkg_page = chrome.extension.getBackgroundPage();
const storageGet = () => new Promise((resolve, reject) => chrome.storage.local.get(resolve));
let options = {
    "player": "html5", //original swf iframe bilih5 html5 html5hd html5ld
    "rel_search": "with", //off without with
    "trackingBlock": true,
    "opacity": 1,
    "prop": false,
    "scale": 1,
    "volume": 0.5,
    "replace": true
};
const refreshOptions = () => storageGet().then(obj=>Object.assign(options, obj)).then(()=>chrome.storage.local.set(options));
refreshOptions();

const trackingUrls = [
    "*://data.bilibilijj.com/free/*.txt*",
    "*://tajs.qq.com/stats*",
    "*://*.hdslb.com/images/base/loading.gif",
    "*://*.hdslb.com/message/img/infocenterIcon-*.png",
    "*://*.hdslb.com/images/v3images/img_loading.png",
    "*://*.hdslb.com/images/v2images/topicons.png",
    "*://api.bilibili.com/crossdomain.xml*",
    "*://*.hdslb.com/crossdomain.xml*",
    "*://interface.bilibili.com/serverdate.js*",
    "*://*.hdslb.com/images/base/app-box.png",
    "*://api.bilibili.com/x/elec/show*",
    "*://static.hdslb.com/images/elecrank-empty.png",
    "*://live-feed.bilibili.com/ajax/feed/count*",
    "*://comment.bilibili.com/playtag,*",
    "*://interface.bilibili.com/msg.xml*",
    "*://data.bilibili.com/crossdomain.xml*",
    "*://*.bilibili.com/index/index-icon.json*",
    "*://*.bilibili.com/widget/getSearchDefaultWords*",
    "*://*.bilibili.com/v/web/*",
    "*://*.hdslb.com/images/v2images/footpic.png",
    "*://*.hdslb.com/ad-images/wx.jpg",
    "*://*.hdslb.com/player/images/player_error.png",
    "*://data.bilibili.com/a/access.js*",
    "*://api.bilibili.com/plaza/banner*",
    "*://*.hdslb.com/vip/dist/js/vipPlugin.js*",
    "*://*.hdslb.com/ad-images/wx.gif*",
    "*://*.hdslb.com/bfs/static/anime/js/bangumi.play.js*",
    "*://s1.hdslb.com/bfs/static/anime/js/sponsor.js*",
    "*://data.bilibili.com/a/bangumi.js*",
    "*://*.up.lxdns.com/report.php*",
    "*://*.hdslb.com/js/video.min.js",
    "*://*.hdslb.com/js/bfd.js",
    "*://*.bilibili.com/rec.js",
    "*://*.hdslb.com/js/video.min.js*",
    "*://*.hdslb.com/js/bfd.js*",
    "*://data.bilibili.com/rec.js*",
    "*://data.bilibili.com/v/flashplay/h5_player_op*"
];

function getFileData(url, callback, method) {
    var m = 'GET';
    var retry = 0;
    if (method && (method == 'POST'.toLowerCase() || method == 'GET'.toLowerCase())) m = method;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(m, url, true);
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") callback(xmlhttp.responseText);
        } else if (xmlhttp.readyState == 4 && xmlhttp.status > 400) {
            if (typeof callback == "function") callback("{}");
        }
    };
    xmlhttp.onerror = function() {
        xmlhttp.abort();
        xmlhttp.open(m, url, true);
        if (retry < 3) xmlhttp.send();
        retry += 1;
    };
    xmlhttp.ontimeout = xmlhttp.onerror;
    xmlhttp.timeout = 3000;
    xmlhttp.send();
}

function postFileData(url, data, callback) {
    var encodeData = "",
        append = false;
    Object.keys(data).forEach(function(key) {
        if (!append) {
            append = true;
        } else {
            encodeData += "&";
        }
        encodeData += encodeURIComponent(key).replace(/%20/g, "+") + "=" +
            encodeURIComponent(data[key]).replace(/%20/g, "+");
    });
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") callback(xmlhttp.responseText);
        }
    };
    xmlhttp.send(encodeData);
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
        case "injectCSS":
            chrome.tabs.insertCSS(sender.tab.id, {file: "bilibili-helper.css"});
            chrome.tabs.insertCSS(sender.tab.id, {file: "colpick.css"});
            chrome.tabs.insertCSS(sender.tab.id, {file: "ABPlayer.css"}, sendResponse);
            return true;
        case "refreshOptions":
            refreshOptions().then(sendResponse);
            return true;
        case "checkComment":
            getFileData("http://www.bilibili.com/feedback/arc-" + request.avid + "-1.html", function(commentData) {
                var test = commentData.indexOf('<div class="no_more">');
                if (test >= 0) {
                    sendResponse({
                        banned: true
                    });
                } else {
                    sendResponse({
                        banned: false
                    });
                }
            });
            return true;
        case "sendComment":
            var errorCode = ["正常", "选择的弹幕模式错误", "用户被禁止", "系统禁止",
                "投稿不存在", "UP主禁止", "权限有误", "视频未审核/未发布", "禁止游客弹幕"
            ];
            request.comment.cid = request.cid;
            postFileData("http://interface.bilibili.com/dmpost?cid=" + request.cid +
                "&aid=" + request.avid + "&pid=" + request.page, request.comment,
                function(result) {
                    result = parseInt(result);
                    if (result < 0) {
                        sendResponse({
                            result: false,
                            error: errorCode[-result]
                        });
                    } else {
                        sendResponse({
                            result: true,
                            id: result
                        });
                    }
                });
            return true;
        case "requestForDownload":
            chrome.downloads.download({
                saveAs: true,
                url: request.url,
                filename: "Bilibili/" + request.filename,
                conflictAction: "prompt"
            });
            return true;

        default:
            sendResponse({
                result: "unknown"
            });
            return false;
    }
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    chrome.tabs.sendMessage(details.tabId, {
        command: "error"
    });
}, {
    urls: ["http://comment.bilibili.com/1272.xml"]
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (secureAvailable) {
        return {
            redirectUrl: "https://static-s.bilibili.com/play.swf"
        };
    } else {
        return {};
    };
}, {
    urls: ["http://static.hdslb.com/play.swf"]
}, ["blocking"]);

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (options.trackingBlock) return {
        cancel: true
    };
}, {
    urls: trackingUrls
}, ["blocking"]);

function receivedHeaderModifier(details) {
    var hasCORS = false;
    details.responseHeaders.forEach(function(v) {
        if (v.name.toLowerCase() == "access-control-allow-origin") {
            hasCORS = true;
            v.value = '*';
        }
    });
    if (!hasCORS) {
        details.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: "*"
        });
    }
    return {
        responseHeaders: details.responseHeaders
    };
}

chrome.webRequest.onHeadersReceived.addListener(receivedHeaderModifier, {
    urls: videoPlaybackHosts
}, ["responseHeaders", "blocking"]);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
    var headers = details.responseHeaders;
    if (details.statusLine.indexOf("HTTP/1.1 302") == 0 && options.replace) {
        for (var i = 0; i < headers.length; i++) {
            if (headers[i].name.toLowerCase() == "location") {
                headers.splice(i, 1, {
                    name: "Set-Cookie",
                    value: "redirectUrl=" + encodeURIComponent(headers[i].value)
                });
            }
        }
    }
    return {
        responseHeaders: headers
    };
}, {
    urls: ["http://www.bilibili.com/video/av*", "http://bangumi.bilibili.com/anime/v/*"]
}, ["responseHeaders", "blocking"]);