# bilibili-helper
（去除追踪代码及精简）哔哩哔哩 (bilibili.com) 辅助工具，可以替换播放器、去广告、推送通知并进行一些快捷操作
#Flvplayer API (Experimental, slow and unstable)
from [mama-hd](https://github.com/nareix/mama-hd)
```js
flvplayer.playflv(document.getElementById('bilibili_helper_html5_player_video'),['http://218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv?wsTime=1475420091&wsSecret2=fe4aa727b05ef7d54c20fac5c9a07fa6&oi=1806877290&rate=10&wshc_tag=0&wsts_tag=57f0b00b&wsid_tag=73abdddc&wsiphost=ipdbm'],60+48)
flvplayer.playflv=function((Element)player, (Array)src, (Number)duration-seconds)
```
#Known bugs
```
VM1425:522 Uncaught (in promise) DOMException: Failed to execute 'appendBuffer' on 'SourceBuffer': This SourceBuffer has been removed from the parent media source.(…)doaction @ VM1425:522sess.then.segbuf @ VM1425:554
VM1425:571 Uncaught InvalidStateError: Failed to read the 'buffered' property from 'SourceBuffer': This SourceBuffer has been removed from the parent media source.tryPrefetch @ VM1425:571setInterval @ VM1425:669
http://218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv?wsTime=1475420091&…7290&rate=10&wshc_tag=0&wsts_tag=57f0b00b&wsid_tag=73abdddc&wsiphost=ipdbm Failed to load resource: net::ERR_CONNECTION_RESET
XHR failed loading: GET "http://218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv?wsTime=1475420091&…7290&rate=10&wshc_tag=0&wsts_tag=57f0b00b&wsid_tag=73abdddc&wsiphost=ipdbm".
VM1425:601 Uncaught InvalidStateError: Failed to read the 'buffered' property from 'SourceBuffer': This SourceBuffer has been removed from the parent media source.currentTimeIsBuffered @ VM1425:601video.addEventListener.debounce @ VM1425:616(anonymous function) @ VM1425:485
www.bilibili.com/:1 XMLHttpRequest cannot load http://218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv?wsTime=1475420091&…7290&rate=10&wshc_tag=0&wsts_tag=57f0b00b&wsid_tag=73abdddc&wsiphost=ipdbm. The request was redirected to 'http://101.106.238.50/flvfiles/41980000014F7E8D/218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv', which is disallowed for cross-origin requests that require preflight.
VM1425:334 XHR failed loading: GET "http://218.76.105.118/ws.acgvideo.com/0/59/4134509-1.flv?wsTime=1475420091&…7290&rate=10&wshc_tag=0&wsts_tag=57f0b00b&wsid_tag=73abdddc&wsiphost=ipdbm".request @ VM1425:334Promise @ VM1425:337fetchMediaSegmentsByIndex @ VM1425:287fetchAndAppend @ VM1425:547tryPrefetch @ VM1425:579setInterval @ VM1425:669
2VM1425:571 Uncaught InvalidStateError: Failed to read the 'buffered' property from 'SourceBuffer': This SourceBuffer has been removed from the parent media source.tryPrefetch @ VM1425:571setInterval @ VM1425:669
```
