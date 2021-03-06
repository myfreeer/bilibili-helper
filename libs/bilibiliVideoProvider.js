import md5 from './md5';
import {sleep} from './utils';

// from project youtube-dl (Unlicense)
// https://github.com/rg3/youtube-dl/blob/bd8f48c78b952ebe3bf335185c819e265f63cb50/youtube_dl/extractor/bilibili.py#L59-L60
const APPKEY = '84956560bc028eb7';
const APPSECRET = '94aba54af9065f71de72f5508f1cd42e';

// from project you-get (license MIT)
// https://github.com/soimort/you-get/blob/0f0da0ccd72e93a3c93d51b5b90c81513ef77d15/src/you_get/extractors/bilibili.py#L15
const SECRETKEY_MINILOADER = '1c15888dc316e05a15fdd0a02ed6584f';

// from project you-get (license MIT)
// https://github.com/soimort/you-get/blob/a129903da61930472d1bb46a64a0e557cf4184b7/src/you_get/extractors/bilibili.py#L30
const BANGUMI_API_SEC = '9b288147e5474dd2aa67085f716c560d';

const processXmlObj = (obj) => {
    if (obj.video) obj = obj.video;
    if (obj.durl && !obj.durl.push) obj.durl = [obj.durl];
    if (obj.durl.length && obj.durl.length > 0 && obj.durl[0] && obj.durl[0].backup_url && !obj.durl[0].backup_url.push && obj.durl[0].backup_url.url) {
        obj.durl[0].backup_url = obj.durl[0].backup_url.url;
        if (!obj.durl[0].backup_url.push) obj.durl[0].backup_url = [obj.durl[0].backup_url];
    }
    if (obj.accept_quality && !obj.accept_quality.push) obj.accept_quality = obj.accept_quality.split(',').map((e) => Number(e));
    return obj;
};

const xml2obj = (xml) => {
    try {
        let text, obj = {};
        if (xml.children.length > 0) {
            [...xml.children].map((item) => {
                let nodeName = item.nodeName;
                if (typeof (obj[nodeName]) === 'undefined') obj[nodeName] = xml2obj(item);
                else {
                    if (!obj[nodeName].push) obj[nodeName] = [obj[nodeName]];
                    obj[nodeName].push(xml2obj(item));
                }
            });
        } else {
            text = xml.textContent;
            if (/^\d+(\.\d+)?$/.test(text)) obj = Number(text);
            else if (text === 'true' || text === 'false') obj = Boolean(text);
            else obj = text;
        }
        return obj;
    } catch (e) {
        console.warn(e.message);
    }
};

const parseJsonforFlvjs = (json) => {
    if (!json) return console.warn('parseJsonforFlvjs Failed: No JSON provided.');
    let mediaDataSource = {};
    mediaDataSource.type = 'flv';
    if (parseInt(json.timelength)) mediaDataSource.duration = parseInt(json.timelength);
    if (json.durl) mediaDataSource.segments = json.durl.map((obj) => ({
        'duration': obj.length,
        'filesize': obj.size,
        'url': obj.url.replace(/^http:\/\//, 'https://'),
    }));
    if (!json.durl) return console.warn('parseJsonforFlvjs Failed: Nothing to play.');
    if (mediaDataSource.segments.length === 1 && json.durl[0].backup_url && json.durl[0].backup_url.length === 1 && !mediaDataSource.segments[0].url.match('flv') && json.durl[0].backup_url[0].match('flv')) mediaDataSource.segments[0].url = json.durl[0].backup_url[0].replace(/^http:\/\//, 'https://');
    if (!mediaDataSource.segments[0].url.match('flv') && mediaDataSource.segments.length === 1) mediaDataSource.type = 'mp4';
    if (mediaDataSource.type === 'mp4') Object.assign(mediaDataSource, mediaDataSource.segments[0]);
    return mediaDataSource;
};

const getVideoLink = async (url, type, retries = 5, credentials = 'include', retryDelay = 500) => {
    let json;
    try {
        if (type === 'flv') {
            let xmltext = await fetch(url, {credentials}).then((res) => res.text());
            json = processXmlObj(xml2obj((new DOMParser()).parseFromString(xmltext, 'text/xml')));
        } else json = await fetch(url, {credentials}).then((response) => response.json());
    } catch (error) {
        if (--retries > 0) {
            await sleep(retryDelay);
            return await getVideoLink(url, type, retries);
        } else json = {
            'code': -1,
            'message': error,
        };
    }
    return json;
};

const bilibiliVideoProvider = async (cid, avid, page = 1, isBangumi = 0, credentials = 'include', retries = 5, retryDelay = 500) => {
    let url = {};
    url._base = location.protocol + '//interface.bilibili.com/playurl?';
    url._query = (type) => `appkey=${APPKEY}&cid=${cid}&otype=json&type=${type}`;
    url.mp4 = url._base + url._query('hdmp4') + '&sign=' + md5(url._query('hdmp4') + APPSECRET);
    url.flv = url._base + url._query('flv') + '&sign=' + md5(url._query('flv') + APPSECRET);
    const interfaceUrl = (cid, ts) => `cid=${cid}&player=1&ts=${ts}`;
    const calcSign = (cid, ts) => md5(`${interfaceUrl(cid, ts)}${SECRETKEY_MINILOADER}`);
    let video = {};
    const types = ['mp4', 'flv'];
    for (let i of types) video[i] = await getVideoLink(url[i], null, retries, credentials, retryDelay);
    video.mediaDataSource = parseJsonforFlvjs(video.flv);
    video.hd = [];
    video.ld = [];
    const processVideoUrl = (url) => {
        if (!url) return;
        url = url.replace(/^http:\/\//, 'https://');
        if (url.match('hd.mp4') || url.match('-48.mp4')) video.hd.push(url);
        else if (url.match('.mp4')) video.ld.push(url);
    };
    const processVideoUrlObj = (obj) => {
        if (!(obj.durl && obj.durl[0] && obj.durl[0].url)) return;
        obj.durl.forEach((durl) => processVideoUrl(durl.url));
        if (obj.durl[0].backup_url && obj.durl[0].backup_url[0]) obj.durl[0].backup_url.forEach((url) => processVideoUrl(url));
    };
    for (let i of types) processVideoUrlObj(video[i]);
    // if flv urls not available, retry with alternative api
    if (!isBangumi && !(video.mediaDataSource && video.mediaDataSource.type === 'flv')) {
        const ts = Math.ceil(Date.now() / 1000);
        url.flv = url._base + `${interfaceUrl(cid, ts)}&sign=${calcSign(cid, ts)}`;
        video.flv = await getVideoLink(url.flv, 'flv', retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    // if flv urls still not available, retry with biliplus api (a 3rd-party api)
    if (!isBangumi && !(video.mediaDataSource && video.mediaDataSource.type === 'flv')) {
        video.flv = await getVideoLink(`${location.protocol}//www.biliplus.com/BPplayurl.php?cid=${cid}&otype=json&quality=4&type=flv&update=1`, null, retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    // if mediaDataSource for bangumis is not available, try bangumi api instead
    if (!video.mediaDataSource && isBangumi) {
        const bgmUrlBase = `cid=22383138&module=bangumi&player=1&ts=${(new Date() / 1000) | 0}`;
        url.flv = `${location.protocol}//bangumi.bilibili.com/player/web_api/playurl?${bgmUrlBase}&sign=${md5(bgmUrlBase + BANGUMI_API_SEC)}`;
        video.flv = await getVideoLink(url.flv, 'flv', retries, credentials, retryDelay);
        processVideoUrlObj(video.flv);
        video.mediaDataSource = parseJsonforFlvjs(video.flv);
    }
    video.hd = video.hd.sort().reverse();
    video.ld = video.ld.sort().reverse();
    return video;
};
export default bilibiliVideoProvider;
