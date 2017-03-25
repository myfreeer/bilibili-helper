import md5 from './md5';
import {sleep} from './utils';

const bilibiliVideoProvider = async(cid, avid, page = 1, credentials = 'include', retries = 5, retryDelay = 500) => {
    let url={};
    url.low = 'https://www.biliplus.com/BPplayurl.php?cid=' + cid + '&otype=json&quality=1&type=mp4';
    url.mp4 = 'https://www.biliplus.com/BPplayurl.php?cid=' + cid + '&otype=json&type=mp4';
    url.flv = 'https://www.biliplus.com/BPplayurl.php?cid=' + cid + '&otype=json&type=flv';
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