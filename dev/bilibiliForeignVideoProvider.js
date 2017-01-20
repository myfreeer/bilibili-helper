'use strict';
var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) {
  var md5 = require('./md5');
}
class bilibiliForeignVideoProvider {
  constructor(cid, avid, page = 1) {
    this.video = this.getVideo(cid, avid, page);
  }
  parseJsonforFlvjs(json) {
    if (!json) return console.warn('parseJsonforFlvjs Failed: No JSON provided.');
    var mediaDataSource = {};
    mediaDataSource.type = 'flv';
    if (parseInt(json.timelength)) mediaDataSource.duration = parseInt(json.timelength);
    if (json.durl) mediaDataSource.segments = json.durl.map(obj => ({
      "duration": obj.length,
      "filesize": obj.size,
      "url": obj.url.match("ws.acgvideo.com") ? obj.url : obj.url.replace(/^http:\/\//, "https://") //.replace("&dynamic=1", "")
    }));
    if (!json.durl) return console.warn('parseJsonforFlvjs Failed: Nothing to play.');
    return mediaDataSource;
  }
  fetchretry(url, options) {
    var retries = (options && options.retries) ? options.retries : 5;
    var retryDelay = (options && options.retryDelay) ? options.retryDelay : 500;
    return new Promise((resolve, reject) => {
      let wrappedFetch = n => fetch(url, options).then(response => resolve(response)).catch(error => n > 0 ? setTimeout(() => wrappedFetch(--n), retryDelay) : resolve({
        'code': -1,
        'message': error
      }));
      wrappedFetch(retries);
    });
  }
  getVideo(cid, avid, page) {
    let urls = [
      'https://www.biliplus.com/BPplayurl.php?cid=' + cid + '&otype=json&type=mp4',
      'https://api.prprpr.me/dplayer/video/bilibili?cid=' + cid,
      'https://www.biliplus.com/BPplayurl.php?cid=' + cid + '&otype=json&type=flv'
    ];
    let fetchArray = urls.map(url => this.fetchretry(url, {
      credentials: 'include'
    }).then(response => response.json()));
    return Promise.all(fetchArray).then(array => this.processResult(array, this.parseJsonforFlvjs));
  }
  processResult(array, func) {
    let mediaDataSource = func(array[2]);
    if (array.length === 3) return {
      lowResLink: array[0],
      mp4Link: array[1],
      flvLink: array[2],
      mediaDataSource: mediaDataSource
    };
  }
}
if (COMMONJS) module.exports = bilibiliForeignVideoProvider;