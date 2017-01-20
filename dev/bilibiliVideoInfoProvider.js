const bilibiliVideoInfoProvider = (avid, page = 1, options = {credentials: 'include'}) => {
  'use strict';
  var retries = 5;
  var retryDelay = 500;
  var url = ["http://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=" + page + "&batch=true", "https://www.biliplus.com/api/view?id=" + avid];
  return new Promise((resolve, reject) => {
    if (sessionStorage[avid + '_' + page]) return resolve(JSON.parse(sessionStorage[avid + '_' + page]));
    let parseVideoInfo = json => {
      if (!json || !(json && json.list && json.list.length) || json && json.code === -503) throw new Error();
      if (!json.pages) json.pages = json.list.length;
      sessionStorage[avid + '_' + page] = JSON.stringify(json);
      resolve(json);
    };
    let wrappedFetch = n => fetch(n % 2 ? url[0] : url[1], options).then(response => response.json().then(parseVideoInfo)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
    wrappedFetch(retries);
  });
};

const bilibiliBangumiVideoInfoProvider = (epid, options = {credentials: 'include'}) => {
  'use strict';
  var retries = 5;
  var retryDelay = 500;
  var url = ['http://bangumi.bilibili.com/web_api/episode/' + epid + '.json', "https://www.biliplus.com/api/view?id=" + epid];
  return new Promise((resolve, reject) => {
    if (sessionStorage['ep_' + epid]) return resolve(JSON.parse(sessionStorage['ep_' + epid]));
    let parseEpInfo = json => {
      if (!json || !(json && json.result && (json.result.currentEpisode && json.result.currentEpisode.avId) || json.result.aid) || json && json.code === -503) throw new Error();
      sessionStorage['ep_' + epid] = JSON.stringify(json.result);
      resolve(json.result);
    };
    let wrappedFetch = n => fetch(n % 2 ? url[0] : url[1], options).then(response => response.json().then(parseEpInfo)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : reject(error));
    wrappedFetch(retries);
  }).then(result => result.aid ? bilibiliVideoInfoProvider(result.aid) : bilibiliVideoInfoProvider(result.currentEpisode.avId));
};
var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) {
  module.exports.bilibiliBangumiVideoInfoProvider = bilibiliBangumiVideoInfoProvider;
  module.exports.bilibiliVideoInfoProvider = bilibiliVideoInfoProvider;
};