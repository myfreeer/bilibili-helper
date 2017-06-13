import {_$} from './utils';
import sendComment from './sendComment';
const restartVideo = (video) => !video.paused && !video.pause() && !video.play();

class PlayerSwitcher {
    constructor(avid, cid, page, videoPic, options, optionsChangeCallback, switcherSection, speedSection, originalPlayerHTML) {
        this.avid = avid;
        this.cid = cid;
        this.page = page;
        this.videoPic = videoPic;
        this.options = options;
        this.optionsChangeCallback = optionsChangeCallback;
        this.switcherSection = switcherSection;
        this.speedSection = speedSection;
        this.originalPlayer = originalPlayerHTML;
        this._isInited = false;
        this.current = 'original';
    }
    _mirrorAndRotateHandler(e, speedSection, video) {
        speedSection.rotate.value %= 360;
        let transform = 'rotate(' + Number(speedSection.rotate.value) + 'deg)';
        if (e.target === speedSection.mirror) {
            if (e.target.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
            e.target.toggleClass('w');
        } else if (!speedSection.mirror.hasClass('w')) transform += 'matrix(-1, 0, 0, 1, 0, 0)';
        video.style.transform = transform;
    }
    _cssFilterHandler(e, speedSection, video) {
        let filter = '';
        for (let i of ['brightness', 'contrast', 'saturate']) filter += `${i}(${speedSection[i].value}) `;
        video.style.filter = filter;
    }
    _init(video) {
        this.video = video;
        const elements = this.speedSection;
        elements.input.on('change', (e) => {
            if (Number(e.target.value)) {
                this.video.playbackRate = Number(e.target.value);
                restartVideo(this.video);
            } else {
                e.target.value = 1.0;
            }
        });
        elements.rotate.on('change', (e) => this._mirrorAndRotateHandler(e, this.speedSection, this.video));
        elements.mirror.on('click', (e) => this._mirrorAndRotateHandler(e, this.speedSection, this.video));
        for (let i of ['brightness', 'contrast', 'saturate']) elements[i].on('change', (e) => this._cssFilterHandler(e, this.speedSection, this.video));
        this.inited = true;
    }
    _bind(video) {
        this.video = video;
        video.on('loadedmetadata', (e) => this.speedSection.res.innerText = '分辨率: ' + e.target.videoWidth + 'x' + e.target.videoHeight);
        if (!this._isInited) this._init(video);
        this.speedSection.removeClass('hidden');
    }
    _unbind() {
        this.video = null;
        this.speedSection.addClass('hidden');
    }
    setVideoLink(videoLink) {
        this.videoLink = videoLink;
    }
    setComment(ccl) {
        this.ccl = ccl;
    }
    set(newMode) {
        this.switcherSection.find('a.b-btn[type="' + this.current + '"]').addClass('w');
        this.switcherSection.find('a.b-btn[type="' + newMode + '"]').removeClass('w');
        localStorage.removeItem('defaulth5');
        if (this.current === 'html5' && this.flvPlayer) this.flvPlayer.destroy();
        if (this.checkFinished) clearInterval(this.checkFinished);
        if (this.interval) clearInterval(this.interval);
        if (this.cmManager) this.cmManager = null;
        if (!newMode.match('html5')) this._unbind();
        this.speedSection.res.innerText = '';
        this.speedSection.input.onchange = null;
        this.speedSection.input.value = 1.0;
        this.current = newMode;
    }
    original() {
        this.set('original');
        _$('#bofqi').html(this.originalPlayer);
        if (_$('#bofqi object').attr('width') === 950) _$('#bofqi object').setAttribute('width', 980);
    }
    swf() {
        this.set('swf');
        _$('#bofqi').html(`<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=${this.cid}&aid=${this.avid}"></object>`);
    }
    iframe() {
        this.set('iframe');
        _$('#bofqi').html(`<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=${this.cid}&aid=${this.avid}" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>`);
    }
    bilih5() {
        this.set('bilih5');
        _$('#bofqi').html(`<iframe height="536" width="980" class="player" src="//www.bilibili.com/html/html5player.html?cid=${this.cid}&aid=${this.avid}" scrolling="no" border="0" frameborder="no" framespacing="0"></iframe>`);
    }
    bilimac() {
        this.set('bilimac');
        _$('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
        _$('#bofqi').find('#player_placeholder').style.cssText =
      `background: url(${this.videoPic}) 50% 50% / cover no-repeat;
                -webkit-filter: blur(20px);
                overflow: hidden;
                visibility: visible;`;
        fetch('http://localhost:23330/rpc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `action=playVideoByCID&data=${this.cid}|${window.location.href}|${document.title}|1`,
        }).then((res) => res.ok && _$('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载'))
      .catch(() => _$('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :('));
    }
    html5(type) {
        let html5VideoUrl;
        switch (type) {
        case 'html5ld':
            this.set('html5ld');
            html5VideoUrl = this.videoLink.ld[0];
            break;
        case 'html5hd':
            this.set('html5hd');
            html5VideoUrl = this.videoLink.hd[0];
            break;
        default:
            this.set('html5');
            html5VideoUrl = this.videoLink.hd[0];
            if (this.videoLink.mediaDataSource.type === 'mp4') return console.warn('No Flv urls available, switch back to html5 hd', this.html5hd());
        }
        _$('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + this.videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
        let abp = ABP.create(document.getElementById('bilibili_helper_html5_player'), {
            src: {
                playlist: [{
                    video: document.getElementById('bilibili_helper_html5_player_video'),
                    comments: this.ccl,
                }],
            },
            width: '100%',
            height: '100%',
            config: this.options,
        });
        abp.playerUnit.addEventListener('wide', () => _$('#bofqi').addClass('wide'));
        abp.playerUnit.addEventListener('normal', () => _$('#bofqi').removeClass('wide'));
        abp.playerUnit.addEventListener('sendcomment', (e) => {
            const commentId = e.detail.id,
                commentData = e.detail;
            delete e.detail.id;
            sendComment(this.avid, this.cid, this.page, commentData).then((response) => {
                response.tmp_id = commentId;
                abp.commentCallback(response);
            });
        });
        abp.playerUnit.addEventListener('saveconfig', (e) => e.detail && Object.assign(this.options, e.detail) && this.optionsChangeCallback(this.options));
        this._bind(abp.video);
        this.cmManager = abp.cmManager;
        if (type && type.match(/hd|ld/)) return abp;
        this.flvPlayer = flvjs.createPlayer(this.videoLink.mediaDataSource);
        this.interval = setInterval(() => {
            if (abp.commentObjArray && this.flvPlayer) {
                clearInterval(this.interval);
                this.flvPlayer.attachMediaElement(abp.video);
                this.flvPlayer.load();
                this.flvPlayer.on(flvjs.Events.ERROR, (e) => console.warn(e, 'Switch back to HTML5 HD.', this.html5hd()));
                this.flvPlayer.on(flvjs.Events.MEDIA_INFO, (e) => console.info('分辨率: ' + e.width + 'x' + e.height + ', FPS: ' + e.fps, '视频码率: ' + Math.round(e.videoDataRate * 100) / 100, '音频码率: ' + Math.round(e.audioDataRate * 100) / 100));
            }
        }, 100);
        let lastTime;
        this.checkFinished = setInterval(() => {
            if (abp.video.currentTime !== lastTime) {
                lastTime = abp.video.currentTime;
            } else {
                if ((abp.video.duration - abp.video.currentTime) / abp.video.currentTime < 0.001 && !abp.video.paused) {
                    abp.video.currentTime = 0;
                    if (!abp.video.loop) {
                        abp.video.pause();
                        setTimeout(abp.video.pause, 200);
                        _$('.button.ABP-Play.ABP-Pause.icon-pause').className = 'button ABP-Play icon-play';
                    }
                }
            }
        }, 200);
    }
    _hdErrorHandler(e) {
        if (e.toString().match('request was interrupted by a call')) throw e;
        if (this.videoLink.hd.length > 1) {
            console.warn(e, 'HTML5 HD Error, try another link...');
            this.videoLink.hd.shift();
            this.html5('html5hd');
        } else console.warn(e, 'HTML5 HD Error, switch back to HTML5 LD.', this.html5ld());
    }
    html5hd() {
        this.set('html5hd');
        let abp = this.html5('html5hd');
        abp.video.querySelector('source').on('error', this._hdErrorHandler);
        abp.video.on('error', this._hdErrorHandler);
    }
    _ldErrorHandler(e) {
        if (e.toString().match('request was interrupted by a call')) throw e;
        if (this.videoLink.ld.length > 1) {
            console.warn(e, 'HTML5 LD Error, try another link...');
            this.videoLink.ld.shift();
            this.html5('html5ld');
        } else throw e;
    }
    html5ld() {
        this.set('html5ld');
        let abp = this.html5('html5ld');
        abp.video.querySelector('source').on('error', this._ldErrorHandler);
        abp.video.on('error', this._ldErrorHandler);
    }
}
export default PlayerSwitcher;
