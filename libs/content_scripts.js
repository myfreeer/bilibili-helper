// require external libs
import {bilibiliVideoInfoProvider,bilibiliBangumiVideoInfoProvider} from './bilibiliVideoInfoProvider';
import {sleep, parseSafe, parseTime, mySendMessage, parseXmlSafe, fetchretry, storageSet, storageGet, storageRemove, storageClear} from './utils';
import commentSenderQuery from './commentSenderQuery';
import bilibiliVideoProvider from './bilibiliVideoProvider';
import xml2ass from './xml2ass';
import {getDownloadOptions, getNiceSectionFilename} from './filename-sanitize';
import {__GetCookie, __SetCookie} from './cookies';
import MessageBox from './MessageBox.min';
import SelectModule from './SelectModule.min';
import genPageFunc from './genPageFunc';
import addTitleLink from './addTitleLink';

// shortcuts
Element.prototype.find=Element.prototype.querySelector;
Element.prototype.findAll=Element.prototype.querySelectorAll;
Element.prototype.attr=Element.prototype.getAttribute;
Element.prototype.on=Element.prototype.addEventListener;
Element.prototype.off=Element.prototype.removeEventListener;
// arrow functions binds no this nor arguments
Element.prototype.data=function(str){return this.dataset[str];};
Element.prototype.text=function(str){return str ? (this.innerText = str) : this.innerText;};
Element.prototype.empty=function(){this.innerHTML = ''; return this;};
Element.prototype.html=function(str){str ? (this.innerHTML = str) : this.innerHTML;return this;};
Element.prototype.hide=function(){this.style.display = 'none';};
Element.prototype.show=function(){this.style.display = '';};
Element.prototype.addClass=function(){return this.classList.add(...arguments);};
Element.prototype.removeClass=function(){return this.classList.remove(...arguments);};
Element.prototype.toggleClass=function(){return this.classList.toggle(...arguments);};
Element.prototype.hasClass=function(){return this.classList.contains(...arguments);};
Element.prototype.replaceClass=function(){return this.classList.replace(...arguments);};
NodeList.prototype.map = HTMLCollection.prototype.map = Array.prototype.map;
NodeList.prototype.each = HTMLCollection.prototype.each = NodeList.prototype.forEach;
NodeList.prototype.filter = HTMLCollection.prototype.filter = Array.prototype.filter;
NodeList.prototype.reduce = HTMLCollection.prototype.reduce = Array.prototype.reduce;
NodeList.prototype.reduceRight = HTMLCollection.prototype.reduceRight = Array.prototype.reduceRight;
NodeList.prototype.every = HTMLCollection.prototype.every = Array.prototype.every;
NodeList.prototype.some = HTMLCollection.prototype.some = Array.prototype.some;
const _$ = e =>document.querySelector(e);
const _$$ = e => document.querySelectorAll(e);
const $h = html => {
	let template = document.createElement('template');
	template.innerHTML = html;
	return template.content.firstChild;
};

//main func
(async function() {
	const url = location.href;
	let avid, page, epid, cid, videoInfo, videoLink, options, isBangumi, genPage;
	//preload options
	const _options = storageGet();
	//prevent offical html5 autoload
	localStorage.removeItem('defaulth5');

	//get video info
	switch(location.hostname){
		case 'www.bilibili.com':
			const _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
			if (!_avid) return console.log('cannot match avid');
			avid = url.match(/bilibili.com\/video\/av([0-9]+)/)[1];
			const _page = url.match(/bilibili.com\/video\/av[0-9]+\/index_([0-9]+).html/);
			page = _page ? _page[1] : 1;
			videoInfo = await bilibiliVideoInfoProvider(avid, page);
			break;
		case 'bangumi.bilibili.com':
			const hash = location.hash;
			epid = hash.length > 1 && hash.match(/^\#[0-9]+$/) && hash.substr(1);
			const _epid = url.match(/bangumi.bilibili.com\/anime\/v\/([0-9]+)/);
			if (!epid && _epid) epid = _epid[1];
			if (!epid) return console.log('cannot match epid');
			videoInfo = await bilibiliBangumiVideoInfoProvider(epid);
			avid = videoInfo.avid;
			page = Number(videoInfo.currentPage);
			isBangumi = true;
			break;
		default:
			return;
	}
	cid = videoInfo.list[page-1].cid;
	if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');

	// preload video links
	const _videoLink = bilibiliVideoProvider(cid, avid, page);
	let comment = {};

	// preload comments
	comment.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
	comment._xml = fetchretry(comment.url).then(res=>res.text()).then(text=>parseXmlSafe(text));
	options = await _options;

	const videoPic = videoInfo.pic || (_$('img.cover_image') && _$('img.cover_image').attr('src'));
	//genPage func
	if (!_$('.b-page-body')) genPage = decodeURIComponent(__GetCookie('redirectUrl'));
	if (_$('.b-page-body .z-msg') > 0 && _$('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage =1;
	if (genPage) await genPageFunc(cid, videoInfo, genPage);
	//addTitleLink func
	_$('.viewbox .info .v-title h1').html(addTitleLink(_$('.viewbox .info .v-title h1').attr('title'), options.rel_search));
	if (_$(".titleNumber")) _$(".titleNumber").onclick = e =>(new MessageBox).show(e.target, '\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent(e.target.attr("previous")) + '">' + e.target.attr("previous") + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent(e.target.attr("next")) + '">' + e.target.attr("next") + '</a>', 1e3);

	//some ui code from original helper
	let biliHelper = $h(isBangumi && !genPage ? "<div class=\"v1-bangumi-info-btn helper\" id=\"bilibili_helper\"><span class=\"t\">哔哩哔哩助手</span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>" : "<div class=\"block helper\" id=\"bilibili_helper\"><span class=\"t\"><div class=\"icon\"></div><div class=\"t-right\"><span class=\"t-right-top middle\">助手</span><span class=\"t-right-bottom\">扩展菜单</span></div></span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + chrome.runtime.getManifest().version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
	biliHelper.find('.t').onclick=()=>biliHelper.toggleClass('active');
	biliHelper.blockInfo = biliHelper.find('.info');
	biliHelper.mainBlock = biliHelper.find('.main');
	biliHelper.mainBlock.infoSection = $h('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
	biliHelper.mainBlock.ondblclick=e=>e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
	if (genPage && genPage.match && genPage.match('http')) {
	    biliHelper.mainBlock.redirectSection = $h('<div class="section redirect">生成页选项: <a class="b-btn w" href="' + genPage + '">前往原始跳转页</a></div>');
	    biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
	}
	biliHelper.mainBlock.speedSection = $h('<div class="section speed hidden"><h3>视频播放控制</h3><p><span id="bilibili_helper_html5_video_res"></span><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a><br>视频播放速度: <input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1.0" value=1.0 style="width: 40px;">    旋转视频: <input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value=0 style="width: 40px;"></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
	biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
	biliHelper.mainBlock.speedSection.input.step = 0.1;
	biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_res');
	biliHelper.mainBlock.speedSection.mirror = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_mirror');
	biliHelper.mainBlock.speedSection.rotate = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_rotate');
	biliHelper.mainBlock.speedSection.rotate.step = 90;
	biliHelper.mainBlock.switcherSection = $h('<div class="section switcher"><h3>播放器切换</h3></div>');
	biliHelper.mainBlock.switcherSection.button = $h('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
	biliHelper.mainBlock.switcherSection.button.onclick = e =>biliHelper.switcher[e.target.attr('type')]();
	biliHelper.mainBlock.switcherSection.append(biliHelper.mainBlock.switcherSection.button);
	if (biliHelper.redirectUrl) {
	    biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
	    biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
	}
	if (localStorage.getItem('bilimac_player_type')) biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
	biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
	biliHelper.mainBlock.downloaderSection = $h('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
	biliHelper.mainBlock.querySection = $h('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);
	(isBangumi && !genPage ? _$('.v1-bangumi-info-operate .v1-app-btn').empty() : _$('.player-wrapper .arc-toolbar')).append(biliHelper);
	_$('#bofqi').html('<div id="player_placeholder" class="player"></div>');
	_$('#bofqi').find('#player_placeholder').style.cssText =
	    `background: url(${videoPic}) 50% 50% / cover no-repeat;
	    -webkit-filter: blur(5px);
	    overflow: hidden;
	    visibility: visible;`;
	let replaceNotice = $h('<div id="loading-notice">正在尝试替换播放器…<span id="cancel-replacing">取消</span></div>');
	replaceNotice.find('#cancel-replacing').onclick= e =>!_$('#loading-notice').remove() && biliHelper.switcher.original();
	_$('#bofqi').append(replaceNotice);

	// process video links
	videoLink = await _videoLink;

	//downloaderSection code
	const clickDownLinkElementHandler = async(event) => !event.preventDefault() && await mySendMessage({
	    command: 'requestForDownload',
	    url: event.target.attr('href'),
	    filename: event.target.attr('download')
	});
	const createDownLinkElement = (segmentInfo, index) => {
	    const downloadOptions = getDownloadOptions(segmentInfo.url, getNiceSectionFilename(avid, page, videoInfo.pages || 1, index, videoLink.mediaDataSource.segments.length));
	    const length = parseTime(segmentInfo.duration);
	    const size = (segmentInfo.filesize / 1048576 + 0.5) >>> 0;
	    const title = isNaN(size) ? (`长度: ${length}`) : (`长度: ${length} 大小: ${size} MB`);
	    let bhDownLink = $h(`<a class="b-btn w" rel="noreferrer" id="bili_helper_down_link_${index}" download="${downloadOptions.filename}" title="${title}" href="${segmentInfo.url}">${'分段 ' + (index + 1)}</a>`);
	    bhDownLink.download = downloadOptions.filename;
	    bhDownLink.onclick = clickDownLinkElementHandler;
	    biliHelper.mainBlock.downloaderSection.find('p').append(bhDownLink);
	};
	biliHelper.mainBlock.downloaderSection.find('p').empty();
	videoLink.mediaDataSource.segments.forEach(createDownLinkElement);

	if (videoLink.mediaDataSource.segments.length > 1) {
	    var bhDownAllLink = $h(`<a class="b-btn">下载全部${videoLink.mediaDataSource.segments.length}个分段</a>`);
	    biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
	    bhDownAllLink.onclick=e=> biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each(e=>e.click());
	}
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));
	if (videoLink.mediaDataSource.type === 'mp4') delete videoLink.mediaDataSource.segments;

	// switcherSection begin
	if (videoLink.mediaDataSource.type === 'flv') biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
	if (videoLink.hd.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
	if (videoLink.ld.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');

	// comment begin
	biliHelper.downloadFileName = getDownloadOptions(comment.url, getNiceSectionFilename(avid, page, videoInfo.pages || 1, 1, 1)).filename;
	biliHelper.mainBlock.infoSection.find('p').append($h('<span>cid: ' + cid + '</span>'));
	biliHelper.mainBlock.commentSection = $h(`<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="${comment.url}" download="${biliHelper.downloadFileName}">下载 XML 格式弹幕</a></p></div>`);
	biliHelper.mainBlock.commentSection.find('a').onclick = clickDownLinkElementHandler;
	biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
	comment.xml = await comment._xml;
	let assData;
	const clickAssBtnHandler = event => {
	    event.preventDefault();
	    if (!assData) assData = xml2ass(comment.xml, {
	        'title': getNiceSectionFilename(biliHelper.avid, biliHelper.page, biliHelper.totalPage, 1, 1),
	        'ori': location.href,
	        'opacity': options.opacity || 0.75
	    });
	    const assBlob = new Blob([assData], {type: 'application/octet-stream'}),
	        assUrl = window.URL.createObjectURL(assBlob);
	    event.target.href = assUrl;
	    clickDownLinkElementHandler(event);
	    document.addEventListener('unload',  () =>window.URL.revokeObjectURL(assUrl));
	};
	let assBtn = $h(`<a class="b-btn w" download="${biliHelper.downloadFileName.replace('.xml', '.ass')}" href>下载 ASS 格式弹幕</a>`);
	assBtn.onclick = clickAssBtnHandler;
	biliHelper.mainBlock.commentSection.find('p').append(assBtn);

	// begin comment user query
	biliHelper.comments = comment.xml.getElementsByTagName('d');
	let control = $h('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><div class="b-slt"><span class="txt">请选择需要查询的弹幕…</span><div class="b-slt-arrow"></div><ul class="list"><li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li></ul></div><span></span><span class="result">选择弹幕查看发送者…</span></div>');
	control.find('.b-input').onkeyup = e => {
		const keyword = control.find('input').value,
			regex = new RegExp(parseSafe(keyword), 'gi');
		control.find('ul.list').html('<li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li>');
		if (control.find('.b-slt .txt').text() != '请选择需要查询的弹幕' && keyword.trim() != '') control.find('.b-slt .txt').html(parseSafe(control.find('.b-slt .txt').text()));
		if (keyword.trim() != '') control.find('.b-slt .txt').text(control.find('.b-slt .txt').text());
		for (let node of biliHelper.comments){
			let text = node.childNodes[0];
			if (text && node && regex.test(text.nodeValue)) {
				text = text.nodeValue;
				const commentData = node.getAttribute('p').split(','),
		                        sender = commentData[6],
		                        time = parseTime(parseInt(commentData[0]) * 1000);
		        let li = $h(`<li sender=${sender}></li>`);
		        li.sender = sender;
		        li.html('[' + time + '] ' + (keyword.trim() == '' ? parseSafe(text) : parseSafe(text).replace(regex, kw =>'<span class="kw">' + kw + '</span>')));
		        control.find('ul.list').append(li);
		    }
		}
	};
	control.find('.b-input').onkeyup();
	const displayUserInfo = (mid, data) => {
	    control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + parseSafe(data.name) + '" mid="' + mid + '">' + parseSafe(data.name) + '</a><div target="_blank" class="user-info-level l' + parseSafe(data.level_info.current_level) + '"></div>');
	    let s = document.createElement('script');
	    s.appendChild(document.createTextNode('UserCard.bind($("#bilibili_helper .query .result"));'));
	    document.body.appendChild(s);
	    s.parentNode.removeChild(s);
	};
	//jQuery is required here.
	SelectModule.bind($(control.find('div.b-slt')), {
	    onChange: item => {
	        const sender = item[0].sender;
	        control.find('.result').text('查询中…');
	        if (sender.indexOf('D') == 0) return control.find('.result').text('游客弹幕');
	        commentSenderQuery(sender).then(data=>displayUserInfo(data.mid,data));
	    }
	});
	biliHelper.mainBlock.querySection.find('p').empty().append(control);

	// video player switcher begin
	const restartVideo = video => !video.paused && !video.pause() && !video.play();
	const mirrorAndRotateHandler = e => {
	    if (biliHelper.mainBlock.speedSection.mirror.className === "b-btn w") {
	        biliHelper.switcher.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
	        biliHelper.mainBlock.speedSection.mirror.className = "b-btn";
	    } else {
	        biliHelper.switcher.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
	        biliHelper.mainBlock.speedSection.mirror.className = "b-btn w";
	    }
	};
	biliHelper.switcher = {
	    current: "original",
	    inited: false,
	    _init: function (video) {
	        this.video = video;
	        biliHelper.mainBlock.speedSection.input.on("change", e => {
	            if (Number(e.target.value)) {
	                biliHelper.switcher.video.playbackRate = Number(e.target.value);
	                restartVideo(biliHelper.switcher.video);
	            } else {
	                e.target.value = 1.0;
	            }
	        });
	        biliHelper.mainBlock.speedSection.rotate.on("change", mirrorAndRotateHandler);
	        biliHelper.mainBlock.speedSection.mirror.on("click", mirrorAndRotateHandler);
	        this.inited = 1;
	    },
	    bind: function (video) {
	        this.video = video;
	        video.on("loadedmetadata", e => biliHelper.mainBlock.speedSection.res.innerText = '分辨率: ' + e.target.videoWidth + "x" + e.target.videoHeight);
	        if (!this.inited) this._init(video);
	        biliHelper.mainBlock.speedSection.removeClass('hidden');
	    },
	    unbind: function () {
	        this.video = null;
	        biliHelper.mainBlock.speedSection.addClass('hidden');
	    },
	    set: function (newMode) {
	        biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + this.current + '"]').addClass('w');
	        biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + newMode + '"]').removeClass('w');
	        localStorage.removeItem('defaulth5');
	        if (this.current == 'html5' && this.flvPlayer) this.flvPlayer.destroy();
	        if (this.checkFinished) clearInterval(this.checkFinished);
	        if (this.interval) clearInterval(this.interval);
	        if (!newMode.match('html5')) this.unbind();
	        biliHelper.mainBlock.speedSection.res.innerText = "";
	        biliHelper.mainBlock.speedSection.input.onchange = null;
	        biliHelper.mainBlock.speedSection.input.value = 1.0;
	        this.current = newMode;
	    },
	    original: function () {
	        this.set('original');
	        _$('#bofqi').html(biliHelper.originalPlayer);
	        if (_$('#bofqi embed').attr('width') == 950) _$('#bofqi embed').setAttribute('width', 980);
	    },
	    swf: function () {
	        this.set('swf');
	        _$('#bofqi').html('<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=' + cid + '&aid=' + avid + '"></object>');
	    },
	    iframe: function () {
	        this.set('iframe');
	        _$('#bofqi').html('<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=' + cid + '&aid=' + avid + '" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>');
	    },
	    bilih5: function () {
	        this.set('bilih5');
	        _$('#bofqi').html('<div class="player"><div id="bilibiliPlayer"></div></div>');
	        fetchretry("https://static.hdslb.com/player/js/bilibiliPlayer.min.js").then(res => res.text()).then(text => {
	            var script = document.createElement('script');
	            script.appendChild(document.createTextNode(text + ";var player = new bilibiliPlayer({aid: " + avid + ",cid: " + cid + ",autoplay: false,as_wide: false,player_type: 0,pre_ad: 0,lastplaytime: null,enable_ssl: 1,extra_params: null,p: " + page + "})"));
	            document.getElementsByTagName('head')[0].appendChild(script);
	        });
	        biliHelper.switcher.interval = setInterval(function () {
	            try {
	                var bilibilivideo = document.getElementsByClassName('bilibili-player-video')[0].firstChild;
	                if (bilibilivideo.tagName == "VIDEO") {
	                    this.bind(bilibilivideo);
	                    clearInterval(biliHelper.switcher.interval);
	                }
	            } catch (e) {}
	        }, 500);
	    },
	    html5: function (type) {
	        var html5VideoUrl;
	        switch (type) {
	        case 'html5ld':
	            this.set('html5ld');
	            html5VideoUrl = videoLink.ld[0];
	            break;
	        case 'html5hd':
	            this.set('html5hd');
	            html5VideoUrl = videoLink.hd[0];
	            break;
	        default:
	            this.set('html5');
	            html5VideoUrl = videoLink.hd[0];
	            if (videoLink.mediaDataSource.type === 'mp4') return console.warn('No Flv urls available, switch back to html5 hd',biliHelper.switcher.html5hd());
	        }
	        _$('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
	        let abp = ABP.create(document.getElementById("bilibili_helper_html5_player"), {
	            src: {
	                playlist: [{
	                    video: document.getElementById("bilibili_helper_html5_player_video"),
	                    comments: BilibiliParser(comment.xml)
	                }]
	            },
	            width: "100%",
	            height: "100%",
	            config: options
	        });
	        abp.playerUnit.addEventListener("wide", () => _$("#bofqi").addClass("wide"));
	        abp.playerUnit.addEventListener("normal", () => _$("#bofqi").removeClass("wide"));
	        abp.playerUnit.addEventListener("sendcomment", function (e) {
	            const commentId = e.detail.id,
	                commentData = e.detail;
	            delete e.detail.id;
	            chrome.runtime.sendMessage({
	                command: "sendComment",
	                avid: avid,
	                cid: cid,
	                page: page,
	                comment: commentData
	            }, function (response) {
	                response.tmp_id = commentId;
	                abp.commentCallback(response);
	            });
	        });
	        abp.playerUnit.addEventListener("saveconfig",  e =>e.detail && Object.assign(options, e.detail) && chrome.storage.local.set(options));
	        this.bind(abp.video);
	        if (type && type.match(/hd|ld/)) return abp;
	        this.flvPlayer = flvjs.createPlayer(videoLink.mediaDataSource);
	        biliHelper.switcher.interval = setInterval(function () {
	            if (abp.commentObjArray && biliHelper.switcher.flvPlayer) {
	                clearInterval(biliHelper.switcher.interval);
	                biliHelper.switcher.flvPlayer.attachMediaElement(abp.video);
	                biliHelper.switcher.flvPlayer.load();
	                biliHelper.switcher.flvPlayer.on(flvjs.Events.ERROR, e => console.warn(e, 'Switch back to HTML5 HD.', biliHelper.switcher.html5hd()));
	                biliHelper.switcher.flvPlayer.on(flvjs.Events.MEDIA_INFO, e => console.log('分辨率: ' + e.width + "x" + e.height + ', FPS: ' + e.fps, '视频码率: ' + Math.round(e.videoDataRate * 100) / 100, '音频码率: ' + Math.round(e.audioDataRate * 100) / 100));
	            }
	        }, 1000);
	        var lastTime;
	        biliHelper.switcher.checkFinished = setInterval(function () {
	            if (abp.video.currentTime !== lastTime) {
	                lastTime = abp.video.currentTime;
	            } else {
	                if ((abp.video.duration - abp.video.currentTime) / abp.video.currentTime < 0.001 && !abp.video.paused) {
	                    abp.video.currentTime = 0;
	                    if (!abp.video.loop) {
	                        abp.video.pause();
	                        setTimeout(abp.video.pause, 200);
	                        document.querySelector('.button.ABP-Play.ABP-Pause.icon-pause').className = "button ABP-Play icon-play";
	                    }
	                }
	            }
	        }, 600);
	    },
	    html5hd: function () {
	        this.set('html5hd');
	        var abp = biliHelper.switcher.html5('html5hd');
	        abp.video.querySelector('source').on('error', e => {
	                if (videoLink.hd.length > 1) {
	                    console.warn(e, 'HTML5 HD Error, try another link...');
	                    videoLink.hd.splice(0, 1);
	                    biliHelper.switcher.html5('html5hd');
	                } else console.warn(e, 'HTML5 HD Error, switch back to HTML5 LD.', biliHelper.switcher.html5ld());
	        });
	    },
	    html5ld: function () {
	        this.set('html5ld');
	        var abp = biliHelper.switcher.html5('html5ld');
	        abp.video.querySelector('source').on('error', e => {
	            if (videoLink.ld.length > 1) {
	                console.warn(e, 'HTML5 LD Error, try another link...');
	                videoLink.ld.splice(0, 1);
	                biliHelper.switcher.html5('html5ld');
	            }
	        });
	    },
	    bilimac: function () {
	        this.set('bilimac');
	        _$('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
	        _$('#bofqi').find('#player_placeholder').style.cssText =
	            `background: url(${videoPic}) 50% 50% / cover no-repeat;
	            -webkit-filter: blur(20px);
	            overflow: hidden;
	            visibility: visible;`;
	        fetch("http://localhost:23330/rpc", {
	                method: "POST",
	                headers: {"Content-Type": "application/x-www-form-urlencoded"},
	                body: `action=playVideoByCID&data=${cid}|${window.location.href}|${document.title}|1`
	            }).then(res => res.ok && _$('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载'))
	            .catch(e => _$('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :('));
	    }
	};
	biliHelper.switcher[options.player]();
})();