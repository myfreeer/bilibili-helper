/******/ (function(modules) { // webpackBootstrap
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
	
	let localhost = 'http://localhost:6060/'
	
	let mediaSource = __webpack_require__(/*! ./mediaSource */ 1);
	let Nanobar = __webpack_require__(/*! nanobar */ 5);
	let bilibili = __webpack_require__(/*! ./bilibili */ 6);
	let youku = __webpack_require__(/*! ./youku */ 8);
	let tudou = __webpack_require__(/*! ./tudou */ 12);
	let createPlayer = __webpack_require__(/*! ./player */ 13);
	let flashBlocker = __webpack_require__(/*! ./flashBlocker */ 14);
	let flvdemux = __webpack_require__(/*! ./flvdemux */ 2);
	let FastDamoo = __webpack_require__(/*! ./damoo */ 15);
	
	let nanobar = new Nanobar();
	
	let style = document.createElement('style');
	let themeColor = '#DF6558';
	
	style.innerHTML = `
	.nanobar .bar {
		background: ${themeColor};
	}
	.nanobar {
		z-index: 1000001;
		left: 0px;
		top: 0px;
	}
	`
	
	document.head.appendChild(style);
	mediaSource.debug = true;
	
	let getSeeker = url => {
		let seekers = [bilibili];
		let found = seekers.filter(s => s.testUrl(url));
		return found[0];
	}
	
	let playVideo = res => {
		let player;
		if (document.getElementById('bilibili_helper_html5_player_video')) {
		    let v = document.getElementById('bilibili_helper_html5_player_video');
		    v.parentNode.video = v;
		    player = v.parentNode;
		} else {
		    player = createPlayer();
		}
		console.log(player);
		let media = mediaSource.bindVideo({
			video:player.video,
			src:res.src,
			duration:res.duration,
		});
			console.log({
			video:player.video,
			src:res.src,
			duration:res.duration,
		});
			console.log(media)
		player.streams = media.streams;
		console.log(player);
		return {player, media};
	}
	
	let handleDamoo = (vres, player, seeker, media) => {
		let mode;
		if (seeker.getAllDamoo) {
			mode = 'all';
		} else if (seeker.getDamooProgressive) {
			mode = 'progressive';
		}
	
		if (!mode)
			return;
	
		let damoos = [];
	
		(() => {
			if (mode == 'all') {
				return seeker.getAllDamoo(vres).then(res => {
					damoos = res;
				});
			} else if (mode == 'progressive') {
				return new Promise((fulfill, reject) => {
					seeker.getDamooProgressive(vres, res => {
						damoos = damoos.concat(res);
						//console.log(`damoo: loaded n=${damoos.length}`);
						fulfill();
					})
				});
			}
		})().then(() => {
			let video = player.video;
			let updating;
			let cur = 0;
			let emitter;
	
			let update = () => {
				let time = video.currentTime+1.0;
				if (cur < damoos.length && time > damoos[cur].time) {
					for (; cur < damoos.length && damoos[cur].time <= time; cur++) {
						let d = damoos[cur];
						//console.log('damoo: emit', `${Math.floor(d.time/60)}:${Math.floor(d.time%60)}`, d.text);
						emitter.emit({text: d.text, pos: d.pos, shadow: {color: '#000'}, color: d.color});
					}
				}
				updating = setTimeout(update, 1000);
			};
			let stopUpdate = () => {
				if (updating) {
					clearTimeout(updating);
					updating = null;
				}
			}
			let startUpdate = () => {
				if (!updating)
					update();
			}
	
			let resetCur = () => {
				let time;
				for (cur = 0; cur < damoos.length; cur++) {
					if (damoos[cur].time > video.currentTime) {
						time = damoos[cur].time;
						break;
					}
				}
				console.log(`damoo: cur=${cur}/${damoos.length} time=${time}`);
			}
	
			media.onSeek.push(() => {
				emitter.clear();
				resetCur();
			})
	
			player.onResume.push(() => {
				if (emitter == null) {
		 			emitter = new FastDamoo({container:player.damoo, fontSize:20});
					let setDamooOpts = () => {
						player.damoo.style.opacity = player.damooOpacity;
						if (player.damooEnabled) {
							emitter.show();
						} else {
							emitter.hide();
						}
					}
					player.onDamooOptsChange.push(() => setDamooOpts());
					setDamooOpts();
				}
				emitter.synctime(video.currentTime);
				emitter.resume()
				startUpdate();
			});
			player.onSuspend.push(() => {
				emitter.synctime(video.currentTime);
				emitter.suspend()
				stopUpdate();
			});
	
		});
	}
	
	let playUrl = url => {
		return new Promise((fulfill, reject) => {
			let seeker = getSeeker(url)
			if (seeker) {
				flashBlocker();
				nanobar.go(30);
				seeker.getVideos(url).then(res => {
					console.log('getVideosResult:', res);
					if (res) {
						if (res.src.length == 1 && res.src[0].match('mp4')) return false;
						let ctrl = playVideo(res);
						ctrl.player.onStarted.push(() => nanobar.go(100));
						handleDamoo(res, ctrl.player, seeker, ctrl.media);
						nanobar.go(60)
						fulfill(ctrl);
					} else {
						throw new Error('getVideosResult: invalid')
					}
				}).catch(e => {
					nanobar.go(100);
					throw e;
				});
			} else {
				throw new Error('seeker not found');
			}
		});
	}
	
	let cmd = {};
	
	cmd.bilibili = bilibili;
	
	cmd.testInitSegment = () => {
		let dbp = console.log.bind(console)
	
		let meta;
		let fetchseg = seg => {
			return fetch(localhost+'test-fragmented.mp4', {headers: {
				Range: `bytes=${seg.offset}-${seg.offset+seg.size-1}`,
			}}).then(res=>res.arrayBuffer());
		}
	
		fetch(localhost+'test-fragmented-manifest.json').then(res=>res.json()).then(res => {
			meta = res;
			dbp('meta', meta);
		}).then(res => {
			res = new Uint8Array(res);
	
			let mediaSource = new MediaSource();
			let video = document.createElement('video');
			document.body.appendChild(video);
	
			video.src = URL.createObjectURL(mediaSource);
			video.autoplay = true;
	
			video.addEventListener('loadedmetadata', () => {
				dbp('loadedmetadata', video.duration);
			});
	
			let sourceBuffer;
			mediaSource.addEventListener('sourceopen', e => {
				dbp('sourceopen');
				if (mediaSource.sourceBuffers.length > 0)
					return;
				let codecType = meta.type;
				sourceBuffer = mediaSource.addSourceBuffer(codecType);
				sourceBuffer.mode = 'sequence';
				sourceBuffer.addEventListener('error', () => dbp('sourceBuffer: error'));
				sourceBuffer.addEventListener('abort', () => dbp('sourceBuffer: abort'));
				sourceBuffer.addEventListener('update', () => {
					dbp('sourceBuffer: update');
				})
				sourceBuffer.addEventListener('updateend', () => {
					let ranges = [];
					let buffered = sourceBuffer.buffered;
					for (let i = 0; i < buffered.length; i++) {
						ranges.push([buffered.start(i), buffered.end(i)]);
					}
					dbp('sourceBuffer: updateend');
					dbp('buffered', JSON.stringify(ranges), 'duration', video.duration);
				});
				fetchseg(meta.init).then(() => {
					sourceBuffer.appendBuffer(res);
					return fetchseg(meta.media[1]).then(res => {
						dbp(res.byteLength);
						sourceBuffer.appendBuffer(res);
					});
				});
			})
			mediaSource.addEventListener('sourceended', () => dbp('mediaSource: sourceended'))
			mediaSource.addEventListener('sourceclose', () => dbp('mediaSource: sourceclose'))
		}).catch(e => {
			console.error(e);
		});
	}
	
	if (location.href.substr(0,6) != 'chrome') {
		playUrl(location.href);
	} else {
		window.cmd = cmd;
	}
	


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
					opts.mode='cors';
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

	/* http://nanobar.micronube.com/  ||  https://github.com/jacoborus/nanobar/    MIT LICENSE */
	(function (root) {
	  'use strict'
	  // container styles
	  var css = '.nanobar{width:100%;height:4px;z-index:9999;top:0}.bar{width:0;height:100%;transition:height .3s;background:#000}'
	
	  // add required css in head div
	  function addCss () {
	    var s = document.getElementById('nanobarcss')
	
	    // check whether style tag is already inserted
	    if (s === null) {
	      s = document.createElement('style')
	      s.type = 'text/css'
	      s.id = 'nanobarcss'
	      document.head.insertBefore(s, document.head.firstChild)
	      // the world
	      if (!s.styleSheet) return s.appendChild(document.createTextNode(css))
	      // IE
	      s.styleSheet.cssText = css
	    }
	  }
	
	  function addClass (el, cls) {
	    if (el.classList) el.classList.add(cls)
	    else el.className += ' ' + cls
	  }
	
	  // create a progress bar
	  // this will be destroyed after reaching 100% progress
	  function createBar (rm) {
	    // create progress element
	    var el = document.createElement('div'),
	        width = 0,
	        here = 0,
	        on = 0,
	        bar = {
	          el: el,
	          go: go
	        }
	
	    addClass(el, 'bar')
	
	    // animation loop
	    function move () {
	      var dist = width - here
	
	      if (dist < 0.1 && dist > -0.1) {
	        place(here)
	        on = 0
	        if (width === 100) {
	          el.style.height = 0
	          setTimeout(function () {
	            rm(el)
	          }, 300)
	        }
	      } else {
	        place(width - dist / 4)
	        setTimeout(go, 16)
	      }
	    }
	
	    // set bar width
	    function place (num) {
	      width = num
	      el.style.width = width + '%'
	    }
	
	    function go (num) {
	      if (num >= 0) {
	        here = num
	        if (!on) {
	          on = 1
	          move()
	        }
	      } else if (on) {
	        move()
	      }
	    }
	    return bar
	  }
	
	  function Nanobar (opts) {
	    opts = opts || {}
	    // set options
	    var el = document.createElement('div'),
	        applyGo,
	        nanobar = {
	          el: el,
	          go: function (p) {
	            // expand bar
	            applyGo(p)
	            // create new bar when progress reaches 100%
	            if (p === 100) {
	              init()
	            }
	          }
	        }
	
	    // remove element from nanobar container
	    function rm (child) {
	      el.removeChild(child)
	    }
	
	    // create and insert progress var in nanobar container
	    function init () {
	      var bar = createBar(rm)
	      el.appendChild(bar.el)
	      applyGo = bar.go
	    }
	
	    addCss()
	
	    addClass(el, 'nanobar')
	    if (opts.id) el.id = opts.id
	    if (opts.classname) addClass(el, opts.classname)
	
	    // insert container
	    if (opts.target) {
	      // inside a div
	      el.style.position = 'relative'
	      opts.target.insertBefore(el, opts.target.firstChild)
	    } else {
	      // on top of the page
	      el.style.position = 'fixed'
	      document.getElementsByTagName('body')[0].appendChild(el)
	    }
	
	    init()
	    return nanobar
	  }
	
	  if (true) {
	    // CommonJS
	    module.exports = Nanobar
	  } else if (typeof define === 'function' && define.amd) {
	    // AMD. Register as an anonymous module.
	    define([], Nanobar)
	  } else {
	    // Browser globals
	    root.Nanobar = Nanobar
	  }
	}(this))


/***/ },
/* 6 */
/*!*********************!*\
  !*** ./bilibili.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	
	var md5 = __webpack_require__(/*! blueimp-md5 */ 7);
	const SECRETKEY_MINILOADER = '1c15888dc316e05a15fdd0a02ed6584f';
	let interfaceUrl = (cid, ts) => `cid=${cid}&player=1&ts=${ts}`;
	let calcSign = (cid, ts) => md5(`${interfaceUrl(cid,ts)}${SECRETKEY_MINILOADER}`);
	
	exports.calcSign = calcSign;
	exports.testUrl = url => url.match('bilibili.com/')
	
	exports.getVideos = (url) => {
		return fetch(url, {credentials: 'include'}).then(res => res.text()).then(res => {
			let cid = res.match(/cid=(\d+)/);
			if (cid)
				return cid[1];
		}).then(function(cid) {
			if (!cid)
				return;
	
			let ts = Math.ceil(Date.now()/1000)
			return fetch(`http://interface.bilibili.com/playurl?${interfaceUrl(cid,ts)}&sign=${calcSign(cid,ts)}`)
			.then(res => res.text()).then(res => {
				let parser = new DOMParser();
				let doc = parser.parseFromString(res, 'text/xml');
				let array = x => Array.prototype.slice.call(x);
				let duration = 0.0;
				array(doc.querySelectorAll('durl > length')).forEach(len => duration += +len.textContent);
				let src = array(doc.querySelectorAll('durl > url')).map(url => url.textContent );
				return {
					duration: duration/1000.0,
					src: src,
					commentUrl: 'http://comment.bilibili.com/'+cid+'.xml',
				}
			})
		});
	}
	
	function pad(num, n) { 
		if (num.length >= n)
			return num;
		return (Array(n).join(0) + num).slice(-n)
	}
	let colorDec2Hex = (x) => '#'+pad((x||0).toString(16), 6)
	exports.colorDec2Hex = colorDec2Hex;
	
	let getDamooRaw = url => {
		return fetch(url).then(res => res.text()).then(res => {
			let parser = new DOMParser();
			let doc = parser.parseFromString(res, 'text/xml');
			let array = x => Array.prototype.slice.call(x);
			return array(doc.querySelectorAll('i > d')).map((d, i) => {
				let p = d.getAttribute('p').split(',');
				if (p[5] == 2)
					return;
				let pos;
				switch (+p[1]) {
					case 4: pos = 'bottom'; break;
					case 5: pos = 'top'; break;
				}
				//console.log(p[1], d.textContent);
				return {time: parseFloat(p[0]), pos, color:colorDec2Hex(+p[3]), text: d.textContent};
			}).filter(x => x).sort((a,b) => a.time-b.time);
			return arr;
		})
	}
	exports.getDamooRaw = getDamooRaw;
	
	exports.getAllDamoo = (res) => {
		return getDamooRaw(res.commentUrl);
	}
	


/***/ },
/* 7 */
/*!*********************************!*\
  !*** ./~/blueimp-md5/js/md5.js ***!
  \*********************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/*
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
	    for (i = 0; i < input.length * 32; i += 8) {
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
	    for (i = 0; i < input.length * 8; i += 8) {
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
	
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return md5
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
	  } else if (typeof module === 'object' && module.exports) {
	    module.exports = md5
	  } else {
	    $.md5 = md5
	  }
	}(this))


/***/ },
/* 8 */
/*!******************!*\
  !*** ./youku.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

	/*  youku 
	 *  @朱一
	 */
	

/***/ },
/* 9 */
/*!********************************!*\
  !*** ./~/querystring/index.js ***!
  \********************************/
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	

/***/ },
/* 10 */
/*!*********************************!*\
  !*** ./~/querystring/decode.js ***!
  \*********************************/
/***/ function(module, exports) {


/***/ },
/* 11 */
/*!*********************************!*\
  !*** ./~/querystring/encode.js ***!
  \*********************************/
/***/ function(module, exports) {


/***/ },
/* 12 */
/*!******************!*\
  !*** ./tudou.js ***!
  \******************/
/***/ function(module, exports, __webpack_require__) {

/***/ },
/* 13 */
/*!*******************!*\
  !*** ./player.js ***!
  \*******************/
/***/ function(module, exports) {

	
	module.exports = () => {
		let div = document.createElement('div');
		let damoo = document.createElement('div');
		let video = document.createElement('video');
	
		let toolbar = document.createElement('div');
		toolbar.className = 'mama-toolbar';
		toolbar.innerHTML += `<input class="damoo-input" type="range" />` 
		toolbar.innerHTML += `<svg version="1.1" 
			class="damoo" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
			viewBox="0 0 60 60" style="enable-background:new 0 0 60 60;" xml:space="preserve">
			<path d="M6,2h48c3.252,0,6,2.748,6,6v33c0,3.252-2.748,6-6,6H25.442L15.74,57.673C15.546,57.885,15.276,58,15,58
				c-0.121,0-0.243-0.022-0.361-0.067C14.254,57.784,14,57.413,14,57V47H6c-3.252,0-6-2.748-6-6L0,8C0,4.748,2.748,2,6,2z"/>
			</svg>
		`;
		toolbar.style.display = 'none';
		//document.body.style.background = '#000';
	
		div.appendChild(toolbar);
		div.appendChild(video);
		div.appendChild(damoo);
	
		//div.style.background = '#000';
		//div.style.position = 'fixed';
		div.style.top = '0px';
		div.style.left = '0px';
		div.style.zIndex = '1000000';
	
		damoo.style.position = 'absolute';
		damoo.style.pointerEvents = 'none';
		//damoo.style.overflow = 'hidden';
		damoo.style.top = '0px';
		damoo.style.left = '0px';
	
		//video.autoplay = true;
		video.controls = true;
		//video.style.position = 'absolute';
		video.style.display = 'none';
		//console.log(localStorage);
		video.volume=localStorage.getItem('mama-hd-volume')||0.3;
video.onvolumechange = function() {localStorage.setItem('mama-hd-volume', video.volume)};
	
		function debounce(start, end, interval) {
			var timer;
			return function() {
				var context = this, args = arguments;
				var later = function() {
					timer = null;
					end.apply(context, args);
				};
				if (timer) {
					clearTimeout(timer);
				} else {
					start.apply(context, args);
				}
				timer = setTimeout(later, interval);
			};
		};
	
		div.addEventListener('mousemove', debounce(() => {
			div.style.cursor = 'default';
			toolbar.style.display = 'flex';
		}, () => {
			div.style.cursor = 'none';
			toolbar.style.display = 'none';
		}, 300));
	
		let self = {
			video, damoo, div,
			onStarted:[], onSuspend:[], onResume:[],
			damooEnabled:true,
			damooOpacity:1.0,
			onDamooOptsChange:[],
		};
	
		let resize = () => {
			let windowRatio = window.innerHeight/window.innerWidth;
			let videoRatio = video.videoHeight/video.videoWidth;
			if (videoRatio > windowRatio) {
				//let width = window.innerHeight/videoRatio;
				video.style.height = '100%';
				video.style.width = '100%';
				//video.style.left = (window.innerWidth-width)/2+'px';
				//video.style.top = '0px';
			} else {
				//let height = window.innerWidth*videoRatio;
				video.style.width = '100%';
				video.style.height = '100%';
				//video.style.top = (window.innerHeight-height)/2+'px';
				//video.style.left = '0px';
			}
			damoo.style.width = video.style.width;
			damoo.style.height = video.style.height;
			//div.style.height = window.innerHeight+'px';
			//div.style.width = window.innerWidth+'px';
		}
	
		let onStarted = () => {
			video.style.display = 'block';
			video.removeEventListener('canplay', onStarted);
			resize();
			self.onStarted.forEach(cb => cb());
		}
		video.addEventListener('canplay', onStarted);
	
		let toggleFullScreen = () => {
			if (!document.webkitFullscreenElement) {
				div.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
			} else {
				document.webkitCancelFullScreen();
			}
		}
	
		let togglePlayPause;
		{
			let playing = false;
			let timer;
	
			let setToPaused = () => {
				if (playing) {
					playing = false;
					console.log('player: suspend');
					self.onSuspend.forEach(x => x());
				}
			}
	
			let setToPlaying = () => {
				if (!playing) {
					playing = true;
					console.log('player: resume');
					self.onResume.forEach(x => x());
				}
			}
	
			video.addEventListener('timeupdate', () => {
				if (video.paused)
					return;
				setToPlaying();
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(() => {
					setToPaused();
					timer = null;
				}, 1000);
			});
	
			togglePlayPause = () => {
				resize();
				if (video.paused) {
					video.play();
				} else {
					video.pause();
					setToPaused();
				}
			}
		}
	
		video.addEventListener('mousedown', () => {
			togglePlayPause();
		})
	
		let seekDelta = 5.0;
		let getSeekTime = (delta) => {
			let inc = delta>0?1:-1;
			let index = self.streams.findIndexByTime(video.currentTime);
			let keyframes = self.streams.keyframes;
			for (let i = index; i >= 0 && i < keyframes.length; i += inc) {
				let e = keyframes[i];
				if (Math.abs(e.timeStart-video.currentTime) > Math.abs(delta)) {
					index = i;
					break;
				}
			}
			let time = self.streams.keyframes[index].timeStart;
			video.currentTime = time;
		};
		let seekBack = () => {
			video.currentTime = getSeekTime(-seekDelta);
		}
		let seekForward = () => {
			video.currentTime = getSeekTime(seekDelta);
		}
	
		let volumeDelta = 0.2;
		let volumeUp = () => {
			if (video.muted) {
				video.muted = false;
				video.volume = 0.0;
			}
			video.volume = Math.min(1.0, video.volume+volumeDelta);
		}
		let volumeDown = () => {
			video.volume = Math.max(0, video.volume-volumeDelta);
		}
	
		let toggleMute = () => {
			video.muted = !video.muted;
		}
	
		let toggleDamoo;
		{
			let btn = toolbar.querySelector('.damoo');
			let input = toolbar.querySelector('.damoo-input');
			input.min = 0;
			input.max = 1;
			input.step = 0.01;
			input.value = self.damooOpacity;
			if (self.damooEnabled) {
				btn.classList.add('selected');
				input.style.display = 'block';
			} else {
				input.style.display = 'none';
			}
			toggleDamoo = () => {
				btn.classList.toggle('selected');
				self.damooEnabled = !self.damooEnabled;
				if (self.damooEnabled) {
					input.style.display = 'block';
				} else {
					input.style.display = 'none';
				}
				self.onDamooOptsChange.forEach(x => x());
			}
			btn.addEventListener('click', () => {
				toggleDamoo();
			});
			input.addEventListener('change', () => {
				self.damooOpacity = input.value;
				self.onDamooOptsChange.forEach(x => x());
			});
		}
	
		document.body.addEventListener('keydown', (e) => {
			switch (e.code) {
				case "Space": {
					togglePlayPause();
					e.preventDefault();
				} break;
	
				case "ArrowUp": {
					volumeUp();
					e.preventDefault();
				} break;
	
				case "KeyD": {
					toggleDamoo();
					e.preventDefault();
				} break;
	
				case "KeyM": {
					toggleMute();
					e.preventDefault();
				} break;
	
				case "ArrowDown": {
					volumeDown();
					e.preventDefault();
				} break;
	
				case "ArrowLeft": {
					seekBack();
					e.preventDefault();
				} break;
	
				case "ArrowRight": {
					seekForward();
					e.preventDefault();
				} break;
	
				case "Enter": {
					if (e.metaKey || e.ctrlKey) {
						toggleFullScreen();
						e.preventDefault();
					}
				} break;
			}
	
		});
	
		//document.body.style.margin = 0;
		if(location.href.match("bilibili.com/video")){
			document.getElementById('bofqi').innerHTML='';
			console.log(document.getElementById('bofqi').appendChild(div));
			//resize();
	}else  if(location.href.match("v.youku.com")||location.href.match("tudou.com")){
			document.getElementById('player').innerHTML='';
			document.getElementById('player').appendChild(div);
	}else {document.body.appendChild(div);
};
resize();
		window.addEventListener('resize', resize);
		video.addEventListener('resize', resize);
		return self;
	}
	


/***/ },
/* 14 */
/*!*************************!*\
  !*** ./flashBlocker.js ***!
  \*************************/
/***/ function(module, exports) {

	/*  
	 *  用于屏蔽页面上的所有flash
	 */
	var flashText = '<div style="text-shadow:0 0 2px #eee;letter-spacing:-1px;background:#eee;font-weight:bold;padding:0;font-family:arial,sans-serif;font-size:30px;color:#ccc;width:152px;height:52px;border:4px solid #ccc;border-radius:12px;position:absolute;top:50%;left:50%;margin:-30px 0 0 -80px;text-align:center;line-height:52px;">Flash</div>';
	
	var count = 0;
	var flashBlocks = {};
	//点击时间触发
	var click2ShowFlash = function(e){
	  var index = this.getAttribute('data-flash-index');
	  var flash = flashBlocks[index];
	  flash.setAttribute('data-flash-show','isshow');
	  this.parentNode.insertBefore(flash, this);
	  this.parentNode.removeChild(this);
	  this.removeEventListener('click', click2ShowFlash, false);
	};
	
	var createAPlaceHolder = function(flash, width, height){
	  var index = count++;
	  var style = document.defaultView.getComputedStyle(flash, null);
	  var positionType = style.position;
	    positionType = positionType === 'static' ? 'relative' : positionType;
	  var margin       = style['margin'];
	  var display      = style['display'] == 'inline' ? 'inline-block' : style['display'];
	  var style = [
	    '',
	    'width:'    + width  +'px',
	    'height:'   + height +'px',
	    'position:' + positionType,
	    'margin:'   + margin,
	    'display:'  + display,
	    'margin:0',
	    'padding:0',
	    'border:0',
	    'border-radius:1px',
	    'cursor:pointer',
	    'background:-webkit-linear-gradient(top, rgba(240,240,240,1)0%,rgba(220,220,220,1)100%)',     
	    ''
	  ]
	  flashBlocks[index] = flash;
	  var placeHolder = document.createElement('div');
	  placeHolder.setAttribute('title', '&#x70B9;&#x6211;&#x8FD8;&#x539F;Flash');
	  placeHolder.setAttribute('data-flash-index', '' + index);
	  flash.parentNode.insertBefore(placeHolder, flash);
	  flash.parentNode.removeChild(flash);
	  placeHolder.addEventListener('click', click2ShowFlash, false);
	  placeHolder.style.cssText += style.join(';');
	  placeHolder.innerHTML = flashText;
	  return placeHolder;
	};
	
	var parseFlash = function(target){
	  if(target instanceof HTMLObjectElement) {
	    if(target.innerHTML.trim() == '') return;
	    if(target.getAttribute("classid") && !/^java:/.test(target.getAttribute("classid"))) return;      
	  } else if(!(target instanceof HTMLEmbedElement)) return;
	
	  var width = target.offsetWidth;
	  var height = target.offsetHeight;
	
	  if(width > 160 && height > 60){
	    createAPlaceHolder(target, width, height);
	  }
	};
	
	var handleBeforeLoadEvent = function(e){
	  var target = e.target
	  if(target.getAttribute('data-flash-show') == 'isshow') return;
	  parseFlash(target);
	};
	
	module.exports = function() { 
	  var embeds = document.getElementsByTagName('embed');
	  var objects = document.getElementsByTagName('object');
	  for(var i=0,len=objects.length; i<len; i++) objects[i] && parseFlash(objects[i]);
	  for(var i=0,len=embeds.length; i<len; i++)  embeds[i] && parseFlash(embeds[i]);
	
		// see: http://www.bilibili.com/video/av135433/index_4.html
		Array.prototype.slice.call(
			document.querySelectorAll('iframe.player[src^="https://secure.bilibili.com"]')
		).forEach(x => createAPlaceHolder(x, x.offsetWidth, x.offsetHeight));
	}
	// document.addEventListener("beforeload", handleBeforeLoadEvent, true);


/***/ },
/* 15 */
/*!******************!*\
  !*** ./damoo.js ***!
  \******************/
/***/ function(module, exports) {

	/*!
	 * Damoo - HTML5 Danmaku Engine v2.1.9
	 * https://github.com/jamesliu96/Damoo
	 *
	 * Copyright (c) 2015-2016 James Liu
	 * Released under the MIT license
	 */
	
	var Damoo = function({container, fontSize, fontFamily}) {
		fontFamily = fontFamily || 'Arial';
		this.canvas = new Canvas(container, fontSize, fontFamily);
		this.thread = new Thread(() => Math.floor(container.offsetHeight/fontSize-4));
	};
	
	var _preload = function(d, f) {
		var cvs = document.createElement('canvas');
		var ctx = cvs.getContext('2d');
		ctx.font = f;
		cvs.width = ctx.measureText(d.text).width;
		cvs.height = f.size * 1.5;
		ctx.font = f;
		ctx.textAlign = "start";
		ctx.textBaseline = "top";
		let shadow = d.shadow || {color: '#000'};
		if (shadow) {
			ctx.shadowOffsetX = 1;
			ctx.shadowOffsetY = 1;
			ctx.shadowColor = shadow.color;
		}
		ctx.fillStyle = "#fff";
		ctx.fillStyle = d.color;
		ctx.fillText(d.text, 0, 0);
		return cvs;
	};
	
	var _RAF = function(cb) { return setTimeout(cb, 1000/10) };
	var _CAF = function(id) { clearTimeout(id); };
	
	Damoo.prototype.curtime = function() {
		if (this._curtimeBase) {
			return this._curtimeBase+(Date.now()-this._curtimeStart)/1e3;
		}
		return Date.now()/1e3;
	}
	
	Damoo.prototype.emit = function(d) {
		if (!this.visible)
			return;
	
		if ("string" === typeof d) {
			d = { text: d };
		}
		var cvs = _preload(d, this.canvas.font);
	
		var fixed;
		var index;
		if (d.pos == 'top') {
			fixed = true;
			index = this.thread.allocFixedIndex(1);
		} else if (d.pos == 'bottom') {
			fixed = true;
			index = this.thread.allocFixedIndex(-1);
		} else {
			index = this.thread.allocIndex();
		}
	
		this.thread.push({
			canvas: cvs,
			fixed, index,
			pos: d.pos,
			displaytime: d.time || (fixed ? 5 : 10),
			timestart: this.curtime(),
			y: this.canvas.font.size*index,
		});
		return this;
	};
	
	Damoo.prototype.render = function() {
		var time = this.curtime();
	
		this.canvas.clear();
		this.thread.forEach(d => {
			var elapsed = time-d.timestart;
			if (elapsed > d.displaytime) {
				this.thread.remove(d);
				return;
			}
			var x;
			if (d.fixed) {
				x = (this.canvas.width-d.canvas.width)/2;
			} else {
				var w = this.canvas.width+d.canvas.width;
				x = this.canvas.width-w*(elapsed/d.displaytime);
			}
			this.canvas.context.drawImage(d.canvas, x, d.y);
		});
		this._afid = _RAF(() => this.render());
	}
	
	Damoo.prototype.clear = function() {
		this.thread.empty();
	};
	
	Damoo.prototype.updateState = function() {
		if (this.playing && this.visible) {
			if (this._afid == null) {
				this.render();
			}
		} else {
			if (this._afid) {
				_CAF(this._afid);
				this._afid = null;
			}
		}
	}
	
	Damoo.prototype.synctime = function(time) {
		this._curtimeBase = time;
		this._curtimeStart = Date.now();
	}
	
	Damoo.prototype.suspend = function() {
		if (this.playing) {
			this.playing = false;
			this.updateState();
		}
	};
	
	Damoo.prototype.resume = function() {
		if (!this.playing) {
			this.playing = true;
			this.updateState();
		}
	};
	
	Damoo.prototype.show = function() {
		if (!this.visible) {
			this.visible = true;
			this.canvas.container.appendChild(this.canvas.layer);
			this.updateState();
		}
	};
	
	Damoo.prototype.hide = function() {
		if (this.visible) {
			this.visible = false;
			this.canvas.container.removeChild(this.canvas.layer);
			this.updateState();
		}
	};
	
	var Canvas = function(container, fontSize, fontFamily) {
		this.container = container;
		this.font = new Font(fontSize, fontFamily);
		this.layer = document.createElement('canvas');
		this.layer.style.position = 'absolute';
		this.layer.style.left = 0;
		this.layer.style.top = 0;
		this.context = this.layer.getContext('2d');
		let resize = () => {
			this.width = container.offsetWidth;
			this.height = container.offsetHeight;
			this.layer.width = this.width;
			this.layer.height = this.height;
		}
		window.addEventListener('resize', resize);
		resize();
	};
	
	Canvas.prototype.clear = function() {
		this.context.clearRect(0, 0, this.width, this.height);
	};
	
	var Font = function(s, f) {
		this.size = s;
		this.family = f || "sans-serif";
	};
	
	Font.prototype.toString = function() {
		return this.size + "px " + this.family;
	};
	
	var Thread = function(rows) {
		this.rows = rows;
		this.empty();
	};
	
	Thread.prototype.allocFixedIndex = function(inc) {
		var n = this.rows();
		if (inc > 0) {
			if (this.fixedTop > n) {
				this.fixedTop = 0;
			}
			return this.fixedTop++;
		} else {
			if (this.fixedBottom > n || this.fixedBottom < 0) {
				this.fixedBottom = n;
			}
			return this.fixedBottom--;
		}
	};
	
	Thread.prototype.allocIndex = function() {
		if (this.index >= this.rows()) {
			this.index = 0;
		}
		return this.index++;
	};
	
	Thread.prototype.push = function(d) {
		this.pool.add(d);
	};
	
	Thread.prototype.forEach = function(fn) {
		this.pool.forEach(fn);
	};
	
	Thread.prototype.remove = function(d) {
		if (d.pos == 'top') {
			if (d.index < this.fixedTop) {
				this.fixedTop = d.index;
			}
		} else if (d.pos == 'bottom') {
			if (d.index > this.fixedBottom) {
				this.fixedBottom = d.index;
			}
		} else {
			if (d.index < this.index) {
				this.index = d.index;
			}
		}
		this.pool.delete(d);
	};
	
	Thread.prototype.empty = function() {
		this.index = 0;
		this.fixedTop = 0;
		this.fixedBottom = this.rows();
		this.pool = new Set();
	};
	
	module.exports = Damoo;
	


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map