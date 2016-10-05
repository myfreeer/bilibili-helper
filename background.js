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
    videoPlaybackHosts = ["http://*.hdslb.com/*", "http://*.acgvideo.com/*"],
    Live = {};
bangumi = false;
var bkg_page = chrome.extension.getBackgroundPage();

//https://www.blackglory.me/bilibili-video-source-get/
var appkey = '85eb6835b0a1034e';
var appsec = '2ad42749773c441109bdc0191257a664';
//https://github.com/soimort/you-get/blob/develop/src/you_get/extractors/bilibili.py
var SECRETKEY_MINILOADER = '1c15888dc316e05a15fdd0a02ed6584f';
Live.set = function (n, k, v) {
    if (!window.localStorage || !n) return;
    var storage = window.localStorage;
    if (!storage[n]) storage[n] = JSON.stringify({});
    var l = JSON.parse(storage[n]);
    if (v == undefined) {
        storage[n] = typeof k == 'string' ? k.trim() : JSON.stringify(k);
    } else {
        l[k] = typeof v == 'string' ? v.trim() : JSON.stringify(v);
        storage[n] = JSON.stringify(l);
    }
};

Live.get = function (n, k, v) {
    if (!window.localStorage || !n) return;

    if (!window.localStorage[n]) {
        var temp = (v == undefined ? {} : v);
        if (k != undefined && v != undefined) temp[k] = v;
        window.localStorage[n] = JSON.stringify(temp);
    }
    var l = JSON.parse(window.localStorage[n]);
    if (k == undefined) return l;
    if (l[k] == 'true' || l[k] == 'false') l[k] = JSON.parse(l[k]);
    return l[k];
};

Live.del = function (n, k) {
    if (!window.localStorage || n == undefined || window.localStorage[n] == undefined) return;
    if (k == undefined) {
        window.localStorage.removeItem(n);
        return;
    }
    var l = JSON.parse(window.localStorage[n]);
    delete l[k];
    window.localStorage[n] = JSON.stringify(l);
};

Live.notisesIdList = {};
Live.favouritesIdList = Live.get('favouritesIdList', undefined, []);
Live.favouritesList = Live.get('favouritesList', undefined, {});

URL.prototype.__defineGetter__('query', function () {
    var parsed = this.search.substr(1).split('&');
    var parsedObj = {};
    parsed.forEach(function (elem, iter, arr) {
        var vals = arr[iter].split('=');
        parsedObj[vals[0]] = vals[1];
    });
    return parsedObj;
});

var randomIP = function (fakeip) {
    var ip_addr = '220.181.111.';
    if (fakeip == 2) ip_addr = '59.152.193.';
    ip_addr += Math.floor(Math.random() * 254 + 1);
    return ip_addr;
}

function getFileData(url, callback, method) {
    var m = 'GET';
    if (method && (method == 'POST'.toLowerCase() || method == 'GET'.toLowerCase())) m = method;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(m, url, true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") callback(xmlhttp.responseText);
        } else if (xmlhttp.readyState == 4 && xmlhttp.status > 400) {
            if (typeof callback == "function") callback("{}");
        }
    }
    xmlhttp.send();
}

// http://stackoverflow.com/questions/6832596/how-to-compare-software-version-number-using-js-only-number/6832706#6832706

function compareVersion(a, b) {
    if (a === b) {
        return 0;
    }

    var a_components = a.split(".");
    var b_components = b.split(".");

    var len = Math.min(a_components.length, b_components.length);

    // loop while the components are equal
    for (var i = 0; i < len; i++) {
        // A bigger than B
        if (parseInt(a_components[i]) > parseInt(b_components[i])) {
            return 1;
        }

        // B bigger than A
        if (parseInt(a_components[i]) < parseInt(b_components[i])) {
            return -1;
        }
    }

    // If one's a prefix of the other, the longer one is greater.
    if (a_components.length > b_components.length) {
        return 1;
    }

    if (a_components.length < b_components.length) {
        return -1;
    }

    // Otherwise they are the same.
    return 0;
}

function postFileData(url, data, callback) {
    var encodeData = "",
        append = false;
    Object.keys(data).forEach(function (key) {
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
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (typeof callback == "function") callback(xmlhttp.responseText);
        }
    }
    xmlhttp.send(encodeData);
}

function getUrlVars(url) {
    var vars = [],
        hash;
    var hashes = url.slice(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function searchBilibili(info) {
    chrome.tabs.create({
        url: "http://www.bilibili.com/search?keyword=" + info.selectionText
    });
}

function notifyAllTabs(message) {
    chrome.windows.getAll({
        populate: true
    }, function (wins) {
        wins.forEach(function (win) {
            win.tabs.forEach(function (tab) {
                chrome.tabs.sendMessage(tab.id, message);
            });
        });
    });
}

function updateAll() {
    notifyAllTabs({
        command: "update"
    });
}

function enableAll() {
    setOption("enabled", true);
    updateAll();
}

function disableAll() {
    setOption("enabled", false);
    updateAll();
}

function checkDynamic() {
    if (getOption("dynamic") == "on") {
        getFileData("http://api.bilibili.com/x/feed/unread/count?type=0", function (data) {
            var dynamic = JSON.parse(data);
            if (typeof dynamic === "object" && dynamic.code == 0 && typeof dynamic.data === "object" &&
                typeof dynamic.data.all === "number") {
                if (dynamic.data.all > 0) {
                    setOption("updates", dynamic.data.all);
                    chrome.browserAction.setBadgeText({
                        text: getOption("updates")
                    });
                    getFileData("http://api.bilibili.com/x/feed/pull?ps=1&type=0", function (data) {
                        var feed = JSON.parse(data);
                        if (typeof feed === "object" && feed.code == 0 && typeof feed.data === "object" &&
                            typeof feed.data.feeds === "object" && feed.data.feeds.length > 0) {
                            var content = feed.data.feeds[0];
                            if (content.ctime != parseInt(getOption("lastDyn"))) {
                                if (notification) chrome.notifications.clear("bh-" + notification, function () {});
                                notification = content.ctime;
                                var message = chrome.i18n.getMessage('followingUpdateMessage').replace('%n', dynamic.data.all).replace('%uploader', content.source.uname).replace('%title', content.addition.title),
                                    icon = content.addition.pic ? content.addition.pic : "imgs/icon-256.png";
                                notificationAvid["bh-" + notification] = content.addition.aid;
                                chrome.notifications.create("bh-" + notification, {
                                    type: "basic",
                                    iconUrl: icon,
                                    title: chrome.i18n.getMessage('noticeficationTitle'),
                                    message: message,
                                    isClickable: false,
                                    buttons: [{
                                        title: chrome.i18n.getMessage('notificationWatch')
                                    }, {
                                        title: chrome.i18n.getMessage('notificationShowAll')
                                    }]
                                }, function () {});
                                setOption("lastDyn", content.ctime);
                            }
                        }
                    });
                } else {
                    setOption("updates", 0);
                    chrome.browserAction.setBadgeText({
                        text: ""
                    });
                }
            }
        });
    }
}

function resolvePlaybackLink(avPlaybackLink, callback) {
    if (!avPlaybackLink || !avPlaybackLink.durl || !avPlaybackLink.durl[0] || !avPlaybackLink.durl[0].url) {
        if (typeof callback == "function") callback(avPlaybackLink);
        return false;
    }
    if (typeof avPlaybackLink.durl[0].backup_url == 'object' &&
    avPlaybackLink.durl[0].backup_url.length && avPlaybackLink.durl[0].url.indexOf('hd.mp4') < 0) {
      avPlaybackLink.durl[0].backup_url.forEach(function(url) {
        if (url.indexOf('hd.mp4') > -1) {
          avPlaybackLink.durl[0].url = url;
        }
      })
    }
    var xmlhttp = new XMLHttpRequest(),
        xmlChange = function () {
            if (xmlhttp.readyState == 2) {
                if (!retry && xmlhttp.status !== 200) {
                    retry = true;
                    xmlhttp.abort();
                    xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("GET", avPlaybackLink.durl[0].url, true);
                    xmlhttp.onreadystatechange = xmlChange;
                    xmlhttp.send();
                }
                var url = xmlhttp.responseURL || avPlaybackLink.durl[0].url;
                var videoHost = new URL(url).origin + '/*';
                if (videoPlaybackHosts.indexOf(videoHost) < 0) {
                    videoPlaybackHosts.push(videoHost);
                    resetVideoHostList();
                }
                avPlaybackLink.durl[0].url = url;
                if (typeof callback == "function") callback(avPlaybackLink);
                xmlhttp.abort();
            }
        },
        retry = false;
    xmlhttp.open("HEAD", avPlaybackLink.durl[0].url, true);
    xmlhttp.onreadystatechange = xmlChange;
    xmlhttp.ontimeout = xmlChange;
    xmlhttp.send();
}

function getVideoInfo(avid, page, isbangumi, callback) {

    page = parseInt(page);
    var currTime = parseInt(new Date().getTime() / 1000);
    if (isNaN(page) || page < 1) page = 1;
    if (typeof viCache[avid + '-' + page] != "undefined" && currTime - viCache[avid + '-' + page]['ts'] <= 3600) {
        callback(viCache[avid + '-' + page]);
        return true;
    }
    bangumi = isbangumi;
    resetVideoHostList();
    if (isbangumi) {
        getFileData("http://bangumi.bilibili.com/web_api/episode/get_source?episode_id=" + avid, function (result) {
            result = JSON.parse(result)['result'];
            avid = result.aid;
            getFileData("http://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=" + page + "&batch=true", function (avInfo) {
                avInfo = JSON.parse(avInfo);
                if (typeof avInfo.code != "undefined" && avInfo.code == -503) {
                    setTimeout(function () {
                        getVideoInfo(avid, page, isbangumi, callback);
                    }, 1000);
                } else {
                    if (typeof avInfo.list == "object") {
                        avInfo.pages = avInfo.list.length;
                        for (var i = 0; i < avInfo.pages; i++) {
                            if (avInfo.list[i].page == page) {
                                avInfo.cid = avInfo.list[i].cid;
                                break;
                            }
                        }
                    }
                    if (typeof avInfo.cid == "number") {
                        viCache[avid + '-' + page] = {
                            mid: avInfo.mid,
                            tid: avInfo.tid,
                            cid: avInfo.cid,
                            pic: avInfo.pic,
                            pages: avInfo.pages,
                            title: avInfo.title,
                            list: avInfo.list,
                            sp_title: avInfo.sp_title,
                            spid: avInfo.spid,
                            season_id: avInfo.season_id,
                            created_at: avInfo.created_at,
                            description: avInfo.description,
                            tag: avInfo.tag,
                            ts: currTime,
                            bangumi: false
                        };
                        if (typeof avInfo.bangumi == "object") {
                            getFileData("http://api.bilibili.cn/sp?spid=" + avInfo.spid, function (spInfo) {
                                spInfo = JSON.parse(spInfo);
                                if (spInfo.isbangumi == 1) {
                                    viCache[avid + '-' + page].bangumi = {
                                        cover: spInfo.cover,
                                        desc: spInfo.description
                                    }
                                }
                                callback(viCache[avid + '-' + page]);
                            });
                        } else callback(viCache[avid + '-' + page]);
                    } else {
                        callback(avInfo);
                    }
                }
            });
        });
    } else
        getFileData("http://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=" + page + "&batch=true", function (avInfo) {
            avInfo = JSON.parse(avInfo);
            if (typeof avInfo.code != "undefined" && avInfo.code == -503) {
                setTimeout(function () {
                    getVideoInfo(avid, page, isbangumi, callback);
                }, 1000);
            } else {
                if (typeof avInfo.list == "object") {
                    avInfo.pages = avInfo.list.length;
                    for (var i = 0; i < avInfo.pages; i++) {
                        if (avInfo.list[i].page == page) {
                            avInfo.cid = avInfo.list[i].cid;
                            break;
                        }
                    }
                }
                if (typeof avInfo.cid == "number") {
                    viCache[avid + '-' + page] = {
                        mid: avInfo.mid,
                        tid: avInfo.tid,
                        cid: avInfo.cid,
                        pic: avInfo.pic,
                        pages: avInfo.pages,
                        title: avInfo.title,
                        list: avInfo.list,
                        sp_title: avInfo.sp_title,
                        spid: avInfo.spid,
                        season_id: avInfo.season_id,
                        created_at: avInfo.created_at,
                        description: avInfo.description,
                        tag: avInfo.tag,
                        ts: currTime,
                        bangumi: false
                    };
                    if (typeof avInfo.bangumi == "object") {
                        getFileData("http://api.bilibili.cn/sp?spid=" + avInfo.spid, function (spInfo) {
                            spInfo = JSON.parse(spInfo);
                            if (spInfo.isbangumi == 1) {
                                viCache[avid + '-' + page].bangumi = {
                                    cover: spInfo.cover,
                                    desc: spInfo.description
                                }
                            }
                            callback(viCache[avid + '-' + page]);
                        });
                    } else callback(viCache[avid + '-' + page]);
                } else {
                    callback(avInfo);
                }
            }
        });
    return true;
}

function checkSecurePlayer() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("HEAD", "https://static-s.bilibili.com/play.swf", true);
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            secureAvailable = xmlhttp.getResponseHeader('Content-Type') == 'application/x-shockwave-flash';
        }
    }
    xmlhttp.send();
}

Live.treasure = {};
Live.watcherRoom = {};
Live.tvs = {};

function setTreasure(data) {
    if (Object.prototype.toString.call(data) === '[object Object]') {
        for (var index in data) {
            Live.treasure[index] = data[index];
        }
    }
}

function setWatcherRoom(data) {
    if (Object.prototype.toString.call(data) === '[object Object]') {
        for (var index in data) {
            Live.watcherRoom[index] = data[index];
        }
    }
}

function setFavourite(upInfo) {
    if (Live.favouritesIdList.indexOf(upInfo.roomId) == -1) {
        Live.favouritesIdList.push(upInfo.roomId);
        Live.favouritesList[upInfo.roomId] = upInfo;
        Live.set('favouritesIdList', Live.favouritesIdList);
        Live.set('favouritesList', Live.favouritesList);
        return true;
    }
    return false;
}

function setNotFavourite(id) {
    var index = Live.favouritesIdList.indexOf(id)
    if (index != -1) {
        Live.favouritesIdList.splice(index, 1);
        delete Live.favouritesList[id];
        Live.set('favouritesIdList', Live.favouritesIdList);
        Live.set('favouritesList', Live.favouritesList);
        return true;
    }
    return false;
}
chrome.runtime.onConnect.addListener(function (port) {Live.treasure.port=port});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.command) {
        case "init":
            sendResponse({
                replace: getOption("replace"),
                html5: getOption("html5"),
                version: version,
                playerConfig: JSON.parse(getOption("playerConfig"))
            });
            return true;
        case "cidHack":
            if (isNaN(request.cid)) return false;
            playerTabs[sender.tab.id] = request.cid;
            cidHackType[request.cid] = request.type;
            sendResponse();
            return true;
        case "getOption":
            sendResponse({
                value: getOption(request.key)
            });
            return true;
        case "setOption":
            setOption(request.key, request.value);
            sendResponse({
                value: getOption(request.key)
            });
            return true;
        case "getTreasure":
            sendResponse({
                data: Live.treasure
            });
            return true;
        case "setTreasure":
            setTreasure(request.data);
            sendResponse({
                data: Live.treasure
            });
            return true;
        case "setCurrentTreasure":
            if (request.data.time_end != undefined && request.data.time_end != Live.treasure.time_end && Live.treasure.port) {
                setTreasure(request.data);
                Live.treasure.port.postMessage({
                    command: "updateCurrentTreasure",
                    data: {
                        minute: request.data.minute,
                        silver: request.data.silver,
                        time_end: request.data.time_end,
                        time_start: request.data.time_start
                    }
                });
            }
            return true;
        case "getCurrentTreasure":
            sendResponse({
                data: {
                    minute: Live.treasure.minute,
                    silver: Live.treasure.silver,
                    time_end: Live.treasure.time_end,
                    time_start: Live.treasure.time_start
                }
            });
            return true;
        case "delTreasure":
            sendResponse({
                data: Live.treasure = {}
            });
            return true;
        case "getWatcherRoom":
            sendResponse({
                data: Live.watcherRoom
            });
            return true;
        case "setWatcherRoom":
            setWatcherRoom(request.data);
            sendResponse({
                data: Live.watcherRoom
            });
            return true;
        case "delWatcherRoom":
            sendResponse({
                data: Live.watcherRoom = {}
            });
            return true;
        case "setFavourite":
            sendResponse({
                data: setFavourite(request.upInfo)
            });
            return true;
        case "setNotFavourite":
            sendResponse({
                data: setNotFavourite(request.id)
            });
            return true;
        case "getFavourite":
            sendResponse({
                data: Live.get('favouritesIdList')
            });
            return true;
        case "enableAll":
            enableAll();
            sendResponse({
                result: "ok"
            });
            return true;
        case "disableAll":
            disableAll();
            sendResponse({
                result: "ok"
            });
            return true;
        case "getCSS":
            if (getOption("enabled") == "true" || getOption("ad") != "keep") sendResponse({
                result: "ok",
                css: getCSS(request.url)
            });
            else sendResponse({
                result: "disabled"
            });
            return true;
        case "getVideoInfo":
            getVideoInfo(request.avid, request.pg, request.isBangumi, function (avInfo) {
                sendResponse({
                    videoInfo: avInfo
                });
            });
            return true;
        case "getDownloadLink":
            var url = {
                download: getOption("dlquality") == 'flv' ? "http://interface.bilibili.com/playurl?&cid=" + request.cid + "&from=miniplay&otype=json&player=1&sign=" + md5("cid=" + request.cid + "&from=miniplay&otype=json&player=1" + SECRETKEY_MINILOADER) : "http://interface.bilibili.com/playurl?platform=bilihelper&otype=json&appkey=" + appkey + "&cid=" + request.cid + "&type=" + getOption("dlquality") + "&sign=" + md5("platform=bilihelper&otype=json&appkey=" + appkey + "&cid=" + request.cid + "&type=" + getOption("dlquality") + appsec),
                playback: "http://interface.bilibili.com/playurl?platform=bilihelper&otype=json&appkey=" + appkey + "&cid=" + request.cid + "&quality=2&type=mp4" + "&sign=" + md5("platform=bilihelper&otype=json&appkey=" + appkey + "&cid=" + request.cid + "&quality=2&type=mp4" +  appsec)
            };
            if (request.cidHack && request.cidHack != locale) {
                cidHackType[request.cid] = request.cidHack;
            }
            getFileData(url["download"], function (avDownloadLink) {
                avDownloadLink = JSON.parse(avDownloadLink);
                if (getOption("dlquality") == 'mp4') {
                    if (avDownloadLink)
                        resolvePlaybackLink(avDownloadLink, function (avRealPlaybackLink) {
                            sendResponse({
                                download: avDownloadLink,
                                playback: avRealPlaybackLink,
                                dlquality: getOption("dlquality"),
                                rel_search: getOption("rel_search")
                            });
                        })
                } else {
                    getFileData(url["playback"], function (avPlaybackLink) {
                        avPlaybackLink = JSON.parse(avPlaybackLink);
                        resolvePlaybackLink(avPlaybackLink, function (avRealPlaybackLink) {
                            sendResponse({
                                download: avDownloadLink,
                                playback: avRealPlaybackLink,
                                dlquality: getOption("dlquality"),
                                rel_search: getOption("rel_search")
                            });
                        })
                    });
                }
            });
            return true;
        case "getMyInfo":
            getFileData("http://api.bilibili.com/myinfo", function (myinfo) {
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
            getFileData("http://api.bilibili.com/search?type=json&appkey=8e9fc618fbd41e28&keyword=" + encodeURIComponent(keyword) + "&page=1&order=ranklevel", function (searchResult) {
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
            getFileData("http://www.bilibili.com/feedback/arc-" + request.avid + "-1.html", function (commentData) {
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
                result: setOption("playerConfig", JSON.stringify(request.config))
            });
            return true;
        case "sendComment":
            var errorCode = ["正常", "选择的弹幕模式错误", "用户被禁止", "系统禁止",
                "投稿不存在", "UP主禁止", "权限有误", "视频未审核/未发布", "禁止游客弹幕"
            ];
            request.comment.cid = request.cid;
            postFileData("http://interface.bilibili.com/dmpost?cid=" + request.cid +
                "&aid=" + request.avid + "&pid=" + request.page, request.comment,
                function (result) {
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
         case 'getCommentFilter':
             sendResponse(bkg_page.getOption('danmaku_filter'));
             return true;
        case "getTVReward":
            var rewardStr = '',
                lost = "很遗憾，此次您没有中奖";
            var data = request.data;
            if (data.rewardId == 1) {
                rewardStr += "大号小电视" + data.rewardNum + "个";
            } else if (data.rewardId == 2) {
                rewardStr += "蓝白胖次道具" + data.rewardNum + "个";
            } else if (data.rewardId == 3) {
                rewardStr += "B坷垃" + data.rewardNum + "个";
            } else if (data.rewardId == 4) {
                rewardStr += "喵娘" + data.rewardNum + "个";
            } else if (data.rewardId == 5) {
                rewardStr += "便当" + data.rewardNum + "个";
            } else if (data.rewardId == 6) {
                rewardStr += "银瓜子" + data.rewardNum + "个";
            } else if (data.rewardId == 7) {
                rewardStr += "辣条" + data.rewardNum + "个";
            } else {
                rewardStr += lost;
            }
            if (data.rewardNum > 0) {
                if (data.rewardId == 1 || data.isWin)
                    chrome.notifications.create('getTV', {
                        type: 'basic',
                        iconUrl: 'http://static.hdslb.com/live-static/live-room/images/gift-section/gift-25.png',
                        title: '小电视抽奖结果',
                        message: '恭喜你抽到了小电视，请尽快前往填写收货地址，不填视为放弃',
                        isClickable: false,
                        buttons: [{
                            title: chrome.i18n.getMessage('notificationGetTv')
                        }]
                    }, function (id) {
                        setTimeout(function () {
                            chrome.notifications.clear(id);
                        }, 10000);
                    });
                else chrome.notifications.create('getTV', {
                    type: 'basic',
                    iconUrl: 'http://static.hdslb.com/live-static/live-room/images/gift-section/gift-25.png',
                    title: '小电视抽奖结果',
                    isClickable: false,
                    message: '在直播间:' + data.roomId + ' 抽到' + rewardStr
                }, function (id) {
                    setTimeout(function () {
                        chrome.notifications.clear(id);
                    }, 10000);
                });
            } else chrome.notifications.create('getTV', {
                type: 'basic',
                iconUrl: 'http://static.hdslb.com/live-static/live-room/images/gift-section/gift-25.png',
                title: '直播间:' + data.roomId,
                message: rewardStr,
                isClickable: false
            }, function (id) {
                setTimeout(function () {
                    chrome.notifications.clear(id);
                }, 10000);
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

if (localStorage.getItem("enabled") == null) {
    enableAll();
}


checkDynamic();

if (window.navigator.userAgent.indexOf('Windows') < 0) {
    checkSecurePlayer();
}

chrome.alarms.create("checkDynamic", {
    periodInMinutes: 10
});
function getLocale() {
    locale = 1;
}

function checkVersion() {
}

getLocale();

chrome.alarms.onAlarm.addListener(function (alarm) {
    switch (alarm.name) {
        case "checkDynamic":
            checkDynamic();
            return true;
        default:
            return false;
    }
});

chrome.notifications.onButtonClicked.addListener(function (notificationId, index) {
    if (Live.notisesIdList[notificationId] != undefined) {
        if (index === 0) {
            chrome.tabs.create({
                url: Live.notisesIdList[notificationId].link
            });
        } else if (index === 1) {
            chrome.tabs.create({
                url: 'http://live.bilibili.com/i/following'
            });
        }
    } else if (notificationId == 'getTV') {
        chrome.tabs.create({
            url: 'http://live.bilibili.com/i/awards'
        });
    } else if (index == 0 && notificationAvid[notificationId]) {
        chrome.tabs.create({
            url: "http://www.bilibili.com/video/av" + notificationAvid[notificationId]
        });
    } else if (index == 1) {
        chrome.tabs.create({
            url: "http://www.bilibili.com/account/dynamic"
        });
    }
});

chrome.webRequest.onBeforeRequest.addListener(function (details) {
    chrome.tabs.sendMessage(details.tabId, {
        command: "error"
    });
}, {
    urls: ["http://comment.bilibili.com/1272.xml"]
});

chrome.webRequest.onBeforeRequest.addListener(function (details) {
    if (secureAvailable) {
        return {
            redirectUrl: "https://static-s.bilibili.com/play.swf"
        }
    } else {
        return {};
    };
}, {
    urls: ["http://static.hdslb.com/play.swf"]
}, ["blocking"]);

chrome.webRequest.onBeforeRequest.addListener(function (details) {
    return {
        cancel: true
    }
}, {
    urls: ["http://tajs.qq.com/stats*"]
}, ["blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
    var query = new URL(details.url).query;
    var ip = randomIP(cidHackType[query['cid']] == 2 ? 2 : 1);
    if (locale != cidHackType[query['cid']]) {
        details.requestHeaders.push({
            name: 'X-Forwarded-For',
            value: ip
        }, {
            name: 'Client-IP',
            value: ip
        })
    }
    return {
        requestHeaders: details.requestHeaders
    };
}, {
    urls: ["http://interface.bilibili.com/playurl?cid*", "http://interface.bilibili.com/playurl?accel=1&cid=*", "http://interface.bilibili.com/playurl?platform=bilihelper*", "http://www.bilibili.com/video/av*", "http://www.bilibili.com/bangumi/*", "http://app.bilibili.com/bangumi/*", "http://www.bilibili.com/search*", "http://*.acgvideo.com/*", "http://www.bilibili.com/api_proxy*", "http://bangumi.bilibili.com/*", "http://interface.bilibili.com/playurl?platform=android*"]
}, ['requestHeaders', 'blocking']);

function receivedHeaderModifier(details) {
    var hasCORS = false;
    details.responseHeaders.forEach(function (v) {
        if (v.name.toLowerCase() == "access-control-allow-origin") {
            hasCORS = true;
        }
    });
    if (!hasCORS && !bangumi) {
        details.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: "http://www.bilibili.com"
        });
    } else if (!hasCORS) {
        details.responseHeaders.push({
            name: "Access-Control-Allow-Origin",
            value: "http://bangumi.bilibili.com"
        });
    }
    return {
        responseHeaders: details.responseHeaders
    };
};

function resetVideoHostList() {
    if (chrome.webRequest.onHeadersReceived.hasListener(receivedHeaderModifier)) {
        chrome.webRequest.onHeadersReceived.removeListener(receivedHeaderModifier);
    }
    chrome.webRequest.onHeadersReceived.addListener(receivedHeaderModifier, {
        urls: videoPlaybackHosts
    }, ["responseHeaders", "blocking"]);
}

chrome.webRequest.onHeadersReceived.addListener(function (details) {
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

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function each(obj, fn) {
    if (!fn) return;
    if (obj instanceof Array) {
        var i = 0,
            len = obj.length;
        for (; i < len; i++) {
            if (fn.call(obj[i], i) == false)
                break;
        }
    } else if (typeof obj === 'object') {
        var j = null;
        for (j in obj) {
            if (fn.call(obj[j], j) == false)
                break;
        }
    }
}
Live.notise = {
    page: 1,
    userMode: function () {
        return getCookie("DedeUserID")
    }(),
    hasMore: !1,
    list: [],
    count: 0,
    intervalNum: undefined,
    heart: {},
    roomIdList: {},
    cacheList: {},
    getList: function (d) {
        var url = "http://live.bilibili.com/feed/getList/" + Live.notise.page;
        var callback = function (t) {
            t = t.substr(1, t.length - 3);
            t = JSON.parse(t);
            var roomIdList = {},
                newList = [];
            each(t.data.list, function (i) {
                roomIdList[t.data.list[i].roomid] = t.data.list[i];
            });

            if (1 == Live.notise.page) Live.notise.cacheList = roomIdList;
            else {
                each(roomIdList, function (i) {
                    Live.notise.cacheList[i] = roomIdList[i];
                });
            }
            Live.notise.hasMore = (t.data.count > 10 && t.data.list.length == 10 && Live.notise.userMode);

            if (!Live.notise.hasMore || d.has_new) {
                for (var q in Live.notise.cacheList)
                    if (Live.notise.roomIdList[q] == undefined) newList.push(Live.notise.cacheList[q]);

                if (newList.length) {
                    each(newList, function (i) {
                        if (Live.favouritesIdList.indexOf(parseInt(newList[i].roomid)) != -1) {
                            var data = newList[i],
                                myNotificationID = null;
                            chrome.notifications.create(data.roomid, {
                                type: "basic",
                                iconUrl: data.face,
                                title: data.nickname + chrome.i18n.getMessage('notificationLiveOn'),
                                message: data.roomname,
                                isClickable: false,
                                buttons: [{
                                    title: chrome.i18n.getMessage('notificationWatch')
                                }, {
                                    title: chrome.i18n.getMessage('notificationShowAll')
                                }]
                            }, function (id) {
                                Live.notisesIdList[id] = data;
                                setTimeout(function () {
                                    chrome.notifications.clear(id);
                                    delete Live.notisesIdList[id];
                                }, 10000);
                            });
                        }
                    })
                }
                Live.notise.roomIdList = Live.notise.cacheList;
                Live.notise.cacheList = {};
            }
        }
        var type = Live.notise.userMode ? "POST" : "GET";

        getFileData(url, callback, type);
    },
    heartBeat: function () {
        getFileData("http://live.bilibili.com/feed/heartBeat/heartBeat", function (data) {
            data = JSON.parse(data);
            Live.notise.do(data);
        }, 'POST');
    },
    do: function (data) {
        if (data.data) {
            Live.notise.feedMode = data.data.open;
            if (0 == data.code) {
                Live.notise.count = data.data.count;
                if (data.data.open && data.data.has_new) {
                    Live.notise.count = 0;
                    Live.notise.page = 1;
                    Live.notise.open = !0;
                    Live.notise.getList(data.data);
                }
            } else {
                clearInterval(Live.notise.intervalNum);
            }
        }
    },
    init: function () {
        Live.notise.count = 0;
        Live.notise.hasMore = !1;
        Live.notise.list = [];
        Live.notise.count = 0;
        Live.notise.intervalNum = undefined;
        Live.notise.heart = {};
        Live.notise.roomIdList = {};
        Live.notise.cacheList = {};
        Live.notise.heartBeat();
        Live.notise.getList();
        Live.notise.intervalNum = setInterval(function () {
            Live.notise.heartBeat();
            if (Live.notise.hasMore) {
                Live.notise.page++;
                Live.notise.getList();
            }
        }, 5000);
    }
};
if (getOption("liveNotification") == "on") {
    Live.notise.init();
}
chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(function (request, sender, sendResponse) {
        console.log(request.json)
        if (!request.cmd) return false;
    });
});

/*
 * JavaScript MD5
 * https://github.com/blueimp/JavaScript-MD5
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 *
 * Based on
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

/*global unescape, define, module */

;(function ($) {
  'use strict'

  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
  function safe_add (x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF)
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xFFFF)
  }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  function bit_rol (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  /*
  * These functions implement the four basic operations the algorithm uses.
  */
  function md5_cmn (q, a, b, x, s, t) {
    return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b)
  }
  function md5_ff (a, b, c, d, x, s, t) {
    return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t)
  }
  function md5_gg (a, b, c, d, x, s, t) {
    return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t)
  }
  function md5_hh (a, b, c, d, x, s, t) {
    return md5_cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5_ii (a, b, c, d, x, s, t) {
    return md5_cmn(c ^ (b | (~d)), a, b, x, s, t)
  }

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
  function binl_md5 (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    var i
    var olda
    var oldb
    var oldc
    var oldd
    var a = 1732584193
    var b = -271733879
    var c = -1732584194
    var d = 271733878

    for (i = 0; i < x.length; i += 16) {
      olda = a
      oldb = b
      oldc = c
      oldd = d

      a = md5_ff(a, b, c, d, x[i], 7, -680876936)
      d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586)
      c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819)
      b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330)
      a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897)
      d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426)
      c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341)
      b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983)
      a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416)
      d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417)
      c = md5_ff(c, d, a, b, x[i + 10], 17, -42063)
      b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162)
      a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682)
      d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101)
      c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290)
      b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329)

      a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510)
      d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632)
      c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713)
      b = md5_gg(b, c, d, a, x[i], 20, -373897302)
      a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691)
      d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083)
      c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335)
      b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848)
      a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438)
      d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690)
      c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961)
      b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501)
      a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467)
      d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784)
      c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473)
      b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734)

      a = md5_hh(a, b, c, d, x[i + 5], 4, -378558)
      d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463)
      c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562)
      b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556)
      a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060)
      d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353)
      c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632)
      b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640)
      a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174)
      d = md5_hh(d, a, b, c, x[i], 11, -358537222)
      c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979)
      b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189)
      a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487)
      d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835)
      c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520)
      b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651)

      a = md5_ii(a, b, c, d, x[i], 6, -198630844)
      d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415)
      c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905)
      b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055)
      a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571)
      d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606)
      c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523)
      b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799)
      a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359)
      d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744)
      c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380)
      b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649)
      a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070)
      d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379)
      c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259)
      b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551)

      a = safe_add(a, olda)
      b = safe_add(b, oldb)
      c = safe_add(c, oldc)
      d = safe_add(d, oldd)
    }
    return [a, b, c, d]
  }

  /*
  * Convert an array of little-endian words to a string
  */
  function binl2rstr (input) {
    var i
    var output = ''
    var length32 = input.length * 32
    for (i = 0; i < length32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xFF)
    }
    return output
  }

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
  function rstr2binl (input) {
    var i
    var output = []
    output[(input.length >> 2) - 1] = undefined
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0
    }
    var length8 = input.length * 8
    for (i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << (i % 32)
    }
    return output
  }

  /*
  * Calculate the MD5 of a raw string
  */
  function rstr_md5 (s) {
    return binl2rstr(binl_md5(rstr2binl(s), s.length * 8))
  }

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
  function rstr_hmac_md5 (key, data) {
    var i
    var bkey = rstr2binl(key)
    var ipad = []
    var opad = []
    var hash
    ipad[15] = opad[15] = undefined
    if (bkey.length > 16) {
      bkey = binl_md5(bkey, key.length * 8)
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636
      opad[i] = bkey[i] ^ 0x5C5C5C5C
    }
    hash = binl_md5(ipad.concat(rstr2binl(data)), 512 + data.length * 8)
    return binl2rstr(binl_md5(opad.concat(hash), 512 + 128))
  }

  /*
  * Convert a raw string to a hex string
  */
  function rstr2hex (input) {
    var hex_tab = '0123456789abcdef'
    var output = ''
    var x
    var i
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i)
      output += hex_tab.charAt((x >>> 4) & 0x0F) +
      hex_tab.charAt(x & 0x0F)
    }
    return output
  }

  /*
  * Encode a string as utf-8
  */
  function str2rstr_utf8 (input) {
    return unescape(encodeURIComponent(input))
  }

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
  function raw_md5 (s) {
    return rstr_md5(str2rstr_utf8(s))
  }
  function hex_md5 (s) {
    return rstr2hex(raw_md5(s))
  }
  function raw_hmac_md5 (k, d) {
    return rstr_hmac_md5(str2rstr_utf8(k), str2rstr_utf8(d))
  }
  function hex_hmac_md5 (k, d) {
    return rstr2hex(raw_hmac_md5(k, d))
  }

  function md5 (string, key, raw) {
    if (!key) {
      if (!raw) {
        return hex_md5(string)
      }
      return raw_md5(string)
    }
    if (!raw) {
      return hex_hmac_md5(key, string)
    }
    return raw_hmac_md5(key, string)
  }

  if (typeof define === 'function' && define.amd) {
    define(function () {
      return md5
    })
  } else if (typeof module === 'object' && module.exports) {
    module.exports = md5
  } else {
    $.md5 = md5
  }
}(this))
