/******/ var flvplayer=(function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	'use strict'
	
	let mediaSource = __webpack_require__(/*! ./mediaSource */ 1);
	let flvdemux = __webpack_require__(/*! ./flvdemux */ 2);
	
	let themeColor = '#DF6558';
	
	mediaSource.debug = true;
	
	let playVideo = res => {
		let player = document.getElementById('bilibili_helper_html5_player_video').childNodes[0].src;
		let media = mediaSource.bindVideo({
			video:player.video,
			src:res.src,
			duration:res.duration,
		});
		player.streams = media.streams;
		return {player, media};
};
	exports.playflv=function(player, src, duration){
		let media = mediaSource.bindVideo({
			video:player,
			src:src,
			duration:duration,
		});
		player.streams = media.streams;
		return {player, media};
};
exports.mediaSource=mediaSource;
	
/***/ },
/* 1 */
/*!************************!*\
  !*** ./mediaSource.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	
	//TODO
	// [DONE] sourceBuffer: opeartion queue
	// [DONE] seek to keyframe problem
	// [DONE] rewrite fetchMediaSegment
	// seeking start seeking end cb, when seeking not end bufupdate not seek
	// [DONE] xhr retry
	
	'use strict'
	
	let flvdemux = __webpack_require__(/*! ./flvdemux */ 2)
	let mp4mux = __webpack_require__(/*! ./mp4mux */ 3)
	let fetch = __webpack_require__(/*! ./http */ 4).fetch;
	
	let app = {}
	
	let dbp = console.log.bind(console);
	
	let concatUint8Array = function(list) {
		let len = 0;
		list.forEach(b => len += b.byteLength)
		let res = new Uint8Array(len);
		let off = 0;
		list.forEach(b => {
			res.set(b, off);
			off += b.byteLength;
		})
		return res;
	}
	
	class Streams {
		constructor({urls,fakeDuration}) {
			if (fakeDuration == null)
				throw new Error('fakeDuration must set');
			this.urls = urls;
			this.fakeDuration = fakeDuration;
			this.streams = [];
			this.duration = 0;
			this.keyframes = [];
			this.probeIdx = 0;
		}
	
		probeFirst() {
			return this.probeOneByOne();
		}
	
		fetchInitSegment(url) {
			let parser = new flvdemux.InitSegmentParser();
			let pump = reader => {
				return reader.read().then(res => {
					if (res.done) {
						//dbp('initsegparser: EOF');
						return;
					}
					let chunk = res.value;
					//dbp(`initsegparser: incoming ${chunk.byteLength}`);
					let done = parser.push(chunk);
					if (done) {
						//dbp('initsegparser: finished', done);
						reader.cancel();
						return done;
					} else {
						return pump(reader);
					}
				});
			}
			return fetch(url, {headers: {Range: 'bytes=0-5000000'}, retries: 1024}).then(res => {
				return pump(res.body.getReader())
			});
		}
	
		probeOneByOne() {
			let url = this.urls[this.probeIdx];
			return this.fetchInitSegment(url).then(flvhdr => {
				if (flvhdr == null)
					return Promise.reject(new Error('probe '+url+' failed'));
				let stream = flvhdr;
	
				this.streams.push(stream);
				stream.duration = stream.meta.duration;
				stream.timeStart = this.duration;
				stream.timeEnd = this.duration+stream.duration;
				stream.indexStart = this.keyframes.length;
	
				let keyframes = stream.meta.keyframes;
				keyframes.times.forEach((time, i) => {
					let last = i==keyframes.times.length-1;
					let entry = {
						timeStart: stream.timeStart+time,
						timeEnd: stream.timeStart+(last?stream.duration:keyframes.times[i+1]),
						urlIdx: this.probeIdx,
						rangeStart: keyframes.filepositions[i],
						rangeEnd: last?stream.meta.filesize:keyframes.filepositions[i+1],
					};
					entry.duration = entry.timeEnd-entry.timeStart;
					entry.size = entry.rangeEnd-entry.rangeStart;
					this.keyframes.push(entry);
				});
				this.duration += stream.duration;
	
				if (this.probeIdx == 0) {
					if (flvhdr.firstv.AVCDecoderConfigurationRecord == null)
						throw new Error('AVCDecoderConfigurationRecord not found');
					if (flvhdr.firsta.AudioSpecificConfig == null)
						throw new Error('AudioSpecificConfig not found');
	
					let record = flvhdr.firstv.AVCDecoderConfigurationRecord;
					dbp('probe:', `h264.profile=${record[1].toString(16)}`, 'meta', flvhdr);
	
					this.videoTrack = {
						type: 'video',
						id: 1,
						duration: Math.ceil(this.fakeDuration*mp4mux.timeScale),
						width: flvhdr.meta.width,
						height: flvhdr.meta.height,
						AVCDecoderConfigurationRecord: flvhdr.firstv.AVCDecoderConfigurationRecord,
					};
					this.audioTrack = {
						type: 'audio',
						id: 2,
						duration: this.videoTrack.duration,
						channelcount: flvhdr.firsta.channelCount,
						samplerate: flvhdr.firsta.sampleRate,
						samplesize: flvhdr.firsta.sampleSize,
						AudioSpecificConfig: flvhdr.firsta.AudioSpecificConfig,
					};
				}
	
				this.probeIdx++;
				dbp(`probe: got ${this.probeIdx}/${this.urls.length}`);
	
				if (this.onProbeProgress)
					this.onProbeProgress(stream, this.probeIdx-1);
				if (this.probeIdx < this.urls.length) {
					this.probeOneByOne();
				}
			});
		}
	
		findIndexByTime(time, opts) {
			if (time < 0 || time > this.duration)
				return;
			let minDiff = this.duration, best;
			this.keyframes.forEach((keyframe, i) => {
				let diff = time-keyframe.timeStart;
				let absDiff = Math.abs(diff);
				if (absDiff < minDiff) {
					minDiff = absDiff;
					best = i;
				}
			});
			return best;
	
			let choose = 0;
			for (let i = 0; i < this.keyframes.length; i++) {
				let e = this.keyframes[i];
				if (time <= e.timeEnd) {
					choose = i; 
					break;
				}
			}
			return choose;
		}
	
		fetchMediaSegmentsByIndex(indexStart, indexEnd) {
			let ranges = [];
			let totalSize = 0;
	
			for (let i = indexStart; i <= indexEnd; i++) {
				let e = this.keyframes[i];
				let url = this.urls[e.urlIdx];
				let range;
				if (ranges.length == 0 || ranges[ranges.length-1].url != url) {
					range = {url, start:e.rangeStart, end:e.rangeEnd};
					range.streamTimeBase = this.streams[e.urlIdx].timeStart;
					range.timeStart = e.timeStart;
					range.indexStart = i;
					ranges.push(range);
				} else {
					range = ranges[ranges.length-1];
				}
				range.indexEnd = i;
				range.end = e.rangeEnd;
				range.timeEnd = e.timeEnd;
				range.duration = range.timeEnd-range.timeStart;
				totalSize += e.size;
			}
	
			if (ranges.length == 0)
				throw new Error('ranges.length = 0');
	
			let timeStart = this.keyframes[indexStart].timeStart;
			let timeEnd = this.keyframes[indexEnd].timeEnd;
			dbp('fetch:', `index=[${indexStart},${indexEnd}] `+
										`time=[${timeStart},${timeEnd}] size=${totalSize/1e6}M range.nr=${ranges.length}`);
	
			let resbuf = [];
			let fulfill;
			let xhr;
	
			let promise = new Promise((_fulfill, reject) => {
				fulfill = _fulfill;
	
				let request = i => {
					let range = ranges[i];
					let {url,start,end} = range;
					dbp('fetch:', `bytes=[${start},${end}]`);
					xhr = new XMLHttpRequest();
					xhr.open('GET', url);
					xhr.responseType = 'arraybuffer';
					{
						let range;
						if (start || end) {
							range = 'bytes=';
							if (start)
								range += start;
							else
								range += '0';
							range += '-'
							if (end)
								range += end-1;
						}
						if (range !== undefined) {
							xhr.setRequestHeader('Range', range);
						}
					}
					xhr.onerror = () => {
						setTimeout(() => request(i), 2000);
					}
	
					xhr.onload = () => {
						let segbuf = new Uint8Array(xhr.response);
						let cputimeStart = new Date().getTime();
						let buf = this.transcodeMediaSegments(segbuf, range);
						let cputimeEnd = new Date().getTime();
						dbp('transcode:', `[${range.indexStart},${range.indexEnd}]`, 'cputime(ms):', (cputimeEnd-cputimeStart), 
								'segbuf(MB)', segbuf.byteLength/1e6,
								'videotime(s)', range.duration
							 );
						resbuf.push(buf);
						if (i+1 < ranges.length) {
							request(i+1);
						} else {
							fulfill(concatUint8Array(resbuf));
						}
					}
	
					xhr.send();
				}
	
				request(0);
			});
	
			promise.cancel = () => {
				xhr.abort();
				fulfill();
			};
	
			promise.timeStart = timeStart;
			promise.timeEnd = timeEnd;
	
			return promise;
		}
	
		getInitSegment() {
			return mp4mux.initSegment([this.videoTrack, this.audioTrack], this.fakeDuration*mp4mux.timeScale);
		}
	
		transcodeMediaSegments(segbuf, range) {
			let segpkts = flvdemux.parseMediaSegment(segbuf);
	
			let lastSample, lastDuration, duration;
			let videoTrack = this.videoTrack;
			let audioTrack = this.audioTrack;
	
			// baseMediaDecodeTime=firstpacket.time [video][video][video][video] nextkeyframe.time
			// baseMediaDecodeTime=firstpacket.time [audio][audio][audio][audio] keyframe.time+aac_total_duration
	
			if (this._lastTranscodeRangeEndIndex !== undefined && 
					this._lastTranscodeRangeEndIndex+1 === range.indexStart) {
				audioTrack._firstTime = audioTrack._lastTime;
				videoTrack._firstTime = videoTrack._lastTime;
			} else {
				delete audioTrack._firstTime;
				delete videoTrack._firstTime;
			}
			this._lastTranscodeRangeEndIndex = range.indexEnd;
	
			videoTrack._mdatSize = 0;
			videoTrack.samples = [];
			audioTrack._mdatSize = 0;
			audioTrack.samples = [];
	
			lastSample = null;
			duration = 0;
			segpkts.filter(pkt => pkt.type == 'video' && pkt.NALUs).forEach((pkt, i) => {
				let sample = {};
				sample._data = pkt.NALUs;
				sample._offset = videoTrack._mdatSize;
				sample.size = sample._data.byteLength;
				videoTrack._mdatSize += sample.size;
	
				if (videoTrack._firstTime === undefined) {
					videoTrack._firstTime = pkt.dts+range.streamTimeBase;
				}
				sample._dts = pkt.dts;
				sample.compositionTimeOffset = pkt.cts*mp4mux.timeScale;
	
				sample.flags = {
					isLeading: 0,
					dependsOn: 0,
					isDependedOn: 0,
					hasRedundancy: 0,
					paddingValue: 0,
					isNonSyncSample: pkt.isKeyFrame?0:1,
					degradationPriority: 0,
				};
	
				if (lastSample) {
					let diff = sample._dts-lastSample._dts;
					lastSample.duration = diff*mp4mux.timeScale;
					duration += diff;
				}
				lastSample = sample;
				videoTrack.samples.push(sample);
			});
			lastSample.duration = (range.duration-duration)*mp4mux.timeScale;
			videoTrack._lastTime = range.timeEnd;
	
			lastSample = null;
			duration = 0;
			segpkts.filter(pkt => pkt.type == 'audio' && pkt.frame).forEach((pkt, i) => {
				let sample = {};
				sample._data = pkt.frame;
				sample._offset = audioTrack._mdatSize;
				sample.size = sample._data.byteLength;
				audioTrack._mdatSize += sample.size;
	
				//dbp('audiosample', pkt.dts, pkt.frame.byteLength);
	
				if (audioTrack._firstTime === undefined) {
					audioTrack._firstTime = pkt.dts+range.streamTimeBase;
				}
				sample._dts = pkt.dts;
	
				if (lastSample) {
					let diff = sample._dts-lastSample._dts;
					lastSample.duration = diff*mp4mux.timeScale;
					duration += diff;
					lastDuration = diff;
				}
				lastSample = sample;
				audioTrack.samples.push(sample);
			});
			lastSample.duration = lastDuration*mp4mux.timeScale;
			audioTrack._lastTime = duration+lastDuration+audioTrack._firstTime;
	
			videoTrack.baseMediaDecodeTime = videoTrack._firstTime*mp4mux.timeScale;
			audioTrack.baseMediaDecodeTime = audioTrack._firstTime*mp4mux.timeScale;
	
			if (0) {
				let totdur = x => x.samples.reduce((val,e) => val+e.duration, 0);
				dbp('av.samplesCount',audioTrack.samples.length, videoTrack.samples.length);
				dbp('av.duration:', totdur(audioTrack)/mp4mux.timeScale,totdur(videoTrack)/mp4mux.timeScale);
				dbp('av.firstTime:', audioTrack._firstTime, videoTrack._firstTime);
				dbp('av.lastTime:', audioTrack._lastTime, videoTrack._lastTime);
			}
	
			let moof, _mdat, mdat;
			let list = [];
	
			moof = mp4mux.moof(0, [videoTrack]);
			_mdat = new Uint8Array(videoTrack._mdatSize);
			videoTrack.samples.forEach(sample => _mdat.set(sample._data, sample._offset));
			mdat = mp4mux.mdat(_mdat);
			list = list.concat([moof, mdat]);
	
			moof = mp4mux.moof(0, [audioTrack]);
			_mdat = new Uint8Array(audioTrack._mdatSize);
			audioTrack.samples.forEach(sample => _mdat.set(sample._data, sample._offset));
			mdat = mp4mux.mdat(_mdat);
			list = list.concat([moof, mdat]);
	
			return concatUint8Array(list);
		}
	}
	
	function debounce(start, interval) {
		var timer;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timer = null;
				start.apply(context, args);
			};
			if (timer) {
				clearTimeout(timer);
			} else {
				start.apply(context, args);
			}
			timer = setTimeout(later, interval);
		};
	};
	
	function triggerPerNr(fn, nr) {
		let counter = 0;
		return () => {
			counter++;
			if (counter == nr) {
				counter = 0;
				fn();
			}
		}
	}
	
	app.bindVideo = (opts) => {
		let video = opts.video;
		let streams = new Streams({urls:opts.src, fakeDuration:opts.duration});
		let mediaSource = new MediaSource();
		video.src = URL.createObjectURL(mediaSource);
	
		let self = {mediaSource, streams, onSeek: []};
	
		let sourceBuffer;
		let sourceBufferOnUpdateend;
	
		let tryPrefetch;
		let clearBufferAndPrefetch;
		{
			let fetching;
			let pending = [];
	
			let doaction = fn => {
				if (sourceBuffer.updating) {
					pending.push(fn);
				} else fn()
			}
	
			sourceBufferOnUpdateend = () => {
				if (pending.length > 0) {
					dbp('updateend: do pending');
					pending[0]();
					pending = pending.slice(1);
				}
				let buffered = sourceBuffer.buffered;
			}
	
			let fetchAndAppend = (time,duration) => {
				let indexStart = streams.findIndexByTime(time);
				if (indexStart == null)
					return;
				let indexEnd = indexStart;
				for (let i = indexStart; i < streams.keyframes.length; i++) {
					let e = streams.keyframes[i];
					if (e.timeEnd > time+duration) {
						indexEnd = i;
						break;
					}
				}
	
				let sess = streams.fetchMediaSegmentsByIndex(indexStart, indexEnd);
				fetching = sess;
				sess.then(segbuf => {
					if (sess === fetching) {
						fetching = null;
					}
					if (segbuf) {
						doaction(() => sourceBuffer.appendBuffer(segbuf));
					}
				});
			}
	
			let stopFetching = () => {
				if (fetching) {
					fetching.cancel();
					fetching = null;
				}
			}
	
			tryPrefetch = (duration=10) => {
				if (fetching || sourceBuffer.updating)
					return;
	
				let time;
				let buffered = sourceBuffer.buffered;
				if (buffered.length > 0) {
					time = buffered.end(buffered.length-1);
				} else {
					time = 0;
				}
	
				if (time < video.currentTime + 60.0)
					fetchAndAppend(time, duration);
			}
	
			clearBufferAndPrefetch = (duration=10) => {
				dbp('prefetch: clearBufferAndPrefetch');
	
				if (sourceBuffer.updating)
					sourceBuffer.abort();
	
				let time = video.currentTime;
				stopFetching();
	
				sourceBuffer.remove(0, video.duration);
				if (time > streams.duration) {
					// wait probe done
				} else {
					fetchAndAppend(time, duration);
				}
			}
		}
	
		let currentTimeIsBuffered = () => {
			let buffered = sourceBuffer.buffered;
			if (buffered.length == 0)
				return;
			return video.currentTime >= buffered.start(0) && 
					video.currentTime < buffered.end(buffered.length-1);
		};
	
		streams.onProbeProgress = (stream, i) => {
			if (i > 0 && stream.timeStart <= video.currentTime && video.currentTime < stream.timeEnd) {
				dbp('onProbeProgress:', i, 'need prefetch');
				clearBufferAndPrefetch();
			}
		}
	
		video.addEventListener('seeking', debounce(() => {
			if (!currentTimeIsBuffered()) {
				dbp('seeking(not buffered):', video.currentTime);
				clearBufferAndPrefetch();
			} else {
				dbp('seeking(buffered):', video.currentTime);
			}
			self.onSeek.forEach(x => x());
		}, 200));
	
		mediaSource.addEventListener('sourceended', () => dbp('mediaSource: sourceended'))
		mediaSource.addEventListener('sourceclose', () => dbp('mediaSource: sourceclose'))
	
		mediaSource.addEventListener('sourceopen', e => {
			if (mediaSource.sourceBuffers.length > 0)
				return;
	
			//sourceBuffer = mediaSource.addSourceBuffer('video/mp4; codecs="avc1.64001E, mp4a.40.2"');
			let codecType = 'video/mp4; codecs="avc1.640029, mp4a.40.05"';
			dbp('codec supported:', MediaSource.isTypeSupported(codecType));
			sourceBuffer = mediaSource.addSourceBuffer(codecType);
			self.sourceBuffer = sourceBuffer;
	
			sourceBuffer.addEventListener('error', () => dbp('sourceBuffer: error'));
			sourceBuffer.addEventListener('abort', () => dbp('sourceBuffer: abort'));
			sourceBuffer.addEventListener('updateend', () => {
				//dbp('sourceBuffer: updateend')
				sourceBufferOnUpdateend();
			});
	
			sourceBuffer.addEventListener('update', () => {
				let ranges = [];
				let buffered = sourceBuffer.buffered;
				for (let i = 0; i < buffered.length; i++) {
					ranges.push([buffered.start(i), buffered.end(i)]);
				}
				dbp('bufupdate:', JSON.stringify(ranges), 'time', video.currentTime);
	
				if (buffered.length > 0) {
					if (video.currentTime < buffered.start(0) || 
							video.currentTime > buffered.end(buffered.length-1)) 
					{
						video.currentTime = buffered.start(0)+0.1;
					}
				}
			});
	
			streams.probeFirst().then(() => {
				sourceBuffer.appendBuffer(streams.getInitSegment());
			});
	
			video.addEventListener('loadedmetadata', () => {
				tryPrefetch(5.0);
				setInterval(() => {
					tryPrefetch();
				}, 1500);
			});
		});
	
		return self;
	}
	
	app.Streams = Streams;
	module.exports = app;
	


/***/ },
/* 2 */
/*!*********************!*\
  !*** ./flvdemux.js ***!
  \*********************/
/***/ function(module, exports) {

	
	'use strict'
	
	class ByteReader {
		constructor(buf) {
			this.buf = buf;
			this.pos = 0;
		}
	
		len() {
			return this.buf.byteLength-this.pos;
		}
	
		readBEUint(len) {
			if (this.pos >= this.buf.byteLength)
				throw new Error('EOF');
			let v = 0;
			for (let i = this.pos; i < this.pos+len; i++) {
				v <<= 8;
				v |= this.buf[i];
			}
			this.pos += len;
			return v;
		}
	
		readBEInt(len) {
			let i = this.readBEUint(len);
			let topbit = 1<<(len*8-1);
			if (i & topbit) {
				return -((topbit<<1)-i);
			} else {
				return i;
			}
		}
	
		readBuf(len) {
			if (this.pos >= this.buf.byteLength)
				throw new Error('EOF');
			let b = this.buf.slice(this.pos, this.pos+len);
			this.pos += len;
			return b;
		}
	
		skip(len) {
			if (this.pos >= this.buf.byteLength)
				throw new Error('EOF');
			this.pos += len;
		}
	}
	
	const TAG_SCRIPTDATA = 18;
	const TAG_AUDIO = 8;
	const TAG_VIDEO = 9;
	
	const AMF_NUMBER      = 0x00;
	const AMF_BOOL        = 0x01;
	const AMF_STRING      = 0x02;
	const AMF_OBJECT      = 0x03;
	const AMF_NULL        = 0x05;
	const AMF_UNDEFINED   = 0x06;
	const AMF_REFERENCE   = 0x07;
	const AMF_MIXEDARRAY  = 0x08;
	const AMF_OBJECT_END  = 0x09;
	const AMF_ARRAY       = 0x0a;
	const AMF_DATE        = 0x0b;
	const AMF_LONG_STRING = 0x0c;
	
	let readAMFString = br => {
		let length = br.readBEUint(2);
		let buf = br.readBuf(length);
		return String.fromCharCode.apply(null, buf);
	}
	
	let readAMFObject = br => {
		let type = br.readBEUint(1);
	
		switch (type) {
			case AMF_NUMBER: {
				var b = br.readBuf(8);
				return new DataView(b.buffer).getFloat64(0);
			}
	
			case AMF_BOOL: {
				return br.readBEUint(1) != 0;
			}
	
			case AMF_STRING: {
				return readAMFString(br);
			}
	
			case AMF_OBJECT: {
				let map = {};
				for (;;) {
					let str = readAMFString(br);
					if (str.length == 0)
						break;
					let obj = readAMFObject(br);
					map[str] = obj;
				}
				br.skip(1);
				return map;
			}
	
			case AMF_DATE: {
				br.skip(10);
				return;
			}
	
			case AMF_ARRAY: {
				let arr = [];
				let len = br.readBEUint(4);
				for (let i = 0; i < len; i++) {
					let obj = readAMFObject(br);
					arr.push(obj);
				}
				return arr;
			}
	
			case AMF_MIXEDARRAY: {
				let map = {};
				br.skip(4);
				for (;;) {
					let str = readAMFString(br);
					if (str.length == 0)
						break;
					let obj = readAMFObject(br);
					map[str] = obj;
				}
				br.skip(1);
				return map;
			}
		}
	}
	
	let parseScriptData = uint8arr => {
		let br = new ByteReader(uint8arr);
		let type = br.readBEUint(1);
		let str = readAMFString(br);
		if (str == 'onMetaData') {
			return readAMFObject(br);
		}
	}
	
	let parseVideoPacket = (uint8arr, dts) => {
		let br = new ByteReader(uint8arr);
		let flags = br.readBEUint(1);
		let frameType = (flags>>4)&0xf;
		let codecId = flags&0xf;
		let pkt = {type:'video', dts:dts/1e3};
	
		if (codecId == 7) { // h264
			let type = br.readBEUint(1);
			let cts = br.readBEInt(3);
			pkt.cts = cts/1e3;
			pkt.pts = dts+cts;
			if (type == 0) {
				// AVCDecoderConfigurationRecord
				pkt.AVCDecoderConfigurationRecord = br.readBuf(br.len());
			} else if (type == 1) {
				// NALUs
				pkt.NALUs = br.readBuf(br.len());
				pkt.isKeyFrame = frameType==1;
			} else if (type == 2) {
				//throw new Error('type=2');
			}
		}
		return pkt;
	}
	
	let parseAudioPacket = (uint8arr, dts) => {
		let br = new ByteReader(uint8arr);
		let flags = br.readBEUint(1)
		let fmt = flags>>4;
		let pkt = {type: 'audio', dts:dts/1e3}
		if (fmt == 10) {
			// AAC
			let type = br.readBEUint(1);
			if (type == 0) {
				pkt.AudioSpecificConfig = br.readBuf(br.len());
				pkt.sampleRate = [5500,11000,22000,44000][(flags>>2)&3];
				pkt.sampleSize = [8,16][(flags>>1)&1];
				pkt.channelCount = [1,2][(flags)&1];
			} else if (type == 1)
				pkt.frame = br.readBuf(br.len());
		}
		return pkt;
	};
	
	let parseMediaSegment = uint8arr => {
		let br = new ByteReader(uint8arr);
		let packets = [];
	
		while (br.len() > 0) {
			let tagType = br.readBEUint(1);
			let dataSize = br.readBEUint(3);
			let dts = br.readBEUint(3);
			br.skip(4);
			let data = br.readBuf(dataSize);
	
			switch (tagType) {
			case TAG_SCRIPTDATA:
				break;
	
			case TAG_VIDEO:
				packets.push(parseVideoPacket(data, dts));
				break;
	
			case TAG_AUDIO:
				packets.push(parseAudioPacket(data, dts));
				break;
	
			default:
				//throw new Error(`unknown tag=${tagType}`);
			}
			br.skip(4);
		}
	
		return packets;
	}
	
	class InitSegmentParser {
		constructor() {
			let meta, firsta, firstv;
			this._readloop = (function *() {
				yield 5;
				let dataOffset = yield 4;
				yield dataOffset-9+4;
	
				for (;;) {
					let tagType = yield 1;
					let dataSize = yield 3;
					let timeStamp = yield 3;
					yield 4;
					let data = yield {len:dataSize};
					if (tagType == TAG_SCRIPTDATA) {
						meta = parseScriptData(data);
					} else if (tagType == TAG_VIDEO && firstv == null) {
						firstv = parseVideoPacket(data);
					} else if (tagType == TAG_AUDIO && firsta == null) {
						firsta = parseAudioPacket(data);
					}
					if (meta && firsta && firstv) {
						return {meta,firstv,firsta};
					}
					yield 4;
				}
			})();
			this._next();
		}
	
		_next() {
			let r = this._readloop.next(this._val);
			if (r.done) {
				this._done = r.value;
			} else {
				if (typeof(r.value) == 'number') {
					this._left = r.value;
					this._val = 0;
				} else {
					this._left = r.value.len;
					if (this._left > 1024*1024*16)
						throw new Error('buf too big')
					this._val = new Uint8Array(this._left);
				}
			}
		}
	
		push(input) {
			let pos = 0;
			while (!this._done && pos < input.byteLength) {
				if (typeof(this._val) == 'number') {
					while (this._left > 0 && pos < input.byteLength) {
						this._val <<= 8;
						this._val |= input[pos];
						this._left--;
						pos++;
					}
				} else {
					while (this._left > 0 && pos < input.byteLength) {
						let len = Math.min(this._left, input.byteLength-pos);
						this._val.set(input.slice(pos,pos+len), this._val.byteLength-this._left);
						this._left -= len;
						pos += len;
					}
				}
				if (this._left == 0) {
					this._next();
				}
			}
			return this._done;
		}
	}
	
	let parseInitSegment = uint8arr => {
		try {
			let br = new ByteReader(uint8arr);
			br.skip(5);
			let dataOffset = br.readBEUint(4);
			let skip = dataOffset-9+4;
			br.skip(skip);
	
			let meta;
			let firsta, firstv;
	
			for (let i = 0; i < 4; i++) {
				let tagType = br.readBEUint(1);
				let dataSize = br.readBEUint(3);
				let timeStamp = br.readBEUint(3);
				br.skip(4);
				let data = br.readBuf(dataSize);
	
				if (tagType == TAG_SCRIPTDATA) {
					meta = parseScriptData(data);
				} else if (tagType == TAG_VIDEO && firstv == null) {
					firstv = parseVideoPacket(data);
				} else if (tagType == TAG_AUDIO && firsta == null) {
					firsta = parseAudioPacket(data);
				}
	
				if (meta && firsta && firstv) {
					return {meta,firstv,firsta};
				}
				br.skip(4);
			}
		} catch (e) {
			console.error(e.stack);
		}
	}
	
	exports.InitSegmentParser = InitSegmentParser;
	exports.parseInitSegment = parseInitSegment;
	exports.parseMediaSegment = parseMediaSegment;
	


/***/ },
/* 3 */
/*!*******************!*\
  !*** ./mp4mux.js ***!
  \*******************/
/***/ function(module, exports) {

	/**
	 * mux.js
	 *
	 * Copyright (c) 2015 Brightcove
	 * All rights reserved.
	 *
	 * Functions that generate fragmented MP4s suitable for use with Media
	 * Source Extensions.
	 */
	'use strict';
	
	var FLAGS = {};
	
	FLAGS.MOV_TFHD_BASE_DATA_OFFSET       = 0x01
	FLAGS.MOV_TFHD_STSD_ID                = 0x02
	FLAGS.MOV_TFHD_DEFAULT_DURATION       = 0x08
	FLAGS.MOV_TFHD_DEFAULT_SIZE           = 0x10
	FLAGS.MOV_TFHD_DEFAULT_FLAGS          = 0x20
	FLAGS.MOV_TFHD_DURATION_IS_EMPTY  = 0x010000
	FLAGS.MOV_TFHD_DEFAULT_BASE_IS_MOOF = 0x020000
	
	FLAGS.MOV_TRUN_DATA_OFFSET            = 0x01
	FLAGS.MOV_TRUN_FIRST_SAMPLE_FLAGS     = 0x04
	FLAGS.MOV_TRUN_SAMPLE_DURATION       = 0x100
	FLAGS.MOV_TRUN_SAMPLE_SIZE           = 0x200
	FLAGS.MOV_TRUN_SAMPLE_FLAGS          = 0x400
	FLAGS.MOV_TRUN_SAMPLE_CTS            = 0x800
	
	FLAGS.MOV_FRAG_SAMPLE_FLAG_DEGRADATION_PRIORITY_MASK = 0x0000ffff
	FLAGS.MOV_FRAG_SAMPLE_FLAG_IS_NON_SYNC               = 0x00010000
	FLAGS.MOV_FRAG_SAMPLE_FLAG_PADDING_MASK              = 0x000e0000
	FLAGS.MOV_FRAG_SAMPLE_FLAG_REDUNDANCY_MASK           = 0x00300000
	FLAGS.MOV_FRAG_SAMPLE_FLAG_DEPENDED_MASK             = 0x00c00000
	FLAGS.MOV_FRAG_SAMPLE_FLAG_DEPENDS_MASK              = 0x03000000
	
	FLAGS.MOV_FRAG_SAMPLE_FLAG_DEPENDS_NO                = 0x02000000
	FLAGS.MOV_FRAG_SAMPLE_FLAG_DEPENDS_YES               = 0x01000000
	
	FLAGS.MOV_TKHD_FLAG_ENABLED       = 0x0001
	FLAGS.MOV_TKHD_FLAG_IN_MOVIE      = 0x0002
	FLAGS.MOV_TKHD_FLAG_IN_PREVIEW    = 0x0004
	FLAGS.MOV_TKHD_FLAG_IN_POSTER     = 0x0008
	
	var box, dinf, esds, ftyp, mdat, mfhd, minf, moof, moov, mvex, mvhd, trak,
	    tkhd, mdia, mdhd, hdlr, sdtp, stbl, stsd, styp, traf, trex, trun,
	    types, MAJOR_BRAND, MINOR_VERSION, AVC1_BRAND, VIDEO_HDLR,
	    AUDIO_HDLR, HDLR_TYPES, VMHD, SMHD, DREF, STCO, STSC, STSZ, STTS;
	
	// pre-calculate constants
	(function() {
	  var i;
	  types = {
	    avc1: [], // codingname
	    avcC: [],
	    btrt: [],
	    dinf: [],
	    dref: [],
	    esds: [],
	    ftyp: [],
	    hdlr: [],
	    mdat: [],
	    mdhd: [],
	    mdia: [],
	    mfhd: [],
	    minf: [],
	    moof: [],
	    moov: [],
	    mp4a: [], // codingname
	    mvex: [],
	    mvhd: [],
	    sdtp: [],
	    smhd: [],
	    stbl: [],
	    stco: [],
	    stsc: [],
	    stsd: [],
	    stsz: [],
	    stts: [],
	    styp: [],
	    tfdt: [],
	    tfhd: [],
	    traf: [],
	    trak: [],
	    trun: [],
	    trex: [],
	    tkhd: [],
	    vmhd: []
	  };
	
	  for (i in types) {
	    if (types.hasOwnProperty(i)) {
	      types[i] = [
	        i.charCodeAt(0),
	        i.charCodeAt(1),
	        i.charCodeAt(2),
	        i.charCodeAt(3)
	      ];
	    }
	  }
	
	  MAJOR_BRAND = new Uint8Array([
	    'i'.charCodeAt(0),
	    's'.charCodeAt(0),
	    'o'.charCodeAt(0),
	    'm'.charCodeAt(0)
	  ]);
	  AVC1_BRAND = new Uint8Array([
	    'a'.charCodeAt(0),
	    'v'.charCodeAt(0),
	    'c'.charCodeAt(0),
	    '1'.charCodeAt(0)
	  ]);
	  MINOR_VERSION = new Uint8Array([0, 0, 0, 1]);
	  VIDEO_HDLR = new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00, 0x00, 0x00, // pre_defined
	    0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x56, 0x69, 0x64, 0x65,
	    0x6f, 0x48, 0x61, 0x6e,
	    0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
	  ]);
	  AUDIO_HDLR = new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00, 0x00, 0x00, // pre_defined
	    0x73, 0x6f, 0x75, 0x6e, // handler_type: 'soun'
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x53, 0x6f, 0x75, 0x6e,
	    0x64, 0x48, 0x61, 0x6e,
	    0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'SoundHandler'
	  ]);
	  HDLR_TYPES = {
	    "video":VIDEO_HDLR,
	    "audio": AUDIO_HDLR
	  };
	  DREF = new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00, 0x00, 0x01, // entry_count
	    0x00, 0x00, 0x00, 0x0c, // entry_size
	    0x75, 0x72, 0x6c, 0x20, // 'url' type
	    0x00, // version 0
	    0x00, 0x00, 0x01 // entry_flags
	  ]);
	  SMHD = new Uint8Array([
	    0x00,             // version
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00,       // balance, 0 means centered
	    0x00, 0x00        // reserved
	  ]);
	  STCO = new Uint8Array([
	    0x00, // version
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00, 0x00, 0x00 // entry_count
	  ]);
	  STSC = STCO;
	  STSZ = new Uint8Array([
	    0x00, // version
	    0x00, 0x00, 0x00, // flags
	    0x00, 0x00, 0x00, 0x00, // sample_size
	    0x00, 0x00, 0x00, 0x00, // sample_count
	  ]);
	  STTS = STCO;
	  VMHD = new Uint8Array([
	    0x00, // version
	    0x00, 0x00, 0x01, // flags
	    0x00, 0x00, // graphicsmode
	    0x00, 0x00,
	    0x00, 0x00,
	    0x00, 0x00 // opcolor
	  ]);
	})();
	
	box = function(type) {
	  var
	    payload = [],
	    size = 0,
	    i,
	    result,
	    view;
	
	  for (i = 1; i < arguments.length; i++) {
	    payload.push(arguments[i]);
	  }
	
	  i = payload.length;
	
	  // calculate the total size we need to allocate
	  while (i--) {
	    size += payload[i].byteLength;
	  }
	  result = new Uint8Array(size + 8);
	  view = new DataView(result.buffer, result.byteOffset, result.byteLength);
	  view.setUint32(0, result.byteLength);
	  result.set(type, 4);
	
	  // copy the payload into the result
	  for (i = 0, size = 8; i < payload.length; i++) {
	    result.set(payload[i], size);
	    size += payload[i].byteLength;
	  }
	  return result;
	};
	
	dinf = function() {
	  return box(types.dinf, box(types.dref, DREF));
	};
	
	esds = function(track) {
		var AudioSpecificConfig;
		if (track.AudioSpecificConfig)
			AudioSpecificConfig = Array.prototype.slice.call(track.AudioSpecificConfig);
		else
			AudioSpecificConfig = [
				(track.audioobjecttype << 3) | (track.samplingfrequencyindex >>> 1),
				(track.samplingfrequencyindex << 7) | (track.channelcount << 3),
			];
	
		// ISO/IEC 14496-3, AudioSpecificConfig
		// for samplingFrequencyIndex see ISO/IEC 13818-7:2006, 8.1.3.2.2, Table 35
	
	  return box(types.esds, new Uint8Array([
	    0x00, // version
	    0x00, 0x00, 0x00, // flags
	
	    // ES_Descriptor
	    0x03, // tag, ES_DescrTag
	    0x17+AudioSpecificConfig.length, // length
	    0x00, 0x00, // ES_ID
	    0x00, // streamDependenceFlag, URL_flag, reserved, streamPriority
	
	    // DecoderConfigDescriptor
	    0x04, // tag, DecoderConfigDescrTag
	    0x0f+AudioSpecificConfig.length, // length
	    0x40, // object type
	    0x15,  // streamType
	    0x00, 0x06, 0x00, // bufferSizeDB
	    0x00, 0x00, 0xda, 0xc0, // maxBitrate
	    0x00, 0x00, 0xda, 0xc0, // avgBitrate
	
	    // DecoderSpecificInfo
	    0x05, // tag, DecoderSpecificInfoTag
	    AudioSpecificConfig.length, // length
		].concat(AudioSpecificConfig).concat([
	    0x06, 0x01, 0x02 // GASpecificConfig
	  ])));
	};
	
	ftyp = function() {
	  return box(types.ftyp, MAJOR_BRAND, MINOR_VERSION, MAJOR_BRAND, AVC1_BRAND);
	};
	hdlr = function(type) {
	  return box(types.hdlr, HDLR_TYPES[type]);
	};
	mdat = function(data) {
	  return box(types.mdat, data);
	};
	
	mdhd = function(track) {
	  var result = new Uint8Array([
	    0x00,                   // version 0
	    0x00, 0x00, 0x00,       // flags
	    0x00, 0x00, 0x00, 0x02, // creation_time
	    0x00, 0x00, 0x00, 0x03, // modification_time
	    0x00, 0x01, 0x5f, 0x90, // timescale, 90,000 "ticks" per second
	
	    (track.duration >>> 24) & 0xFF,
	    (track.duration >>> 16) & 0xFF,
	    (track.duration >>>  8) & 0xFF,
	    track.duration & 0xFF,  // duration
	    0x55, 0xc4,             // 'und' language (undetermined)
	    0x00, 0x00
	  ]);
	
	  // Use the sample rate from the track metadata, when it is
	  // defined. The sample rate can be parsed out of an ADTS header, for
	  // instance.
	  /*if (track.samplerate) {
	    result[12] = (track.samplerate >>> 24) & 0xFF;
	    result[13] = (track.samplerate >>> 16) & 0xFF;
	    result[14] = (track.samplerate >>>  8) & 0xFF;
	    result[15] = (track.samplerate)        & 0xFF;
	  }*/
	
	  return box(types.mdhd, result);
	};
	
	mdia = function(track) {
	  return box(types.mdia, mdhd(track), hdlr(track.type), minf(track));
	};
	
	mfhd = function(sequenceNumber) {
	  return box(types.mfhd, new Uint8Array([
	    0x00,
	    0x00, 0x00, 0x00, // flags
	    (sequenceNumber & 0xFF000000) >> 24,
	    (sequenceNumber & 0xFF0000) >> 16,
	    (sequenceNumber & 0xFF00) >> 8,
	    sequenceNumber & 0xFF, // sequence_number
	  ]));
	};
	
	minf = function(track) {
	  return box(types.minf,
	             track.type === 'video' ? box(types.vmhd, VMHD) : box(types.smhd, SMHD),
	             dinf(),
	             stbl(track));
	};
	
	moof = function(sequenceNumber, tracks) {
	  var
	    trackFragments = [],
	    i = tracks.length;
	  // build traf boxes for each track fragment
	  while (i--) {
	    trackFragments[i] = traf(tracks[i]);
	  }
	  return box.apply(null, [
	    types.moof,
	    mfhd(sequenceNumber)
	  ].concat(trackFragments));
	};
	
	/**
	 * Returns a movie box.
	 * @param tracks {array} the tracks associated with this movie
	 * @see ISO/IEC 14496-12:2012(E), section 8.2.1
	 */
	moov = function(tracks, duration) {
	  var
	    i = tracks.length,
	    boxes = [];
	
	  while (i--) {
	    boxes[i] = trak(tracks[i]);
	  }
	
	  return box.apply(null, [types.moov, mvhd(duration||0xffffffff)].concat(boxes).concat(mvex(tracks)));
	};
	mvex = function(tracks) {
	  var
	    i = tracks.length,
	    boxes = [];
	
	  while (i--) {
	    boxes[i] = trex(tracks[i]);
	  }
	  return box.apply(null, [types.mvex].concat(boxes));
	};
	mvhd = function(duration) {
	  var
	    bytes = new Uint8Array([
	      0x00, // version 0
	      0x00, 0x00, 0x00, // flags
	      0x00, 0x00, 0x00, 0x01, // creation_time
	      0x00, 0x00, 0x00, 0x02, // modification_time
	      0x00, 0x01, 0x5f, 0x90, // timescale, 90,000 "ticks" per second
	      (duration & 0xFF000000) >> 24,
	      (duration & 0xFF0000) >> 16,
	      (duration & 0xFF00) >> 8,
	      duration & 0xFF, // duration
	      0x00, 0x01, 0x00, 0x00, // 1.0 rate
	      0x01, 0x00, // 1.0 volume
	      0x00, 0x00, // reserved
	      0x00, 0x00, 0x00, 0x00, // reserved
	      0x00, 0x00, 0x00, 0x00, // reserved
	      0x00, 0x01, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x01, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00, // pre_defined
	      0xff, 0xff, 0xff, 0xff // next_track_ID
	    ]);
	  return box(types.mvhd, bytes);
	};
	
	sdtp = function(track) {
	  var
	    samples = track.samples || [],
	    bytes = new Uint8Array(4 + samples.length),
	    flags,
	    i;
	
	  // leave the full box header (4 bytes) all zero
	
	  // write the sample table
	  for (i = 0; i < samples.length; i++) {
	    flags = samples[i].flags;
	
	    bytes[i + 4] = (flags.dependsOn << 4) |
	      (flags.isDependedOn << 2) |
	      (flags.hasRedundancy);
	  }
	
	  return box(types.sdtp,
	             bytes);
	};
	
	stbl = function(track) {
	  return box(types.stbl,
	             stsd(track),
	             box(types.stts, STTS),
	             box(types.stsc, STSC),
	             box(types.stsz, STSZ),
	             box(types.stco, STCO));
	};
	
	(function() {
	  var videoSample, audioSample;
	
	  stsd = function(track) {
	
	    return box(types.stsd, new Uint8Array([
	      0x00, // version 0
	      0x00, 0x00, 0x00, // flags
	      0x00, 0x00, 0x00, 0x01
	    ]), track.type === 'video' ? videoSample(track) : audioSample(track));
	  };
	
	  videoSample = function(track) {
			var fieldsBuf = new Uint8Array([
	      0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, // reserved
	      0x00, 0x01, // data_reference_index
	      0x00, 0x00, // pre_defined
	      0x00, 0x00, // reserved
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00, // pre_defined
	      (track.width & 0xff00) >> 8,
	      track.width & 0xff, // width
	      (track.height & 0xff00) >> 8,
	      track.height & 0xff, // height
	      0x00, 0x48, 0x00, 0x00, // horizresolution
	      0x00, 0x48, 0x00, 0x00, // vertresolution
	      0x00, 0x00, 0x00, 0x00, // reserved
	      0x00, 0x01, // frame_count
	      0x13,
	      0x76, 0x69, 0x64, 0x65,
	      0x6f, 0x6a, 0x73, 0x2d,
	      0x63, 0x6f, 0x6e, 0x74,
	      0x72, 0x69, 0x62, 0x2d,
	      0x68, 0x6c, 0x73, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, // compressorname
	      0x00, 0x18, // depth = 24
	      0x11, 0x11 // pre_defined = -1
	    ]);
			var avcCBox;
	
			if (track.AVCDecoderConfigurationRecord) {
				avcCBox = box(types.avcC, track.AVCDecoderConfigurationRecord);
			} else {
				var sps = track.sps || [],
					pps = track.pps || [],
					sequenceParameterSets = [],
					pictureParameterSets = [],
					i;
	
				// assemble the SPSs
				for (i = 0; i < sps.length; i++) {
					sequenceParameterSets.push((sps[i].byteLength & 0xFF00) >>> 8);
					sequenceParameterSets.push((sps[i].byteLength & 0xFF)); // sequenceParameterSetLength
					sequenceParameterSets = sequenceParameterSets.concat(Array.prototype.slice.call(sps[i])); // SPS
				}
	
				// assemble the PPSs
				for (i = 0; i < pps.length; i++) {
					pictureParameterSets.push((pps[i].byteLength & 0xFF00) >>> 8);
					pictureParameterSets.push((pps[i].byteLength & 0xFF));
					pictureParameterSets = pictureParameterSets.concat(Array.prototype.slice.call(pps[i]));
				}
	
				avcCBox = box(types.avcC, new Uint8Array([
					0x01, // configurationVersion
					track.profileIdc, // AVCProfileIndication
					track.profileCompatibility, // profile_compatibility
					track.levelIdc, // AVCLevelIndication
					0xff // lengthSizeMinusOne, hard-coded to 4 bytes
				].concat([
					sps.length // numOfSequenceParameterSets
				]).concat(sequenceParameterSets).concat([
					pps.length // numOfPictureParameterSets
				]).concat(pictureParameterSets))) // "PPS"
			}
	
			return box(types.avc1, fieldsBuf, avcCBox, box(types.btrt, new Uint8Array([
				0x00, 0x1c, 0x9c, 0x80, // bufferSizeDB
				0x00, 0x2d, 0xc6, 0xc0, // maxBitrate
				0x00, 0x2d, 0xc6, 0xc0 // avgBitrate
			])));
	  };
	
	  audioSample = function(track) {
	    return box(types.mp4a, new Uint8Array([
	
	      // SampleEntry, ISO/IEC 14496-12
	      0x00, 0x00, 0x00,
	      0x00, 0x00, 0x00, // reserved
	      0x00, 0x01, // data_reference_index
	
	      // AudioSampleEntry, ISO/IEC 14496-12
	      0x00, 0x00, 0x00, 0x00, // reserved
	      0x00, 0x00, 0x00, 0x00, // reserved
	      (track.channelcount & 0xff00) >> 8,
	      (track.channelcount & 0xff), // channelcount
	
	      (track.samplesize & 0xff00) >> 8,
	      (track.samplesize & 0xff), // samplesize
	      0x00, 0x00, // pre_defined
	      0x00, 0x00, // reserved
	
	      (track.samplerate & 0xff00) >> 8,
	      (track.samplerate & 0xff),
	      0x00, 0x00 // samplerate, 16.16
	
	      // MP4AudioSampleEntry, ISO/IEC 14496-14
	    ]), esds(track));
	  };
	})();
	
	styp = function() {
	  return box(types.styp, MAJOR_BRAND, MINOR_VERSION, MAJOR_BRAND);
	};
	
	tkhd = function(track) {
	  var result = new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x07, // flags
	    0x00, 0x00, 0x00, 0x00, // creation_time
	    0x00, 0x00, 0x00, 0x00, // modification_time
	    (track.id & 0xFF000000) >> 24,
	    (track.id & 0xFF0000) >> 16,
	    (track.id & 0xFF00) >> 8,
	    track.id & 0xFF, // track_ID
	    0x00, 0x00, 0x00, 0x00, // reserved
	    (track.duration & 0xFF000000) >> 24,
	    (track.duration & 0xFF0000) >> 16,
	    (track.duration & 0xFF00) >> 8,
	    track.duration & 0xFF, // duration
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00, // reserved
	    0x00, 0x00, // layer
	    0x00, 0x00, // alternate_group
	    0x01, 0x00, // non-audio track volume
	    0x00, 0x00, // reserved
	    0x00, 0x01, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x01, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x00, 0x00, 0x00, 0x00,
	    0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
	    (track.width & 0xFF00) >> 8,
	    track.width & 0xFF,
	    0x00, 0x00, // width
	    (track.height & 0xFF00) >> 8,
	    track.height & 0xFF,
	    0x00, 0x00 // height
	  ]);
	
	  return box(types.tkhd, result);
	};
	
	/**
	 * Generate a track fragment (traf) box. A traf box collects metadata
	 * about tracks in a movie fragment (moof) box.
	 */
	traf = function(track) {
	  var trackFragmentHeader, trackFragmentDecodeTime,
	      trackFragmentRun, sampleDependencyTable, dataOffset;
		
		// diff tfhd
		// his:  video.flags=MOV_TFHD_DEFAULT_BASE_IS_MOOF|MOV_TFHD_DEFAULT_FLAGS
		//       video.default_flags=MOV_FRAG_SAMPLE_FLAG_DEPENDS_YES|MOV_FRAG_SAMPLE_FLAG_IS_NON_SYNC
		//       audio.flags=MOV_TFHD_DEFAULT_BASE_IS_MOOF
		//       
		// mine: video.flags=MOV_TFHD_STSD_ID|MOV_TFHD_DEFAULT_DURATION|MOV_TFHD_DEFAULT_SIZE|MOV_TFHD_DEFAULT_FLAGS
		//       audio.flags=MOV_TFHD_STSD_ID|MOV_TFHD_DEFAULT_DURATION|MOV_TFHD_DEFAULT_SIZE|MOV_TFHD_DEFAULT_FLAGS
	
	  trackFragmentHeader = box(types.tfhd, new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x3a,
	    (track.id & 0xFF000000) >> 24,
	    (track.id & 0xFF0000) >> 16,
	    (track.id & 0xFF00) >> 8,
	    (track.id & 0xFF), // track_ID
	    0x00, 0x00, 0x00, 0x01, // sample_description_index
	    0x00, 0x00, 0x00, 0x00, // default_sample_duration
	    0x00, 0x00, 0x00, 0x00, // default_sample_size
	    0x00, 0x00, 0x00, 0x00  // default_sample_flags
	  ]));
	
	  trackFragmentDecodeTime = box(types.tfdt, new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x00, // flags
	    // baseMediaDecodeTime
	    (track.baseMediaDecodeTime >>> 24) & 0xFF,
	    (track.baseMediaDecodeTime >>> 16) & 0xFF,
	    (track.baseMediaDecodeTime >>> 8) & 0xFF,
	    track.baseMediaDecodeTime & 0xFF
	  ]));
	
	  // the data offset specifies the number of bytes from the start of
	  // the containing moof to the first payload byte of the associated
	  // mdat
	  dataOffset = (32 + // tfhd
	                16 + // tfdt
	                8 +  // traf header
	                16 + // mfhd
	                8 +  // moof header
	                8);  // mdat header
	
	  // audio tracks require less metadata
	  if (track.type === 'audio') {
	    trackFragmentRun = trun(track, dataOffset);
	    return box(types.traf,
	               trackFragmentHeader,
	               trackFragmentDecodeTime,
	               trackFragmentRun);
	  }
	
	  // video tracks should contain an independent and disposable samples
	  // box (sdtp)
	  // generate one and adjust offsets to match
	  sampleDependencyTable = sdtp(track);
	  trackFragmentRun = trun(track, sampleDependencyTable.length + dataOffset);
	
	  return box(types.traf,
	             trackFragmentHeader,
	             trackFragmentDecodeTime,
	             trackFragmentRun,
	             sampleDependencyTable);
	};
	
	/**
	 * Generate a track box.
	 * @param track {object} a track definition
	 * @return {Uint8Array} the track box
	 */
	trak = function(track) {
	  track.duration = track.duration || 0xffffffff;
	  return box(types.trak,
	             tkhd(track),
	             mdia(track));
	};
	
	trex = function(track) {
	  var result = new Uint8Array([
	    0x00, // version 0
	    0x00, 0x00, 0x00, // flags
	    (track.id & 0xFF000000) >> 24,
	    (track.id & 0xFF0000) >> 16,
	    (track.id & 0xFF00) >> 8,
	    (track.id & 0xFF), // track_ID
	    0x00, 0x00, 0x00, 0x01, // default_sample_description_index
	    0x00, 0x00, 0x00, 0x00, // default_sample_duration
	    0x00, 0x00, 0x00, 0x00, // default_sample_size
	    0x00, 0x01, 0x00, 0x01 // default_sample_flags
	  ]);
	  // the last two bytes of default_sample_flags is the sample
	  // degradation priority, a hint about the importance of this sample
	  // relative to others. Lower the degradation priority for all sample
	  // types other than video.
	  if (track.type !== 'video') {
	    result[result.length - 1] = 0x00;
	  }
	
	  return box(types.trex, result);
	};
	
	(function() {
	  var audioTrun, videoTrun, trunHeader;
	
	  // This method assumes all samples are uniform. That is, if a
	  // duration is present for the first sample, it will be present for
	  // all subsequent samples.
	  // see ISO/IEC 14496-12:2012, Section 8.8.8.1
	  trunHeader = function(samples, offset) {
	    var durationPresent = 0, sizePresent = 0,
	        flagsPresent = 0, compositionTimeOffset = 0;
	
	    // trun flag constants
	    if (samples.length) {
	      if (samples[0].duration !== undefined) {
	        durationPresent = 0x1;
	      }
	      if (samples[0].size !== undefined) {
	        sizePresent = 0x2;
	      }
	      if (samples[0].flags !== undefined) {
	        flagsPresent = 0x4;
	      }
	      if (samples[0].compositionTimeOffset !== undefined) {
	        compositionTimeOffset = 0x8;
	      }
	    }
	
			// diff trun
			// his:   video.flags=MOV_TRUN(DATA_OFFSET|FIRST_SAMPLE_FLAGS|DURATION|SIZE)
			//        audio.flags=MOV_TRUN(DATA_OFFSET|DURATION|SIZE)
			//        video.firstsampleflags=MOV_FRAG_SAMPLE_FLAG_DEPENDS_NO
			//        audio.firstsampleflags=0
			//        
			// mine:  video.flags=DATA_OFFSET|SAMPLE_FLAGS|DURATION|SIZE
			//        audio.flags=DATA_OFFSET|DURATION|SIZE
	
	    return [
	      0x00, // version 0
	      0x00,
	      durationPresent | sizePresent | flagsPresent | compositionTimeOffset,
	      0x01, // flags
	      (samples.length & 0xFF000000) >>> 24,
	      (samples.length & 0xFF0000) >>> 16,
	      (samples.length & 0xFF00) >>> 8,
	      samples.length & 0xFF, // sample_count
	      (offset & 0xFF000000) >>> 24,
	      (offset & 0xFF0000) >>> 16,
	      (offset & 0xFF00) >>> 8,
	      offset & 0xFF // data_offset
	    ];
	  };
	
	  videoTrun = function(track, offset) {
	    var bytes, samples, sample, i;
	
	    samples = track.samples || [];
	    offset += 8 + 12 + (16 * samples.length);
	
	    bytes = trunHeader(samples, offset);
	
	    for (i = 0; i < samples.length; i++) {
	      sample = samples[i];
	      bytes = bytes.concat([
	        (sample.duration & 0xFF000000) >>> 24,
	        (sample.duration & 0xFF0000) >>> 16,
	        (sample.duration & 0xFF00) >>> 8,
	        sample.duration & 0xFF, // sample_duration
	        (sample.size & 0xFF000000) >>> 24,
	        (sample.size & 0xFF0000) >>> 16,
	        (sample.size & 0xFF00) >>> 8,
	        sample.size & 0xFF, // sample_size
	        (sample.flags.isLeading << 2) | sample.flags.dependsOn,
	        (sample.flags.isDependedOn << 6) |
	          (sample.flags.hasRedundancy << 4) |
	          (sample.flags.paddingValue << 1) |
	          sample.flags.isNonSyncSample,
	        sample.flags.degradationPriority & 0xF0 << 8,
	        sample.flags.degradationPriority & 0x0F, // sample_flags
	        (sample.compositionTimeOffset & 0xFF000000) >>> 24,
	        (sample.compositionTimeOffset & 0xFF0000) >>> 16,
	        (sample.compositionTimeOffset & 0xFF00) >>> 8,
	        sample.compositionTimeOffset & 0xFF // sample_composition_time_offset
	      ]);
	    }
	    return box(types.trun, new Uint8Array(bytes));
	  };
	
	  audioTrun = function(track, offset) {
	    var bytes, samples, sample, i;
	
	    samples = track.samples || [];
	    offset += 8 + 12 + (8 * samples.length);
	
	    bytes = trunHeader(samples, offset);
	
	    for (i = 0; i < samples.length; i++) {
	      sample = samples[i];
	      bytes = bytes.concat([
	        (sample.duration & 0xFF000000) >>> 24,
	        (sample.duration & 0xFF0000) >>> 16,
	        (sample.duration & 0xFF00) >>> 8,
	        sample.duration & 0xFF, // sample_duration
	        (sample.size & 0xFF000000) >>> 24,
	        (sample.size & 0xFF0000) >>> 16,
	        (sample.size & 0xFF00) >>> 8,
	        sample.size & 0xFF]); // sample_size
	    }
	
	    return box(types.trun, new Uint8Array(bytes));
	  };
	
	  trun = function(track, offset) {
	    if (track.type === 'audio') {
	      return audioTrun(track, offset);
	    } else {
	      return videoTrun(track, offset);
	    }
	  };
	})();
	
	module.exports = {
		FLAGS: FLAGS,
	  ftyp: ftyp,
	  mdat: mdat,
	  moof: moof,
	  moov: moov,
		timeScale: 90000,
	  initSegment: function(tracks, duration) {
	    var
	      fileType = ftyp(),
	      movie = moov(tracks, duration),
	      result;
	
	    result = new Uint8Array(fileType.byteLength + movie.byteLength);
	    result.set(fileType);
	    result.set(movie, fileType.byteLength);
	    return result;
	  }
	};
	


/***/ },
/* 4 */
/*!*****************!*\
  !*** ./http.js ***!
  \*****************/
/***/ function(module, exports) {

	
	exports.fetch = (url, opts) => {
		opts = opts || {};
		var retries = opts.retries;
	
		if (retries) {
			return new Promise(function(resolve, reject) {
				var wrappedFetch = function(n) {
					fetch(url, opts).then(function(res) {
						if (!(res.status >= 200 && res.status < 300)) {
							if (n > 0) {
								setTimeout(function() {
									wrappedFetch(--n);
								}, 1000);
							} else {
								reject(new Error('try to death'));
							}
						} else {
							resolve(res);
						}
					}).catch(reject);
				}
				wrappedFetch(retries);
			});
		}
	
		return fetch(url, opts);
	};
	


/***/ },
/* 5 */
/*!******************************!*\
  !*** ./~/nanobar/nanobar.js ***!
  \******************************/
/***/ function(module, exports, __webpack_require__) {


/***/ },
/* 6 */
/*!*********************!*\
  !*** ./bilibili.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

/***/ },
/* 7 */
/*!*********************************!*\
  !*** ./~/blueimp-md5/js/md5.js ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

/***/ },
/* 8 */
/*!******************!*\
  !*** ./youku.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

/***/ },
/* 9 */
/*!********************************!*\
  !*** ./~/querystring/index.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.decode = exports.parse = __webpack_require__(/*! ./decode */ 10);
	exports.encode = exports.stringify = __webpack_require__(/*! ./encode */ 11);


/***/ },
/* 10 */
/*!*********************************!*\
  !*** ./~/querystring/decode.js ***!
  \*********************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	
	module.exports = function(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};
	
	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }
	
	  var regexp = /\+/g;
	  qs = qs.split(sep);
	
	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }
	
	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }
	
	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;
	
	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }
	
	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);
	
	    if (!hasOwnProperty(obj, k)) {
	      obj[k] = v;
	    } else if (Array.isArray(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }
	
	  return obj;
	};


/***/ },
/* 11 */
/*!*********************************!*\
  !*** ./~/querystring/encode.js ***!
  \*********************************/
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	'use strict';
	
	var stringifyPrimitive = function(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;
	
	    case 'boolean':
	      return v ? 'true' : 'false';
	
	    case 'number':
	      return isFinite(v) ? v : '';
	
	    default:
	      return '';
	  }
	};
	
	module.exports = function(obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }
	
	  if (typeof obj === 'object') {
	    return Object.keys(obj).map(function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (Array.isArray(obj[k])) {
	        return obj[k].map(function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);
	
	  }
	
	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	};


/***/ }
/******/ ]);