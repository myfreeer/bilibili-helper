var notification = false,
    notificationAvid = {},
    playerTabs = {},
    cidHackType = {},
    viCache = {},
    locale = 0,
    localeAcquired = false,
    localeTimeout = null,
    secureAvailable = false,
    updateNotified = false,
    videoPlaybackHosts = ["http://*.hdslb.com/*", "https://*.hdslb.com/*", "http://*.acgvideo.com/*", "http://*/*.acgvideo.com/*", "https://*.acgvideo.com/*", "https://*/*.acgvideo.com/*"],
    Live = {};
var bkg_page = chrome.extension.getBackgroundPage();

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
        case "getMyInfo":
            getFileData("http://api.bilibili.com/myinfo", function(myinfo) {
                myinfo = JSON.parse(myinfo);
                if (typeof myinfo.code == undefined) myinfo.code = 200;
                sendResponse({
                    code: myinfo.code || 200,
                    myinfo: myinfo
                });
            });
            return true;
        case "searchVideo":
            var keyword = request.keyword;
            getFileData("http://api.bilibili.com/search?type=json&appkey=8e9fc618fbd41e28&keyword=" + encodeURIComponent(keyword) + "&page=1&order=ranklevel", function(searchResult) {
                searchResult = JSON.parse(searchResult);
                if (searchResult.code == 0) {
                    sendResponse({
                        status: "ok",
                        result: searchResult.result[0]
                    });
                } else {
                    sendResponse({
                        status: "error",
                        code: searchResult.code,
                        error: searchResult.error
                    });
                }
            });
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
        case "savePlayerConfig":
            sendResponse({
               // result: setOption("playerConfig", JSON.stringify(request.config))
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
    return {
        cancel: true
    };
}, {
    urls: ["http://tajs.qq.com/stats*"]
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
    if (details.statusLine.indexOf("HTTP/1.1 302") == 0 && getOption("replace") == "on") {
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