const bilibiliVideoInfoProvider = async(avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    const url = ["http://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=" + page + "&batch=true", "https://www.biliplus.com/api/view?id=" + avid];
    if (sessionStorage[avid + '_' + page]) return JSON.parse(sessionStorage[avid + '_' + page]);
    let json;
    try {
        json = await fetch(n % 2 ? url[1] : url[0], {credentials}).then(response => response.json());
        if (!json || !(json && json.list && json.list.length) || json && json.code === -503) throw new Error('Can not get valid JSON.');
    } catch (e) {
        if (++n < retries) {
            await sleep(retryDelay);
            json = await bilibiliVideoInfoProvider(avid, page, credentials, retries, retryDelay, n);
        } else throw e;
    }
    if (!json.pages) json.pages = json.list.length;
    sessionStorage[avid + '_' + page] = JSON.stringify(json);
    return json;
};

const bilibiliBangumiVideoInfoProvider = async(epid, credentials = 'include', retries = 5, retryDelay = 500, n = 0) => {
    var url = ['http://bangumi.bilibili.com/web_api/episode/' + epid + '.json', "https://www.biliplus.com/api/view?id=" + epid];
    if (sessionStorage['ep_' + epid]) return JSON.parse(sessionStorage['ep_' + epid]);
    let json, videoInfo;
    try {
        json = await fetch(n % 2 ? url[1] : url[0], {credentials}).then(response => response.json());
        if (!json || !(json && json.result && ((json.result.currentEpisode && json.result.currentEpisode.avId) || json.result.aid)) || json && json.code === -503) throw new Error('Can not get valid JSON.');
        videoInfo = await bilibiliVideoInfoProvider(json.result.aid || json.result.currentEpisode.avId);
    } catch (e) {
        if (++n < retries) {
            await sleep(retryDelay);
            videoInfo = await bilibiliBangumiVideoInfoProvider(epid, credentials, retries, retryDelay, n);
        } else throw e;
    }
    return videoInfo;
};

var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) {
  module.exports.bilibiliBangumiVideoInfoProvider = bilibiliBangumiVideoInfoProvider;
  module.exports.bilibiliVideoInfoProvider = bilibiliVideoInfoProvider;
};
