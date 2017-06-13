// require external libs
import {bilibiliVideoInfoProvider, bilibiliBangumiVideoInfoProvider} from './bilibiliVideoInfoProvider';
import {parseTime, mySendMessage, parseXmlSafe, fetchretry, storageGet, _$, $h, getCookie, findPosTop} from './utils';
import commentQuerySection from './commentQuerySection';
import commentsHistorySection from './commentsHistorySection';
import bilibiliVideoProvider from './bilibiliVideoProvider';
import xml2ass from './xml2ass';
import {getDownloadOptions, getNiceSectionFilename} from './filename-sanitize';
import genPageFunc from './genPageFunc';
import addTitleLink from './addTitleLink';
import PlayerSwitcher from './PlayerSwitcher';

// main func
(async function() {
    const url = location.href;
    let avid, page, epid, cid, videoInfo, videoLink, options, isBangumi, genPage;
    // preload options
    const _options = storageGet();
    // prevent offical html5 autoload
    localStorage.removeItem('defaulth5');

    // get video info
    switch (location.hostname) {
    case 'www.bilibili.com': {
        let _avid, _page;
        if (url.match('bilibili.com/watchlater')) {
            _avid = url.match(/bilibili.com\/watchlater\/#\/av(\d+)/);
            _page = url.match(/bilibili.com\/watchlater\/#\/av\d+/);
        } else {
            _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
            _page = url.match(/bilibili.com\/video\/av[0-9]+\/index_([0-9]+)/);
        }
        if (!(_avid && _avid[1])) return console.warn('cannot match avid');
        avid = _avid[1];
        page = (_page && _page[1]) ? _page[1] : 1;
        videoInfo = await bilibiliVideoInfoProvider(avid, page);
        break;
    }
    case 'bangumi.bilibili.com': {
        const hash = location.hash;
        epid = hash.length > 1 && hash.match(/^\#[0-9]+$/) && hash.substr(1);
        const _epid = url.match(/bangumi.bilibili.com\/anime\/v\/([0-9]+)/);
        if (!epid && _epid) epid = _epid[1];
        if (!epid) return console.warn('cannot match epid');
        videoInfo = await bilibiliBangumiVideoInfoProvider(epid);
        avid = videoInfo.avid;
        page = Number(videoInfo.currentPage);
        isBangumi = true;
        break;
    }
    default:
        return;
    }
    cid = videoInfo.list[page - 1].cid;
    if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');

    // preload video links
    const _videoLink = bilibiliVideoProvider(cid, avid, page);
    let comment = {};

    // preload comments
    comment.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
    comment._xml = fetchretry(comment.url).then((res) => res.text()).then((text) => parseXmlSafe(text));
    options = await _options;
    const optionsChangeCallback = (newOpts) => (options = newOpts);

    const videoPic = videoInfo.pic || (_$('img.cover_image') && _$('img.cover_image').attr('src'));
    // genPage func
    if (!_$('.b-page-body')) genPage = decodeURIComponent(getCookie('redirectUrl'));
    if (_$('.b-page-body .z-msg') > 0 && _$('.b-page-body .z-msg').text().indexOf('版权') > -1) genPage = 1;
    if (genPage) await genPageFunc(cid, videoInfo, genPage);

    // addTitleLink func
    _$('.viewbox .info .v-title h1').html(addTitleLink(_$('.viewbox .info .v-title h1').attr('title'), options.rel_search));
    const titleNumbers = document.getElementsByClassName('titleNumber');
    if (titleNumbers.length > 0) titleNumbers.forEach((el) => {
        el.append($h('<div class="popuptext">\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent(el.attr('previous')) + '">' + el.attr('previous') + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent(el.attr('next')) + '">' + el.attr('next') + '</a></div>'));
        el.on('click', () => el.find('.popuptext').classList.toggle('show'));
        el.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.style.overflow = 'visible';
        el.parentNode.parentNode.parentNode.style.overflow = 'visible';
    });

    // some ui code from original helper
    let biliHelper = $h(isBangumi && !genPage ? '<div class="v1-bangumi-info-btn helper" id="bilibili_helper"><span class="t">哔哩哔哩助手</span><div class="info"><div class="main"></div><div class="version">哔哩哔哩助手 ' + chrome.runtime.getManifest().version + '<a class="setting b-btn w" href="' + chrome.runtime.getURL('options.html') + '" target="_blank">设置</a></div></div></div>' : '<div class="block helper" id="bilibili_helper"><span class="t"><div class="icon"></div><div class="t-right"><span class="t-right-top middle">助手</span><span class="t-right-bottom">扩展菜单</span></div></span><div class="info"><div class="main"></div><div class="version">哔哩哔哩助手 ' + chrome.runtime.getManifest().version + '<a class="setting b-btn w" href="' + chrome.runtime.getURL('options.html') + '" target="_blank">设置</a></div></div></div>');
    biliHelper.find('.t').onclick = () => biliHelper.toggleClass('active');
    biliHelper.blockInfo = biliHelper.find('.info');
    biliHelper.mainBlock = biliHelper.find('.main');
    biliHelper.mainBlock.infoSection = $h('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + avid + '</span><span>pg: ' + page + '</span><span id="bilibili_helper_html5_video_res"></span></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
    biliHelper.mainBlock.ondblclick = (e) => e.shiftKey && biliHelper.mainBlock.infoSection.toggleClass('hidden');
    if (genPage && genPage.match && genPage.match('http')) {
        biliHelper.mainBlock.redirectSection = $h('<div class="section redirect">生成页选项: <a class="b-btn w" href="' + genPage + '">前往原始跳转页</a></div>');
        biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
    }
    biliHelper.mainBlock.speedSection = $h('<div class="section speed hidden"><h3>视频播放控制</h3><p><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a>  旋转视频: <input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value="0" style="padding: 0px;width: 40px;" step="90">  亮度: <input id="bilibili_helper_html5_video_brightness" type="number" class="b-input" placeholder="1" value="1" step="0.1"><br>播放速度: <input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1" value="1" step="0.1">对比度:<input id="bilibili_helper_html5_video_contrast" type="number" class="b-input" placeholder="1" value="1" step="0.1">饱和度:<input id="bilibili_helper_html5_video_saturate" type="number" class="b-input" placeholder="1" value="1" step="0.1"></p></p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
    biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input');
    biliHelper.mainBlock.speedSection.input.step = 0.1;
    biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.infoSection.find('#bilibili_helper_html5_video_res');
    for (let i of ['mirror', 'rotate', 'brightness', 'speed', 'contrast', 'saturate']) biliHelper.mainBlock.speedSection[i] = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_' + i);
    biliHelper.mainBlock.speedSection.rotate.step = 90;
    biliHelper.mainBlock.switcherSection = $h('<div class="section switcher"><h3>播放器切换</h3></div>');
    biliHelper.mainBlock.switcherSection.button = $h('<p><a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5超清</a><a class="b-btn w hidden" type="html5hd">HTML5高清</a><a class="b-btn w hidden" type="html5ld">HTML5低清</a></p>');
    biliHelper.mainBlock.switcherSection.button.onclick = (e) => playerSwitcher[e.target.attr('type')]();
    biliHelper.mainBlock.switcherSection.append(biliHelper.mainBlock.switcherSection.button);
    if (genPage) {
        biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
        biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
    }
    if (localStorage.getItem('bilimac_player_type')) biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
    biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
    biliHelper.mainBlock.downloaderSection = $h('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
    biliHelper.mainBlock.querySection = $h('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);
    biliHelper.mainBlock.historySection = $h('<div class="section history"><h3>历史弹幕切换</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
    biliHelper.mainBlock.append(biliHelper.mainBlock.historySection);
    biliHelper.originalPlayerHTML = _$('#bofqi').innerHTML;
    (isBangumi && !genPage ? _$('.v1-bangumi-info-operate .v1-app-btn').empty() : _$('.player-wrapper .arc-toolbar')).append(biliHelper);
    _$('#bofqi').html('<div id="player_placeholder" class="player"></div>');
    _$('#bofqi').find('#player_placeholder').style.cssText =
        `background: url(${videoPic}) 50% 50% / cover no-repeat;
        -webkit-filter: blur(5px);
        overflow: hidden;
        visibility: visible;`;
    let replaceNotice = $h('<div id="loading-notice">正在尝试替换播放器…<span id="cancel-replacing">取消</span></div>');
    replaceNotice.find('#cancel-replacing').onclick = () => !_$('#loading-notice').remove() && playerSwitcher.original();
    _$('#bofqi').append(replaceNotice);
    if (options.scrollToPlayer) window.scroll(window.pageXOffset, findPosTop(_$('#bofqi')) - 30);
    // Initize PlayerSwitcher
    let playerSwitcher = new PlayerSwitcher(avid, cid, page, videoPic, options, optionsChangeCallback, biliHelper.mainBlock.switcherSection, biliHelper.mainBlock.speedSection, biliHelper.originalPlayerHTML);

    // process video links
    videoLink = await _videoLink;
    // follow ws video url redircet
    for (let i in videoLink.hd) if (videoLink.hd[i].match('ws.acgvideo.com')) fetch(videoLink.hd[i], {method: 'head'}).then((resp) => resp.ok && (videoLink.hd[i] = resp.url) && playerSwitcher.setVideoLink(videoLink));
    for (let i in videoLink.ld) if (videoLink.ld[i].match('ws.acgvideo.com')) fetch(videoLink.ld[i], {method: 'head'}).then((resp) => resp.ok && (videoLink.ld[i] = resp.url) && playerSwitcher.setVideoLink(videoLink));
    playerSwitcher.setVideoLink(videoLink);

    // downloaderSection code
    const clickDownLinkElementHandler = async(event) => !event.preventDefault() && await mySendMessage({
        command: 'requestForDownload',
        url: event.target.attr('href'),
        filename: event.target.attr('download'),
    });
    const createDownLinkElement = (segmentInfo, index) => {
        const downloadOptions = getDownloadOptions(segmentInfo.url, getNiceSectionFilename(avid, page, videoInfo.pages || 1, index, videoLink.mediaDataSource.segments.length, videoInfo));
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
        let bhDownAllLink = $h(`<a class="b-btn">下载全部${videoLink.mediaDataSource.segments.length}个分段</a>`);
        biliHelper.mainBlock.downloaderSection.find('p').append(bhDownAllLink);
        bhDownAllLink.onclick = () => biliHelper.mainBlock.downloaderSection.findAll('p .b-btn.w').each((e) => e.click());
    }
    biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + cid + '.mp3/www.bilibilijj.com.mp3?mp3=true">音频</a>'));
    biliHelper.mainBlock.downloaderSection.find('p').append($h('<a class="b-btn" target="_blank" href="' + videoPic + '">封面</a>'));
    if (videoLink.mediaDataSource.type === 'mp4') delete videoLink.mediaDataSource.segments;

    // switcherSection begin
    if (videoLink.mediaDataSource.type === 'flv') biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
    if (videoLink.hd.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
    if (videoLink.ld.length > 0) biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');

    // comment begin
    biliHelper.downloadFileName = getDownloadOptions(comment.url, getNiceSectionFilename(avid, page, videoInfo.pages || 1, 1, 1, videoInfo)).filename;
    biliHelper.mainBlock.infoSection.find('p').append($h('<span>cid: ' + cid + '</span>'));
    biliHelper.mainBlock.commentSection = $h(`<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="${comment.url}" download="${biliHelper.downloadFileName}">下载 XML 格式弹幕</a></p></div>`);
    biliHelper.mainBlock.commentSection.find('a').onclick = clickDownLinkElementHandler;
    biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
    comment.xml = await comment._xml;
    let assData;
    const clickAssBtnHandler = (event) => {
        event.preventDefault();
        if (!assData) assData = xml2ass(comment.xml, {
            'title': getNiceSectionFilename(avid, page, videoInfo.pages || 1, 1, 1, videoInfo),
            'ori': location.href,
            'opacity': options.opacity || 0.75,
        });
        const assBlob = new Blob([assData], {type: 'application/octet-stream'}),
            assUrl = window.URL.createObjectURL(assBlob);
        event.target.href = assUrl;
        clickDownLinkElementHandler(event);
        document.addEventListener('unload', () => window.URL.revokeObjectURL(assUrl));
    };
    let assBtn = $h(`<a class="b-btn w" download="${biliHelper.downloadFileName.replace('.xml', '.ass')}" href>下载 ASS 格式弹幕</a>`);
    assBtn.onclick = clickAssBtnHandler;
    biliHelper.mainBlock.commentSection.find('p').append(assBtn);

    // begin comment user query
    biliHelper.comments = comment.xml.getElementsByTagName('d');
    comment.ccl = BilibiliParser(comment.xml);
    playerSwitcher.setComment(comment.ccl);
    commentQuerySection(biliHelper.comments, biliHelper.mainBlock.querySection.find('p'));
    const changeComments = async(url) => {
        comment.url = url;
        comment._xml = fetchretry(comment.url).then((res) => res.text()).then((text) => parseXmlSafe(text));
        comment.xml = await comment._xml;
        biliHelper.comments = comment.xml.getElementsByTagName('d');
        comment.ccl = BilibiliParser(comment.xml);
        playerSwitcher.setComment(comment.ccl);
        commentQuerySection(biliHelper.comments, biliHelper.mainBlock.querySection.find('p'));
        biliHelper.mainBlock.commentSection.find('a[download*=xml]').href = comment.url;
        if (playerSwitcher.cmManager) comment.ccl.forEach((cmt) => playerSwitcher.cmManager.insert(cmt));
    };
    commentsHistorySection(cid, biliHelper.mainBlock.historySection.find('p'), changeComments).then((event) => (event !== true) && biliHelper.mainBlock.historySection.hide());

    // video player switcher begin
    playerSwitcher[options.player]();
})();
