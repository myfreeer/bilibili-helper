// options
const storageGet = () => new Promise((resolve) => chrome.storage.local.get(resolve));
let options = {
    'player': 'html5', // original swf iframe bilih5 html5 html5hd html5ld
    'rel_search': 'with', // off without with
    'trackingBlock': true,
    'scrollToPlayer': true,
    'api': 'offical',
    'opacity': 1,
    'prop': false,
    'scale': 1,
    'volume': 0.5,
    'replace': true,
};
const refreshOptions = () => storageGet().then((obj) => Object.assign(options, obj)).then(() => chrome.storage.local.set(options));
refreshOptions();

// static data
const trackingUrls = [
    '*://data.bilibilijj.com/free/*.txt*',
    '*://data.bilibili.com/log/web*',
    '*://cm.bilibili.com/cm/api/fees/pc',
    '*://cm.bilibili.com/cm/api/apidata/pc',
    '*://cm.bilibili.com/cm/api/receive/content/pc',
    '*://tajs.qq.com/stats*',
    '*://*.secureweb24.net/*',
    '*://*.cnzz.com/stat.php*',
    '*://*.hdslb.com/images/base/loading.gif',
    '*://*.hdslb.com/message/img/infocenterIcon-*.png',
    '*://*.hdslb.com/images/v3images/img_loading.png',
    '*://*.hdslb.com/images/v2images/topicons.png',
    '*://api.bilibili.com/crossdomain.xml*',
    '*://*.hdslb.com/crossdomain.xml*',
    '*://interface.bilibili.com/serverdate.js*',
    '*://*.hdslb.com/images/base/app-box.png',
    '*://api.bilibili.com/x/elec/show*',
    '*://static.hdslb.com/images/elecrank-empty.png',
    '*://live-feed.bilibili.com/ajax/feed/count*',
    '*://comment.bilibili.com/playtag,*',
    '*://interface.bilibili.com/msg.xml*',
    '*://data.bilibili.com/crossdomain.xml*',
    '*://*.bilibili.com/index/index-icon.json*',
    '*://*.bilibili.com/widget/getSearchDefaultWords*',
    '*://*.bilibili.com/v/web/*',
    '*://*.hdslb.com/images/v2images/footpic.png',
    '*://*.hdslb.com/ad-images/wx.jpg',
    '*://*.hdslb.com/player/images/player_error.png',
    '*://data.bilibili.com/a/access.js*',
    '*://api.bilibili.com/plaza/banner*',
    '*://*.hdslb.com/vip/dist/js/vipPlugin.js*',
    '*://*.hdslb.com/ad-images/wx.gif*',
    '*://*.hdslb.com/bfs/static/anime/js/bangumi.play.js*',
    '*://*.hdslb.com/bfs/static/anime/js/sponsor.js*',
    '*://data.bilibili.com/a/bangumi.js*',
    '*://*.up.lxdns.com/report.php*',
    '*://*.hdslb.com/js/video.min.js',
    '*://*.hdslb.com/js/bfd.js',
    '*://*.bilibili.com/rec.js',
    '*://*.hdslb.com/js/video.min.js*',
    '*://*.hdslb.com/js/bfd.js*',
    '*://data.bilibili.com/rec.js*',
    '*://data.bilibili.com/v/flashplay/h5_player_op*',
    '*://api.bilibili.com/x/report/*',
    '*://api.bilibili.com/x/web-interface/zone*',
];
const videoPlaybackHosts = ['*://*.hdslb.com/*', '*://api.bilibili.com/*', '*://interface.bilibili.com/*', '*://*.acgvideo.com/*', '*://*/*.acgvideo.com/*', '*://*.biliplus.com/BPplayurl.php*'];

// message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.command) {
    case 'injectCSS':
        chrome.tabs.insertCSS(sender.tab.id, {file: 'bilibili-helper.css'});
        chrome.tabs.insertCSS(sender.tab.id, {file: 'ABPlayer.css'}, sendResponse);
        return true;
    case 'refreshOptions':
        refreshOptions();
        return true;
    case 'requestForDownload':
        chrome.downloads.download({
            saveAs: true,
            url: request.url,
            filename: 'Bilibili/' + request.filename,
            conflictAction: 'prompt',
        });
        return true;
    default:
        sendResponse({
            result: 'unknown',
        });
        return false;
    }
});
// tabs listener
let tabs = [];
chrome.tabs.query({}, (info) => (tabs = info));
chrome.tabs.onUpdated.addListener(() => chrome.tabs.query({}, (info) => (tabs = info)));

// webRequest listener
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    chrome.tabs.sendMessage(details.tabId, {
        command: 'error',
    });
}, {
    urls: ['*://comment.bilibili.com/1272.xml'],
});

chrome.webRequest.onBeforeRequest.addListener(function() {
    if (options.trackingBlock) return {
        cancel: true,
    };
}, {
    urls: trackingUrls,
}, ['blocking']);

function receivedHeaderModifier(details) {
    let hasCORS, hasCredentials;
    let cors = '*';
    for (let i of tabs) if (i.id === details.tabId) cors = (new URL(i.url)).protocol + '//' + (new URL(i.url)).hostname;
    details.responseHeaders.forEach(function(v) {
        if (v.name.toLowerCase() === 'access-control-allow-origin') {
            hasCORS = true;
            v.value = cors;
        } else if (v.name.toLowerCase() === 'access-control-allow-credentials') {
            v.value = 'true';
            hasCredentials = true;
        }
    });
    if (!hasCORS) {
        details.responseHeaders.push({
            name: 'Access-Control-Allow-Origin',
            value: cors,
        });
    }
    if (!hasCredentials) details.responseHeaders.push({
        name: 'Access-Control-Allow-Credentials',
        value: 'true',
    });
    return {
        responseHeaders: details.responseHeaders,
    };
}

chrome.webRequest.onHeadersReceived.addListener(receivedHeaderModifier, {
    urls: videoPlaybackHosts,
}, ['responseHeaders', 'blocking']);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
    let headers = details.responseHeaders;
    if (details.statusLine.indexOf('HTTP/1.1 302') === 0 && options.replace) {
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].name.toLowerCase() === 'location') {
                headers.splice(i, 1, {
                    name: 'Set-Cookie',
                    value: 'redirectUrl=' + encodeURIComponent(headers[i].value),
                });
            }
        }
    }
    return {
        responseHeaders: headers,
    };
}, {
    urls: ['*://www.bilibili.com/video/av*', '*://bangumi.bilibili.com/anime/v/*'],
}, ['responseHeaders', 'blocking']);

// video api replacing
// https://gist.github.com/myfreeer/d805427aba19f5b34480edafeb94e20d
class UrlParams {
    constructor(str) {
        if (str) this.parse(str);
    }
    toString(filterArray) {
        filterArray = filterArray && filterArray.map ? filterArray.filter((e) => this.hasOwnProperty(e)) : Object.keys(this);
        return filterArray.map((e) => this[e] === false || this[e] === 0 || this[e] ? e + '=' + encodeURIComponent(this[e]) : e).join('&');
    }
    parse(str) {
        if (!str) return false;
        if (str.charAt(0) === '?') str = str.substr(1);
        str.split('&').map((e) => e.split('=')).map((e) => this[e[0]] = e[1] && decodeURIComponent(e[1]));
        return this;
    }
}
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    if (options.api.match('http')) {
        const search = (new URL(details.url)).search;
        let urlParams = new UrlParams(search);
        if (details.url.match('bangumi')) urlParams.cid += '|bangumi';
        return {
            redirectUrl: `${options.api}/BPplayurl.php?${urlParams.toString(['cid', 'otype', 'type', 'quality'])}`,
        };
    } else return {};
}, {
    urls: ['*://bangumi.bilibili.com/player/web_api/playurl*', '*://interface.bilibili.com/playurl*'],
}, ['blocking']);
