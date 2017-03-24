import md5 from './md5';
import {sleep} from './utils';

const bilibiliVideoProvider = async(cid, avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500) => {
    const APPKEY = '84956560bc028eb7';
    const APPSECRET = '94aba54af9065f71de72f5508f1cd42e';
    let url={};
    let token;
    const getToken=async(retries)=>{
      let token;
      try{
        let text = await fetch(location.protocol + '//www.bilibili.com/video/av7/').then(res => res.text())
        token = text.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1];
        sessionStorage['bilibiliVideoProvider_Token'] = token;
        return token;
      }catch(e){
        if (--retries>0) {
          await sleep(retryDelay);
          return await getToken(retries);
        }
        else throw(e);
      }
    };
    if (sessionStorage['bilibiliVideoProvider_Token']) token = sessionStorage['bilibiliVideoProvider_Token'];
    if (!token) token = await getToken();
    url.low = `${location.protocol}//api.bilibili.com/playurl?aid=${avid}&page=${page}&platform=html5&vtype=mp4&token=${token}`;
    url._base = location.protocol + '//interface.bilibili.com/playurl?';
    url._query =(type,quality=3)=> `appkey=${APPKEY}&cid=${cid}&otype=json&quality=${quality}&type=${type}`;
    url.mp4 = url._base + url._query('mp4') +'&sign=' + md5(url._query('mp4') + APPSECRET);
    url.flv = url._base + url._query('flv') +'&sign=' + md5(url._query('flv') + APPSECRET);
    const parseJsonforFlvjs = (json) => {
        if (!json) return console.warn('parseJsonforFlvjs Failed: No JSON provided.');
        var mediaDataSource = {};
        mediaDataSource.type = 'flv';
        if (parseInt(json.timelength)) mediaDataSource.duration = parseInt(json.timelength);
        if (json.durl) mediaDataSource.segments = json.durl.map(obj => ({
            "duration": obj.length,
            "filesize": obj.size,
            "url": obj.url.match("ws.acgvideo.com") ? obj.url : obj.url.replace(/^http:\/\//, "https://")
        }));
        if (!json.durl) return console.warn('parseJsonforFlvjs Failed: Nothing to play.');
        return mediaDataSource;
    };
    const getVideoJson=async(url,retries) => {
      let json;
      try{
        json = await fetch(url,{credentials}).then(response => response.json());
      }catch(error){
        if (--retries>0) {
          await sleep(retryDelay);
          return await getVideoJson(type,retries);
        }
        else json = {
          'code': -1,
          'message': error
        };
      }
      return json;
    }
    let video={};
    for (let i of ['low','mp4','flv']) video[i]=await getVideoJson(url[i]);
    video.mediaDataSource = parseJsonforFlvjs(video.flv);
    return video;
};
export default bilibiliVideoProvider;