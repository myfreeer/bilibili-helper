// require external libs
var {bilibiliVideoInfoProvider,bilibiliBangumiVideoInfoProvider} = require('./bilibiliVideoInfoProvider');
var {sleep, parseSafe, parseTime, mySendMessage, parseXmlSafe, fetchretry, storageSet, storageGet, storageRemove, storageClear} = require('./utils');
var commentSenderQuery = require('./commentSenderQuery');
var bilibiliVideoProvider = require('./bilibiliVideoProvider');
var xml2ass = require('./xml2ass');

// shortcuts
Element.prototype.find=Element.prototype.querySelectorAll;
Element.prototype.attr=Element.prototype.getAttribute;
Element.prototype.on=Element.prototype.addEventListener;
Element.prototype.off=Element.prototype.removeEventListener;
Element.prototype.data=function(str){return this.dataset[str];};
Element.prototype.html=function(str){return str ? (this.innerHTML = str) : this.innerHTML;};
Element.prototype.hide=function(){this.style.display = 'none';};
Element.prototype.show=function(){this.style.display = '';};
Element.prototype.addClass=function(){return this.classList.add(...arguments);};
Element.prototype.removeClass=function(){return this.classList.remove(...arguments);};
Element.prototype.toggleClass=function(){return this.classList.toggle(...arguments);};
Element.prototype.hasClass=function(){return this.classList.contains(...arguments);};
Element.prototype.replaceClass=function(){return this.classList.replace(...arguments);};
NodeList.prototype.map = HTMLCollection.prototype.map = Array.prototype.map;
NodeList.prototype.filter = HTMLCollection.prototype.filter = Array.prototype.filter;
NodeList.prototype.reduce = HTMLCollection.prototype.reduce = Array.prototype.reduce;
NodeList.prototype.reduceRight = HTMLCollection.prototype.reduceRight = Array.prototype.reduceRight;
NodeList.prototype.every = HTMLCollection.prototype.every = Array.prototype.every;
NodeList.prototype.some = HTMLCollection.prototype.some = Array.prototype.some;
var _$ = document.querySelector;
var _$$ = document.querySelectorAll;

(async function() {
var mainData={};
	let url = location.href;
	let avid, page, epid, cid, videoInfo, videoLink;
	switch(location.hostname){
		case 'www.bilibili.com':
			let _avid = url.match(/bilibili.com\/video\/av([0-9]+)/);
			if (!_avid) return console.log('cannot match avid');
			avid = url.match(/bilibili.com\/video\/av([0-9]+)/)[1];
			let _page = url.match(/bilibili.com\/video\/av[0-9]+\/index_([0-9]+).html/);
			page = _page ? _page[1] : 1;
			videoInfo = await bilibiliVideoInfoProvider(avid, page);
			break;
		case 'bangumi.bilibili.com':
			let hash = location.hash;
			epid = hash.length > 1 && hash.match(/^\#[0-9]+$/) && hash.substr(1);
			let _epid = url.match(/bangumi.bilibili.com\/anime\/v\/([0-9]+)/);
			if (!epid && _epid) epid = _epid[1];
			if (!epid) return console.log('cannot match epid');
			videoInfo = await bilibiliBangumiVideoInfoProvider(epid);
			avid = videoInfo.avid;
			page = Number(videoInfo.page);
			break;
		default:
			return;
	}
	cid = videoInfo.list[page-1].cid;
	if (!(avid && page && cid && videoInfo)) return console.warn('something went wrong, exiting.');
	let _videoLink = bilibiliVideoProvider(cid, avid, page);
	let comment = {};
	let comment.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
	let comment._text = fetchretry(comment.url);
