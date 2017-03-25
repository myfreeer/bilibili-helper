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
	const videoPic = _$('img.cover_image').attr('src');
	options = await _options;

	//some ui code from original helper
	if (!_$('.b-page-body')) genPage = decodeURIComponent(__GetCookie('redirectUrl'));
	if (_$('.b-page-body .z-msg') > 0 && _$('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage =1;
	let biliHelper = $h(isBangumi && !genPage ? "<div class=\"v1-bangumi-info-btn helper\" id=\"bilibili_helper\"><span class=\"t\">哔哩哔哩助手</span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + options.version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>" : "<div class=\"block helper\" id=\"bilibili_helper\"><span class=\"t\"><div class=\"icon\"></div><div class=\"t-right\"><span class=\"t-right-top middle\">助手</span><span class=\"t-right-bottom\">扩展菜单</span></div></span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + options.version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
	biliHelper.find('.t').onclick=()=>biliHelper.toggleClass('active');
	biliHelper.blockInfo = biliHelper.find('.info');
	biliHelper.mainBlock = biliHelper.find('.main');
	biliHelper.mainBlock.infoSection = $h('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
	biliHelper.mainBlock.ondblclick=e=>e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
	if (genPage && genPage.match && genPage.match('http')) {
	    biliHelper.mainBlock.redirectSection = $h('<div class="section redirect"><h3>生成页选项</h3><p><a class="b-btn w" href="' + biliHelper.redirectUrl + '">前往原始跳转页</a></p></div>');
	    biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
	}
	biliHelper.mainBlock.speedSection = $h('<div class="section speed hidden"><h3>视频播放控制</h3><p><span id="bilibili_helper_html5_video_res"></span><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a><br>视频播放速度<input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1.0" value=1.0></br>旋转视频<input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value=0></p></div>');
	biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
	biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
	biliHelper.mainBlock.speedSection.input.step = 0.1;
	biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_res');
	biliHelper.mainBlock.speedSection.mirror = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_mirror');
	biliHelper.mainBlock.speedSection.rotate = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_rotate');
	biliHelper.mainBlock.speedSection.rotate.step = 90;
	biliHelper.mainBlock.switcherSection = $h('<div class="section switcher"><h3>播放器切换</h3></div>');
	biliHelper.mainBlock.switcherSection.button = $h('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
	biliHelper.mainBlock.switcherSection.button.onclick = e =>playerSwitcher[e.target.attr('type')]();
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
	(isBangumi && !genPage ? _$('.v1-bangumi-info-operate .v1-app-btn') : _$('.player-wrapper .arc-toolbar')).append(biliHelper);
	console.log(await _videoLink, videoInfo);

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

	//const videoPic = videoInfo.pic || videoLink.low.img;
	if (videoLink.mediaDataSource.segments.length > 1) {
	    var bhDownAllLink = $h('<a class="b-btn"></a>').text('下载全部 ' + videoLink.mediaDataSource.segments.length + ' 个分段');
	    biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
	    bhDownAllLink.onclick=e=> biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each(e=>e.click());
	}
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
	biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));

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
	    document.on('unload',  () =>window.URL.revokeObjectURL(assUrl));
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
	debugger;
	control.find('.b-input').onkeyup();
	const displayUserInfo = (mid, data) => {
	    control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + parseSafe(data.name) + '" data-usercard-mid="' + mid + '">' + parseSafe(data.name) + '</a><div target="_blank" class="user-info-level l' + parseSafe(data.level_info.current_level) + '"></div>');
	    let s = document.createElement('script');
	    s.appendChild(document.createTextNode('UserCard.bind($("#bilibili_helper .query .result"));'));
	    document.body.appendChild(s);
	    s.parentNode.removeChild(s);
	};
	SelectModule.bind(control.find('div.b-slt'), {
	    onChange: item => {
	        console.log(item);
	        const sender = item[0].sender;
	        control.find('.result').text('查询中…');
	        if (sender.indexOf('D') == 0) {
	            control.find('.result').text('游客弹幕');
	            return;
	        }
	        commentSenderQuery(hash).then(data=>displayUserInfo(data.mid,data));
	    }
	});
	biliHelper.mainBlock.querySection.find('p').empty().append(control);
})();