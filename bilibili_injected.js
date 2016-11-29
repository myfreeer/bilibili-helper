(function() {
	if ($("html").hasClass("bilibili-helper")) return false;
	var adModeOn = false;
	var biliHelper = new Object();
	var cmtLoaded = false;
	if(location.hostname == 'www.bilibili.com') biliHelper.site = 0;
	else if(location.hostname == 'bangumi.bilibili.com') biliHelper.site = 1;
	else return false;
	var ff_status = {},
	    ff_status_id = 0,
	    ff_embed_stack = null,
	    ff_embed_stack_style = null;

	var CRC32 = {};
	(function(CRC32) {
	    function signed_crc_table() {
	        var c = 0,
	            table = new Array(256);
	        for (var n = 0; n != 256; ++n) {
	            c = n;
	            for (var x = 0; x < 8; x++) c = ((c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
	            table[n] = c;
	        }
	        return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
	    }
	    var T = signed_crc_table();

	    function crc32_bstr(bstr, seed) {
	        var C = seed ^ -1,
	            L = bstr.length - 1;
	        for (var i = 0; i < L;) {
	            C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
	            C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i++)) & 0xFF];
	        }
	        if (i === L) C = (C >>> 8) ^ T[(C ^ bstr.charCodeAt(i)) & 0xFF];
	        return C ^ -1;
	    }
	    CRC32.bstr = crc32_bstr;
	})(CRC32);

	var checkCRCHash = new(function() {
	    'use strict';
	    function signed_crc_table() {
	        var c = 0,
	            table = typeof Int32Array !== 'undefined' ? new Int32Array(256) : new Array(256);
	        for (var n = 0; n != 256; ++n) {
	            c = n;
	            for (var x = 0; x < 8; x++) {
	                c = c & 1 ? -306674912 ^ c >>> 1 : c >>> 1;
	            }
	            table[n] = c;
	        }
	        return table;
	    }
	    var crctable = signed_crc_table();
	    var crc32 = function crc32(input) {
	            if (typeof input != 'string') input = "" + input;
	            var crcstart = 0xFFFFFFFF,
	                len = input.length,
	                index;
	            for (var i = 0; i < len; ++i) {
	                index = (crcstart ^ input.charCodeAt(i)) & 0xff;
	                crcstart = crcstart >>> 8 ^ crctable[index];
	            }
	            return crcstart;
	        },
	        crc32lastindex = function crc32lastindex(input) {
	            if (typeof input != 'string') input = "" + input;
	            var crcstart = 0xFFFFFFFF,
	                len = input.length,
	                index;
	            for (var i = 0; i < len; ++i) {
	                index = (crcstart ^ input.charCodeAt(i)) & 0xff;
	                crcstart = crcstart >>> 8 ^ crctable[index];
	            }
	            return index;
	        },
	        getcrcindex = function getcrcindex(t) {
	            for (var i = 0; i < 256; i++) {
	                if (crctable[i] >>> 24 == t) return i;
	            }
	            return -1;
	        },
	        deepCheck = function deepCheck(i, index) {
	            var tc = 0x00,
	                str = '',
	                hash = crc32(i);
	            tc = hash & 0xff ^ index[2];
	            if (!(tc <= 57 && tc >= 48)) return [0];
	            str += tc - 48;
	            hash = crctable[index[2]] ^ hash >>> 8;
	            tc = hash & 0xff ^ index[1];
	            if (!(tc <= 57 && tc >= 48)) return [0];
	            str += tc - 48;
	            hash = crctable[index[1]] ^ hash >>> 8;
	            tc = hash & 0xff ^ index[0];
	            if (!(tc <= 57 && tc >= 48)) return [0];
	            str += tc - 48;
	            hash = crctable[index[0]] ^ hash >>> 8;
	            return [1, str];
	        };
	    var index = new Array(4);
	    return function(input) {
	        var ht = parseInt(input, 16) ^ 0xffffffff,
	            snum,
	            i,
	            lastindex,
	            deepCheckData;
	        for (i = 3; i >= 0; i--) {
	            index[3 - i] = getcrcindex(ht >>> i * 8);
	            snum = crctable[index[3 - i]];
	            ht ^= snum >>> (3 - i) * 8;
	        }
	        for (i = 0; i < 100000; i++) {
	            lastindex = crc32lastindex(i);
	            if (lastindex == index[3]) {
	                deepCheckData = deepCheck(i, index);
	                if (deepCheckData[0]) break;
	            }
	        }
	        if (i == 100000) return -1;
	        return i + '' + deepCheckData[1];
	    };
	})();

	function formatInt(Source, Length) {
		var strTemp = "";
		for (i = 1; i <= Length - (Source + "").length; i++) {
			strTemp += "0";
		}
		return strTemp + Source;
	}

	var parseXmlSafe = function parseXmlSafe(text) {
	    "use strict";
	    text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "");
	    if (window.DOMParser) return new window.DOMParser().parseFromString(text, "text/xml");
	    else if (ActiveXObject) {
	        var activeXObject = new ActiveXObject("Microsoft.XMLDOM");
	        activeXObject.async = false;
	        activeXObject.loadXML(text);
	        return activeXObject;
	    } else throw new Error("parseXmlSafe: XML Parser Not Found.");
	};

	function parseSafe(text) {
		return ('' + text).replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
	}

	function parseTime(timecount) {
		return formatInt(parseInt(timecount / 60000), 2) + ':' + formatInt(parseInt((timecount / 1000) % 60), 2);
	}

	function inject_css(name, content) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("id", name);
		styleElement.setAttribute("type", "text/css");
		styleElement.appendChild(document.createTextNode(content));
		if (document.head) {
			document.head.appendChild(styleElement);
		} else {
			document.documentElement.appendChild(styleElement);
		}
	}

	function disable() {
		var style = document.getElementById("bilibili_helper");
		if (style) style.parentNode.removeChild(style);
	}

	function enable(style2apply) {
		disable();
		if (style2apply) {
			inject_css("bilibili_helper", style2apply);
			if (window.location.hostname == "space.bilibili.com") {
				$('link[type="text/css"]').each(function(index, element) {
					if ($(element).attr("href").indexOf("space.css") != -1) disable();
				});
			}
		}
	}

	function notifyCidHack(callback) {
		var majorVersion = parseInt((/Chrome\/([\d\.apre]+)/.exec(window.navigator.userAgent) || /Firefox\/([\d\.apre]+)/.exec(window.navigator.userAgent))[1]);
		if (biliHelper.cidHack) {
			chrome.runtime.sendMessage({
				command: "cidHack",
				cid: biliHelper.cid,
				type: biliHelper.cidHack
			}, function(response) {
				if (typeof callback === 'function') callback();
			});
		} else {
			if (typeof callback === 'function') callback();
		}
	}

	function adMode(css) {
		var style = document.getElementById("bilibili_helper_ad_mode");
		if (style) style.parentNode.removeChild(style);
		if (adModeOn == true) {
			adModeOn = false;
		} else {
			adModeOn = true;
			inject_css("bilibili_helper_ad_mode", css);
		}
		return adModeOn;
	}

	function addTitleLink(text, mode) {
		if (mode == "off") return text;
		return text.replace(/(\d+)/g, function(mathchedText, $1, offset, str) {
			for (var i = offset; i >= 0; i--) {
				if (str[i] == "】") break;
				else if (str[i] == "【") return mathchedText;
			}
			var previous = str.substring(0, offset) + ((parseInt(mathchedText) - 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) - 1).toString()) : ('0' + (parseInt(mathchedText) - 1).toString())) + str.substring(offset + mathchedText.length, str.length)),
				next = str.substring(0, offset) + ((parseInt(mathchedText) + 1 >= 10 || (parseInt(mathchedText) - 1 < 0) ? ((parseInt(mathchedText) + 1).toString()) : ('0' + (parseInt(mathchedText) + 1).toString())) + str.substring(offset + mathchedText.length, str.length));
			previous = previous.replace(/(#)/g, " ");
			next = next.replace(/(#)/g, " ");
			if (mode == "without") {
				previous = previous.replace(/(\【.*?\】)/g, "");
				next = next.replace(/(\【.*?\】)/g, "");
			}
			return "<span class=\"titleNumber\" previous = \"" + previous + "\" next = \"" + next + "\">" + mathchedText + "</span>";
		});
	}

	function intilize_style(callback) {
		chrome.runtime.sendMessage({
			command: "getCSS",
			url: document.URL
		}, function(response) {
			if (response.result == "ok") enable(response.css);
			if (typeof callback === 'function') callback();
		});
	}

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		switch (request.command) {
			case "update":
				intilize_style();
				sendResponse({
					result: "ok"
				});
				return true;
			case "checkAdMode":
				sendResponse({
					result: "ok",
					mode: adModeOn
				});
				return true;
			case "adMode":
				sendResponse({
					result: "ok",
					mode: adMode(request.css)
				});
				return true;
			case "copyright":
				biliHelper.copyright = true;
				return true;
			case "error":
				if (biliHelper.cidHack == 0) {
					biliHelper.cidHack = 1;
					biliHelper.switcher[biliHelper.switcher.current]();
				} else if (biliHelper.cidHack == 1 && biliHelper.copyright) {
					biliHelper.cidHack = 2;
					biliHelper.switcher[biliHelper.switcher.current]();
				} else if (biliHelper.switcher.current != "original") {
					biliHelper.switcher["original"]();
				}
				return true;
			default:
				sendResponse({
					result: "unknown"
				});
				return false;
		}
	});

	biliHelper.fails = function() {
		if (typeof biliHelper.downloadUrls !== "object" || !biliHelper.downloadUrls.length) {
				if (biliHelper.replacePlayer && !biliHelper.redirectUrl && !biliHelper.genPage) {
					biliHelper.switcher.swf();
				} else {
					biliHelper.switcher.original();
				}
					biliHelper.favorHTML5 = false;
		} else {
					biliHelper.switcher.html5();
					biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
		};
	};

	var finishUp = function(forceCidHack) {
		var token = sessionStorage.getItem('token');
		if (document.body && document.body.innerHTML.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/) && document.body.innerHTML.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1]) token = document.body.innerHTML.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1];
		if (token) sessionStorage.setItem('token', token);
		if (!token) $.get('http://www.bilibili.com/video/av1/', function(data) {if (data.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/) && data.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1]) sessionStorage.setItem('token', data.match(/token[ =]+[\'\"]([0-9a-f]+)[\'\"\;]+/)[1])});
		chrome.runtime.sendMessage({
			command: "getDownloadLink",
			cid: biliHelper.cid,
				avid: biliHelper.avid,
				pg: biliHelper.page,
				cidHack: forceCidHack || biliHelper.cidHack,
				token: token
		}, function(response) {
			if (!response) return finishUp(forceCidHack);
			if (Object.keys(response).length === 0) return finishUp(forceCidHack);
			var videoDownloadLink = response["download"],
				videoPlaybackLink = response["playback"],
			videoLowResLink = response["lowres"];
			biliHelper.downloadUrls = [];
			biliHelper.playbackUrls = [];
			biliHelper.lowResUrl=videoLowResLink;
			notifyCidHack();
			if (typeof videoPlaybackLink == "undefined" || typeof videoPlaybackLink.durl == "undefined" || Number(videoPlaybackLink.code) < 0) {
				if (typeof videoDownloadLink.message == "string" || videoDownloadLink.result.indexOf("error") >= 0  || typeof videoDownloadLink.error_text == "string") {
					if (typeof videoPlaybackLink.message == "string" || videoPlaybackLink.result.indexOf("error") >= 0  || typeof videoPlaybackLink.error_text == "string") {
						try{if (videoDownloadLink.message.indexOf("地区") > -1) {
							biliHelper.copyright = true;
							if (forceCidHack || biliHelper.cidHack != 2) {
								finishUp(2);
								return false;
							}
						}} catch(e) {};
						biliHelper.error = '错误: ' + videoDownloadLink.message + ' ' + videoDownloadLink.error_text + ' ' + videoPlaybackLink.result;
						var errorMessage = biliHelper.error || "视频地址获取失败";
						biliHelper.mainBlock.downloaderSection.find('p').html('<span></span>' + parseSafe(errorMessage));
						if (biliHelper.replacePlayer && !biliHelper.redirectUrl && !biliHelper.genPage) {
							biliHelper.switcher.swf();
						} else {
							biliHelper.switcher.original();
						}
						biliHelper.favorHTML5 = false;
						return false;
					} else {
						videoDownloadLink = videoPlaybackLink;
					}
				}
				biliHelper.error = '错误: ' + videoPlaybackLink.message + ' ' + videoPlaybackLink.error_text + ' ' + videoPlaybackLink.result;
				var errorMessage = biliHelper.error || "视频地址获取失败";
				biliHelper.mainBlock.errorSection = $('<div class="section error"><p><span>' + parseSafe(biliHelper.error) + '</span></p></div>');
				biliHelper.mainBlock.append(biliHelper.mainBlock.errorSection);
				setTimeout(biliHelper.fails, 500);
			}
			if (typeof videoDownloadLink.durl["url"] === "undefined") {
				biliHelper.downloadUrls = videoDownloadLink.durl;
			} else {
				biliHelper.downloadUrls.push(videoDownloadLink.durl);
			}
			if (typeof videoPlaybackLink.durl === "undefined" || typeof videoPlaybackLink.durl["url"] === "undefined") {
				biliHelper.playbackUrls = videoPlaybackLink.durl;
			} else {
				biliHelper.playbackUrls.push(videoPlaybackLink.durl);
			}
			if (typeof biliHelper.downloadUrls !== "object" || !biliHelper.downloadUrls.length) {
				var errorMessage = biliHelper.error || "视频地址获取失败";
				biliHelper.mainBlock.downloaderSection.find('p').html('<span></span>' + parseSafe(errorMessage));
			} else {
				biliHelper.mainBlock.downloaderSection.find('p').empty();
				for (i in biliHelper.downloadUrls) {
					var segmentInfo = biliHelper.downloadUrls[i];
					if (typeof segmentInfo == "object") {
						var downloadOptions = getDownloadOptions(segmentInfo.url,
								getNiceSectionFilename(biliHelper.avid,
									biliHelper.page, biliHelper.totalPage,
									i, biliHelper.downloadUrls.length)),
							$bhDownLink = $('<a class="b-btn w" rel="noreferrer" id="bili_helper_down_link_' + parseInt(i) + '"></a>')
							.text('分段 ' + (parseInt(i) + 1))
							// Set download attribute to better file name. When use "Save As" dialog, this value gets respected even the target is not from the same origin.
							.data('download', downloadOptions.filename)
							.attr('title', isNaN(parseInt(segmentInfo.filesize / 1048576 + 0.5)) ? ('长度: ' + parseTime(segmentInfo.length)) : ('长度: ' + parseTime(segmentInfo.length) + ' 大小: ' + parseInt(segmentInfo.filesize / 1048576 + 0.5) + ' MB'))
							.attr('href', segmentInfo.url);
						biliHelper.mainBlock.downloaderSection.find('p').append($bhDownLink);
						// register a callback that can talk to extension background
						$bhDownLink.click(function(e) {
							e.preventDefault();
							chrome.runtime.sendMessage({
								command: 'requestForDownload',
								url: $(e.target).attr('href'),
								filename: $(e.target).data('download')
							});
						});
					}
				}
				if (biliHelper.downloadUrls.length > 1) {
					var $bhDownAllLink = $('<a class="b-btn"></a>').text('下载全部共 ' + biliHelper.downloadUrls.length + ' 个分段');
					biliHelper.mainBlock.downloaderSection.find('p').append($bhDownAllLink);
					$bhDownAllLink.click(function(e) {
						biliHelper.mainBlock.downloaderSection.find('p .b-btn.w').click();
					});
				}
				biliHelper.mainBlock.downloaderSection.find('p').append($('<a class="b-btn" target="_blank" title="实验性功能，由bilibilijj提供，访问慢且不稳定" href="http://www.bilibilijj.com/Files/DownLoad/' + biliHelper.cid + '.mp3/www.bilibilijj.com.mp3?mp3=true"></a>').text('音频'));
				biliHelper.mainBlock.downloaderSection.find('p').append($('<a class="b-btn" target="_blank" href="' + biliHelper.videoPic + '"></a>').text('封面'));
			}
			if (biliHelper.playbackUrls && biliHelper.playbackUrls.length == 1) {
				biliHelper.mainBlock.switcherSection.find('a[type="html5"]').removeClass('hidden');
				biliHelper.mainBlock.switcherSection.find('a[type="html5hd"]').removeClass('hidden');
				biliHelper.mainBlock.switcherSection.find('a[type="html5ld"]').removeClass('hidden');
			}
			$('#loading-notice').fadeOut(300);
			if (biliHelper.favorHTML5 && localStorage.getItem('bilimac_player_type') != 'force' && biliHelper.cid && biliHelper.playbackUrls && biliHelper.playbackUrls.length == 1 && biliHelper.playbackUrls[0].url.indexOf('m3u8') < 0) {
			//	$('#loading-notice').fadeOut(300, function() {					
					// getCommentFilter is async. Let's prepare the filter right before the html5 player loads
					chrome.extension.sendMessage({
						command: 'getCommentFilter'
					}, function(response){
						try {
							filters = JSON.parse(response);
							console.log(filters);
						} catch(e) {
							filters = [];
							console.warn("Invalid filter record: "+response+"\n"+e);
						}
						// Pre-process the filters for (negligible?) better performance
						var filters_categorized = {regex:[],text:[],color:[],user:[]};
						for (var i = filters.length-1; i >= 0; i--) {
							if (!filters[i].active) {
								// Remove inactive rules
								filters.splice(i,1);
								continue;
							}
							// Use regex engine only for regex
							if (filters[i].type=='text' && /\.|\[|\]|\(|\)|\*|\?|\||\\|\^|\$|\{|\}/.exec(filters[i].content)) {
								try {
									filters[i].content = new RegExp(filters[i].content);
									filters[i].type='regex';
								} catch (e) {
									console.warn("Invalid regex `"+filters[i].content+"' treated as text\n"+e);
								}
							}
							// Convert hex colors strings into integers
							if (filters[i].type=='color') {
								filters[i].content = 1*('0x'+filters[i].content); // Invalid hex becomes NaN
							}
							filters_categorized[filters[i].type].push(filters[i]);
						}
						filters = filters_categorized;
						// Filters are ready, load the html5 player
						biliHelper.switcher.html5();
					});
			//	});
			} else if (biliHelper.replacePlayer) {
				$('#loading-notice').fadeOut(300, function() {
					biliHelper.switcher.swf();
				});
			} else {
				$('#loading-notice').fadeOut(300, function() {
					biliHelper.switcher.original();
				});
			}
		});
	}

	var prob = document.createElement("script");
	prob.id = "page-prob";
	prob.innerHTML = "$('.player-wrapper .v-plist').attr('length', window.VideoPart.nodedata.length);$('#page-prob').remove();";
	document.body.appendChild(prob);
	intilize_style();
	$("html").addClass("bilibili-helper");
	var bili_reg,urlResult,hashPage;
	if(biliHelper.site == 0){
		bili_reg = /\/video\/av([0-9]+)\/(?:index_([0-9]+)\.html)?.*?$/,
		urlResult = bili_reg.exec(document.location.pathname),
		hashPage = (/page=([0-9]+)/).exec(document.location.hash);
		if (hashPage && typeof hashPage == "object" && !isNaN(hashPage[1])) hashPage = parseInt(hashPage[1]);
	}else if(biliHelper.site == 1){
		bili_reg = /\/anime\/v\/([0-9]+)$/,
		urlResult = bili_reg.exec(document.location.pathname);
	}

	if (urlResult) {
		biliHelper.avid = urlResult[1];
		biliHelper.bangumiid = urlResult[1];
		biliHelper.page = hashPage || urlResult[2];
		biliHelper.cidHack = 0;
		biliHelper.genPage = false;
		biliHelper.videoPic = $('img.cover_image').attr('src');
		biliHelper.totalPage = $('#dedepagetitles option').length;
		if (typeof biliHelper.page === "undefined") {
			biliHelper.page = 1;
		} else {
			biliHelper.page = parseInt(biliHelper.page);
		}
		biliHelper.pageOffset = 0;
		chrome.runtime.sendMessage({
			command: "init"
		}, function(response) {
			biliHelper.playerConfig = response.playerConfig;
			biliHelper.version = response.version;
			biliHelper.favorHTML5 = response.html5 == "on";
			biliHelper.replaceEnabled = response.replace == "on";
			biliHelper.originalPlayer = localStorage.getItem('bilimac_original_player') || $('#bofqi').html();
			localStorage.removeItem('bilimac_original_player');
			if (!$('.b-page-body').length) {
				biliHelper.genPage = true;
				biliHelper.redirectUrl = decodeURIComponent(__GetCookie('redirectUrl'));
				if (biliHelper.redirectUrl && biliHelper.redirectUrl.indexOf('mimi.gg/') > -1) {
					biliHelper.cidHack = 2;
					notifyCidHack();
				}
			}
			if ($('.b-page-body .z-msg').length > 0 && $('.b-page-body .z-msg').text().indexOf('版权') > -1) {
				biliHelper.genPage = true;
				biliHelper.copyright = true;
			}
			if ($('#bofqi div') > 0 && $('#bofqi div').text().indexOf('版权') > -1) {
				biliHelper.copyright = true;
			}
			biliHelper.copyright = false;
			biliHelper.switcher = {
				current: "original",
				set: function(newMode) {
				/*	if(this.current.match('bilih5')){
						var biliMenu = document.querySelector('.bilibili-player-setting-menu-wrap');
						if (biliMenu && biliMenu.lastChild && biliMenu.lastChild.getAttribute('value') === "change_flash") biliMenu.lastChild.click();
					}*/
					biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + this.current + '"]').addClass('w');
					biliHelper.mainBlock.switcherSection.find('a.b-btn[type="' + newMode + '"]').removeClass('w');
					try{clearInterval(checkFinished);} catch(e){}
					try{clearInterval(interval);} catch(e){}
					if (newMode.match('html5')) {
						biliHelper.mainBlock.speedSection.removeClass('hidden');
					} else {
						biliHelper.mainBlock.speedSection.addClass('hidden');
					};
					biliHelper.mainBlock.speedSection.res.innerText = "";
					biliHelper.mainBlock.speedSection.input.onchange = null;
					biliHelper.mainBlock.speedSection.input.value = 1.0;
					this.current = newMode;
				},
				original: function() {
					this.set('original');
					notifyCidHack(function() {
						$('#bofqi').html(biliHelper.originalPlayer);
						if ($('#bofqi embed').attr('width') == 950) $('#bofqi embed').attr('width', 980);
					});
				},
				swf: function() {
					this.set('swf');
					notifyCidHack(function() {
						$('#bofqi').html('<object type="application/x-shockwave-flash" class="player" data="https://static-s.bilibili.com/play.swf" id="player_placeholder" style="visibility: visible;"><param name="allowfullscreeninteractive" value="true"><param name="allowfullscreen" value="true"><param name="quality" value="high"><param name="allowscriptaccess" value="always"><param name="wmode" value="opaque"><param name="flashvars" value="cid=' + biliHelper.cid + '&aid=' + biliHelper.avid + '"></object>');
					});
				},
				iframe: function() {
					this.set('iframe');
					notifyCidHack(function() {
						$('#bofqi').html('<iframe height="536" width="980" class="player" src="https://secure.bilibili.com/secure,cid=' + biliHelper.cid + '&aid=' + biliHelper.avid + '" scrolling="no" border="0" frameborder="no" framespacing="0" onload="window.securePlayerFrameLoaded=true"></iframe>');
					});
				},
				bilih5: function() {
				    this.set('bilih5');
				    $('#bofqi').html('<div class="player"><div id="bilibiliPlayer"></div></div>');
				    $.getScript("https://static.hdslb.com/player/js/bilibiliPlayer.min.js", function() {
				        var script = document.createElement('script');
				        script.appendChild(document.createTextNode("var player = new bilibiliPlayer({aid: " + biliHelper.avid + ",cid: " + biliHelper.cid + ",autoplay: false,as_wide: false,player_type: 0,pre_ad: 0,lastplaytime: null,enable_ssl: 1,extra_params: null,p: " + biliHelper.page + "})"));
				        document.getElementsByTagName('head')[0].appendChild(script);
				    });
				    var interval = setInterval(function() {
				        try {
				            var bilibilivideo = document.getElementsByClassName('bilibili-player-video')[0].firstChild;
				            if (bilibilivideo.tagName == "VIDEO") {
				                biliHelper.mainBlock.speedSection.removeClass('hidden');
				                clearInterval(interval);
				                biliHelper.mainBlock.speedSection.input.addEventListener("change", function(e) {
				                    if (Number(biliHelper.mainBlock.speedSection.input.value)) {
				                        bilibilivideo.playbackRate = Number(biliHelper.mainBlock.speedSection.input.value);
				                    } else {
				                        biliHelper.mainBlock.speedSection.input.value = 1.0;
				                    };
				                });
				                bilibilivideo.addEventListener("loadedmetadata", function(e) {
				                    biliHelper.mainBlock.speedSection.res.innerText = bilibilivideo.videoWidth + "x" + bilibilivideo.videoHeight;
				                });
				                biliHelper.mainBlock.speedSection.rotate.addEventListener("change", function(e) {
				                    if (Number(biliHelper.mainBlock.speedSection.rotate.value) % 360 ===0) biliHelper.mainBlock.speedSection.rotate.value = 0;
				                    if (biliHelper.mainBlock.speedSection.mirror.className === "b-btn") {
				                        bilibilivideo.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
				                    } else {
				                        bilibilivideo.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
				                    };
				                });
				                biliHelper.mainBlock.speedSection.mirror.addEventListener("click", function(e) {
				                    if (biliHelper.mainBlock.speedSection.mirror.className === "b-btn w") {
				                        bilibilivideo.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
				                        biliHelper.mainBlock.speedSection.mirror.className = "b-btn";
				                    } else {
				                        bilibilivideo.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
				                        biliHelper.mainBlock.speedSection.mirror.className = "b-btn w";
				                    };
				                });
				            };
				        } catch (e) {}
				    }, 500);
				},
				html5: function(type,comments) {
					var html5VideoUrl;
					comments = comments ? comments : biliHelper.commentsUrl ? biliHelper.commentsUrl : 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
					switch(type){
						case 'html5ld':
						this.set('html5ld');
						html5VideoUrl = (biliHelper.lowResUrl && biliHelper.lowResUrl.durl && biliHelper.lowResUrl.durl[0] && biliHelper.lowResUrl.durl[0].url) ? biliHelper.lowResUrl.durl[0].url : typeof biliHelper.playbackUrls == 'undefined' ? 'https://static-s.bilibili.com/error.mp4' : biliHelper.playbackUrls[0].url;
						break;
						case 'html5hd':
						this.set('html5hd');
						html5VideoUrl = typeof biliHelper.playbackUrls == 'undefined' ? (biliHelper.lowResUrl && biliHelper.lowResUrl.durl && biliHelper.lowResUrl.durl[0] && biliHelper.lowResUrl.durl[0].url) ? biliHelper.lowResUrl.durl[0].url : 'https://static-s.bilibili.com/error.mp4' : biliHelper.playbackUrls[0].url;
						break;
						default:
						this.set('html5');
						html5VideoUrl = typeof biliHelper.playbackUrls == 'undefined' ? (biliHelper.lowResUrl && biliHelper.lowResUrl.durl && biliHelper.lowResUrl.durl[0] && biliHelper.lowResUrl.durl[0].url) ? biliHelper.lowResUrl.durl[0].url : 'https://static-s.bilibili.com/error.mp4' : biliHelper.playbackUrls[0].url;
					}
					$('#bofqi').html('<div id="bilibili_helper_html5_player" class="player"><video id="bilibili_helper_html5_player_video" poster="' + biliHelper.videoPic + '" crossorigin="anonymous"><source src="' + html5VideoUrl + '" type="video/mp4"></video></div>');
					var abp = ABP.create(document.getElementById("bilibili_helper_html5_player"), {
						src: {
							playlist: [{
								video: document.getElementById("bilibili_helper_html5_player_video"),
								comments: comments
							}]
						},
						width: "100%",
						height: "100%",
						config: biliHelper.playerConfig
					});
					abp.playerUnit.addEventListener("wide", function() {
						$("#bofqi").addClass("wide");
					});
					abp.playerUnit.addEventListener("normal", function() {
						$("#bofqi").removeClass("wide");
					});
					abp.playerUnit.addEventListener("sendcomment", function(e) {
						var commentId = e.detail.id,
							commentData = e.detail;
						delete e.detail.id;
						chrome.runtime.sendMessage({
							command: "sendComment",
							avid: biliHelper.avid,
							cid: biliHelper.cid,
							page: biliHelper.page + biliHelper.pageOffset,
							comment: commentData
						}, function(response) {
							response.tmp_id = commentId;
							abp.commentCallback(response);
						});
					});
					abp.playerUnit.addEventListener("saveconfig", function(e) {
						chrome.runtime.sendMessage({
							command: "savePlayerConfig",
							config: e.detail
						});
					});
				    biliHelper.mainBlock.speedSection.input.addEventListener("change", function(e) {
				        if (Number(biliHelper.mainBlock.speedSection.input.value)) {
				            abp.video.playbackRate = Number(biliHelper.mainBlock.speedSection.input.value);
				        } else {
				            biliHelper.mainBlock.speedSection.input.value = 1.0;
				        };
				    });
				   abp.video.addEventListener("loadedmetadata", function(e) {
				        biliHelper.mainBlock.speedSection.res.innerText = abp.video.videoWidth + "x" + abp.video.videoHeight;
				    });
				    biliHelper.mainBlock.speedSection.rotate.addEventListener("change", function(e) {
				        if (Number(biliHelper.mainBlock.speedSection.rotate.value) % 360 ===0) biliHelper.mainBlock.speedSection.rotate.value = 0;
				        if (biliHelper.mainBlock.speedSection.mirror.className==="b-btn") {
				            abp.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
				            abp.video.style.zIndex=0;
				            document.getElementsByClassName('ABP-Container')[0].style.zIndex=1;
				            //biliHelper.mainBlock.speedSection.mirror.className = "b-btn";
				        } else {
				        	abp.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
				            abp.video.style.zIndex=0;
				            document.getElementsByClassName('ABP-Container')[0].style.zIndex=1;
				            //biliHelper.mainBlock.speedSection.mirror.className = "b-btn w";
				        };
				    });
				    biliHelper.mainBlock.speedSection.mirror.addEventListener("click", function(e) {
				        if (biliHelper.mainBlock.speedSection.mirror.className==="b-btn w") {
				            abp.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
				            abp.video.style.zIndex=0;
				            document.getElementsByClassName('ABP-Container')[0].style.zIndex=1;
				            biliHelper.mainBlock.speedSection.mirror.className = "b-btn";
				        } else {
				        	abp.video.style.transform = 'rotate(' + Number(biliHelper.mainBlock.speedSection.rotate.value) + 'deg)';
				            abp.video.style.zIndex=0;
				            document.getElementsByClassName('ABP-Container')[0].style.zIndex=1;
				            biliHelper.mainBlock.speedSection.mirror.className = "b-btn w";
				        };
				    });
					var bofqiHeight = 0;
					$(window).scroll(function() {
						if (bofqiHeight != $("#bofqi").width()) {
							bofqiHeight = $("#bofqi").width();
							if (abp && abp.cmManager) {
								abp.cmManager.setBounds();
							}
						}
					});
					if (type && type.match(/hd|ld/)) return abp;
				var interval = setInterval(function() {
				    if (abp.commentObjArray) {
				        clearInterval(interval);
				        flv.playUrl(location.href);
				    }
				}, 600);
				var lastTime;
				var checkFinished = setInterval(function() {
					if (abp.video.currentTime !== lastTime){
						lastTime = abp.video.currentTime;
					} else {
						if ((abp.video.duration - abp.video.currentTime) / abp.video.currentTime < 0.001 && !abp.video.paused) {
							abp.video.currentTime = 0;
							if (!abp.video.loop) {
							    abp.video.pause();
							    setTimeout(abp.video.pause, 200);
							    document.querySelector('.button.ABP-Play.ABP-Pause.icon-pause').className = "button ABP-Play icon-play";
							}
						};
					};
				}, 600);
				},
				html5hd: function(comments) {
					comments = comments ? comments : biliHelper.commentsUrl ? biliHelper.commentsUrl : 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
					this.set('html5hd');
					var abp = biliHelper.switcher.html5('html5hd',comments);
				},
				html5ld: function(comments) {
				    comments = comments ? comments : biliHelper.commentsUrl ? biliHelper.commentsUrl : 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
				    if (!(biliHelper.lowResUrl && biliHelper.lowResUrl.durl && biliHelper.lowResUrl.durl[0] && biliHelper.lowResUrl.durl[0].url)) return console.log(biliHelper.lowResUrl);
				    this.set('html5ld');
				    var abp = biliHelper.switcher.html5('html5ld',comments);
				},
				bilimac: function() {
					this.set('bilimac');
					$('#bofqi').html('<div id="player_placeholder" class="player"></div><div id="loading-notice">正在加载 Bilibili Mac 客户端…</div>');
					$('#bofqi').find('#player_placeholder').css({
						background: 'url(' + biliHelper.videoPic + ') 50% 50% / cover no-repeat',
						'-webkit-filter': 'blur(20px)',
						overflow: 'hidden',
						visibility: 'visible'
					});
					$.post("http://localhost:23330/rpc", {
						action: 'playVideoByCID',
						data: biliHelper.cid + '|' + window.location.href + '|' + document.title + '|' + (biliHelper.cidHack == 2 ? 2 : 1)
					}, function() {
						$('#bofqi').find('#loading-notice').text('已在 Bilibili Mac 客户端中加载');
					}).fail(function() {
						$('#bofqi').find('#loading-notice').text('调用 Bilibili Mac 客户端失败 :(');
					});
				}
			};
			if(biliHelper.site == 0) {
				biliHelper.helperBlock = $("<div class=\"block helper\" id=\"bilibili_helper\"><span class=\"t\"><div class=\"icon\"></div><div class=\"t-right\"><span class=\"t-right-top middle\">助手</span><span class=\"t-right-bottom\">扩展菜单</span></div></span><div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + biliHelper.version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
				biliHelper.helperBlock.find('.t').click(function() {
					biliHelper.helperBlock.toggleClass('active');
				});
			}else if(biliHelper.site == 1){
			 	biliHelper.helperBlock = $("<div class=\"v1-bangumi-info-btn helper\" id=\"bilibili_helper\">哔哩哔哩助手<div class=\"info\"><div class=\"main\"></div><div class=\"version\">哔哩哔哩助手 " + biliHelper.version + "<a class=\"setting b-btn w\" href=\"" + chrome.extension.getURL("options.html") + "\" target=\"_blank\">设置</a></div></div></div>");
				biliHelper.helperBlock.click(function() {
					biliHelper.helperBlock.toggleClass('active');
				});
			}
			var blockInfo = biliHelper.helperBlock.find('.info');
			biliHelper.mainBlock = blockInfo.find('.main');
			biliHelper.mainBlock.infoSection = $('<div class="section video hidden"><h3>视频信息</h3><p><span></span><span>aid: ' + biliHelper.avid + '</span><span>pg: ' + biliHelper.page + '</span></p></div>');
			biliHelper.mainBlock.append(biliHelper.mainBlock.infoSection);
			biliHelper.mainBlock.dblclick(function(e) {
				if (e.shiftKey) biliHelper.mainBlock.infoSection.toggleClass('hidden');
			});
			if (biliHelper.redirectUrl && biliHelper.redirectUrl != "undefined") {
				biliHelper.mainBlock.redirectSection = $('<div class="section redirect"><h3>生成页选项</h3><p><a class="b-btn w" href="' + biliHelper.redirectUrl + '">前往原始跳转页</a></p></div>');
				biliHelper.mainBlock.append(biliHelper.mainBlock.redirectSection);
			}
			biliHelper.mainBlock.speedSection = $('<div class="section speed hidden"><h3>视频播放控制</h3><p><span id="bilibili_helper_html5_video_res"></span><a class="b-btn w" id="bilibili_helper_html5_video_mirror">镜像视频</a><br>视频播放速度<input id="bilibili_helper_html5_video_speed" type="number" class="b-input" placeholder="1.0" value=1.0></br>旋转视频<input id="bilibili_helper_html5_video_rotate" type="number" class="b-input" placeholder="0" value=0></p></div>');
			biliHelper.mainBlock.append(biliHelper.mainBlock.speedSection);
			biliHelper.mainBlock.speedSection.input = biliHelper.mainBlock.speedSection.find('input#bilibili_helper_html5_video_speed.b-input')[0];
			biliHelper.mainBlock.speedSection.input.step = 0.1;
			biliHelper.mainBlock.speedSection.res = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_res')[0];
			biliHelper.mainBlock.speedSection.mirror = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_mirror')[0];
			biliHelper.mainBlock.speedSection.rotate = biliHelper.mainBlock.speedSection.find('#bilibili_helper_html5_video_rotate')[0];
			biliHelper.mainBlock.speedSection.rotate.step = 90;
			biliHelper.mainBlock.switcherSection = $('<div class="section switcher"><h3>播放器切换</h3><p></p></div>');
			biliHelper.mainBlock.switcherSection.find('p').append($('<a class="b-btn w" type="original">原始播放器</a><a class="b-btn w" type="bilih5">原始HTML5</a><a class="b-btn w hidden" type="bilimac">Mac 客户端</a><a class="b-btn w hidden" type="swf">SWF 播放器</a><a class="b-btn w hidden" type="iframe">Iframe 播放器</a><a class="b-btn w hidden" type="html5">HTML5 (超清)</a><a class="b-btn w hidden" type="html5hd">HTML5 (高清)</a><a class="b-btn w hidden" type="html5ld">HTML5 (低清)</a>').click(function() {
				biliHelper.switcher[$(this).attr('type')]();
			}));
			if (biliHelper.redirectUrl) {
				biliHelper.mainBlock.switcherSection.find('a[type="original"]').addClass('hidden');
				biliHelper.mainBlock.switcherSection.find('a[type="swf"],a[type="iframe"]').removeClass('hidden');
			}
			if (localStorage.getItem('bilimac_player_type')) {
				biliHelper.mainBlock.switcherSection.find('a[type="bilimac"]').removeClass('hidden');
			}
			biliHelper.mainBlock.append(biliHelper.mainBlock.switcherSection);
			biliHelper.mainBlock.downloaderSection = $('<div class="section downloder"><h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p></div>');
			biliHelper.mainBlock.append(biliHelper.mainBlock.downloaderSection);
			biliHelper.mainBlock.querySection = $('<div class="section query"><h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p></div>');
			biliHelper.mainBlock.append(biliHelper.mainBlock.querySection);

			biliHelper.switcher.set('original');
			if (!biliHelper.genPage) {
				if(biliHelper.site == 0)
					$('.player-wrapper .arc-toolbar').append(biliHelper.helperBlock);
				else if(biliHelper.site == 1){
					$('.v1-bangumi-info-operate .v1-app-btn').after(biliHelper.helperBlock);
				}
			}
			biliHelperFunc();
		});
	}

	var biliHelperFunc = function() {
		biliHelper.totalPage = $('.player-wrapper .v-plist').attr('length');
		if (!isNaN(biliHelper.totalPage)) biliHelper.totalPage = parseInt(biliHelper.totalPage);
		if (localStorage.getItem('bilimac_player_type') == 'force') {
			biliHelper.switcher.set('bilimac');
		}
		if (!biliHelper.genPage && biliHelper.replaceEnabled && localStorage.getItem('bilimac_player_type') != 'force' &&
			(($('#bofqi object').length > 0 && $('#bofqi object').attr('data') != 'http://static.hdslb.com/play.swf' && $('#bofqi object').attr('data') != 'https://static-s.bilibili.com/play.swf' && $('#bofqi object').attr('data') != 'http://static.hdslb.com/letv.swf' && $('#bofqi object').attr('data') != 'http://static.hdslb.com/play_old.swf')&& $('#bofqi object').attr('data') != 'http://static.hdslb.com/play196.swf' ||
				($('#bofqi embed').length > 0 && $('#bofqi embed').attr('src') != 'http://static.hdslb.com/play.swf' && $('#bofqi embed').attr('src') != 'https://static-s.bilibili.com/play.swf' && $('#bofqi embed').attr('src') != 'http://static.hdslb.com/letv.swf' && $('#bofqi embed').attr('src') != 'http://static.hdslb.com/play_old.swf') && $('#bofqi embed').attr('data') != 'http://static.hdslb.com/play196.swf' ||
				($('#bofqi iframe').length > 0 && ($('#bofqi iframe').attr('src').indexOf('bilibili.com') < 0 || $('#bofqi iframe').attr('src').indexOf('iqiyi') > 0)) || ($('#bofqi object').length + $('#bofqi embed').length + $('#bofqi iframe').length == 0))) {
			biliHelper.replacePlayer = true;
			biliHelper.mainBlock.switcherSection.find('a[type="iframe"],a[type="swf"]').removeClass('hidden');
		} else {
			biliHelper.replacePlayer = false;
		}
		if (!biliHelper.genPage && biliHelper.favorHTML5) {
			$('#bofqi').html('<div id="player_placeholder" class="player"></div>');
			$('#bofqi').find('#player_placeholder').css({
				background: 'url(' + biliHelper.videoPic + ') 50% 50% / cover no-repeat',
				'-webkit-filter': 'blur(5px)',
				overflow: 'hidden',
				visibility: 'visible'
			});
		}
		if (biliHelper.replacePlayer || biliHelper.favorHTML5 && localStorage.getItem('bilimac_player_type') != 'force' && !biliHelper.genPage) {
			var replaceNotice = $('<div id="loading-notice">正在尝试替换播放器…<span id="cancel-replacing">取消</span></div>');
			replaceNotice.find('#cancel-replacing').click(function() {
				$('#loading-notice').fadeOut(300);
				if (biliHelper.favorHTML5) {
					if (biliHelper.replacePlayer && !biliHelper.redirectUrl && !biliHelper.genPage) {
						biliHelper.switcher.swf();
					} else {
						biliHelper.switcher.original();
					}
					biliHelper.favorHTML5 = false;
				}
			});
			$('#bofqi').append(replaceNotice);
		}

		biliHelper.loadComments = function(comments) {
		    comments = comments ? comments : biliHelper.commentsUrl ? biliHelper.commentsUrl : 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
		    fetch(comments).then(res => res.text()).then(res => {
		        var response = parseXmlSafe(res);
		        biliHelper.commentsUrl = 'data:application/xml;charset=utf-8,' + res;
		        var assData;
		        var assBtn = $('<a class="b-btn w">下载 ASS 格式弹幕</a>').attr('download', biliHelper.downloadFileName.replace('.xml', '.ass')).attr('href', null).click(function(e) {
		            e.preventDefault();
		            if (!assData) assData = '\ufeff' + generateASS(setPosition(parseXML('', response)), {
		                'title': getNiceSectionFilename(biliHelper.avid, biliHelper.page, biliHelper.totalPage, 1, 1),
		                'ori': location.href
		            });
		            var assBlob = new Blob([assData], {
		                    type: 'application/octet-stream'
		                }),
		                assUrl = window.URL.createObjectURL(assBlob);
		            e.target.href = assUrl;
		            chrome.runtime.sendMessage({
		                command: 'requestForDownload',
		                url: $(e.target).attr('href'),
		                filename: $(e.target).attr('download')
		            });
		        });
		        biliHelper.mainBlock.commentSection.find('p').append(assBtn);
		        biliHelper.comments = response.getElementsByTagName('d');
		        biliHelper.cmtLoaded = true;
		        var control = $('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><div class="b-slt"><span class="txt">请选择需要查询的弹幕…</span><div class="b-slt-arrow"></div><ul class="list"><li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li></ul></div><span></span><span class="result">选择弹幕查看发送者…</span></div>');
		        control.find('.b-input').keyup(function() {
		            var keyword = control.find('input').val(),
		                regex = new RegExp(parseSafe(keyword), 'gi');
		            control.find('ul.list').html('<li disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</li>');
		            if (control.find('.b-slt .txt').text() != '请选择需要查询的弹幕' && keyword.trim() != '') control.find('.b-slt .txt').html(parseSafe(control.find('.b-slt .txt').text()));
		            if (keyword.trim() != '') {
		                control.find('.b-slt .txt').text(control.find('.b-slt .txt').text());
		            }
		            for (var i = 0; i < biliHelper.comments.length; i++) {
		                var node = biliHelper.comments[i],
		                    text = node.childNodes[0];
		                if (text && node && regex.test(text.nodeValue)) {
		                    text = text.nodeValue;
		                    var commentData = node.getAttribute('p').split(','),
		                        sender = commentData[6],
		                        time = parseTime(parseInt(commentData[0]) * 1000);
		                    control.find('ul.list').append($('<li></li>').data('sender', sender).html('[' + time + '] ' + (keyword.trim() == '' ? parseSafe(text) : parseSafe(text).replace(regex, function(kw) {
		                        return '<span class="kw">' + kw + '</span>';
		                    }))));
		                }
		            }
		        });
		        control.find('.b-input').keyup();
		        var displayUserInfo = function(uid, data) {
		            control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + uid + '" target="_blank" card="' + parseSafe(data.name) + '" mid="' + uid + '">' + parseSafe(data.name) + '</a><div target="_blank" class="user-info-level l' + parseSafe(data.level_info.current_level) + '"></div>');
		            var s = document.createElement('script');
		            s.appendChild(document.createTextNode('UserCard.bind($("#bilibili_helper .query .result"));'));
		            document.body.appendChild(s);
		            s.parentNode.removeChild(s);
		        };
		        var displayUserInfobyMid = function(mid, hash) {
		            if (hash && (CRC32.bstr("" + mid) >>> 0) === parseInt(hash, 16)) sessionStorage.setItem('hash/' + hash, mid);
		            if (!mid) return control.find('.result').text('查询失败 :(');
		            else if (mid === -1) return control.find('.result').text('游客弹幕');
		            control.find('.result').html('发送者 UID: <a href="http://space.bilibili.com/' + mid + '" target="_blank" mid="' + mid + '">' + mid + '</a>');
		            var data = sessionStorage.getItem('user/' + mid);
		            if (data) {
		                displayUserInfo(mid, JSON.parse(data));
		                return false;
		            }
		            $.getJSON('http://api.bilibili.com/cardrich?mid=' + mid + '&type=jsonp', function(data) {
		                if (data.code == 0) {
		                    sessionStorage.setItem('user/' + mid, JSON.stringify({
		                        name: data.data.card.name,
		                        level_info: {
		                            current_level: data.data.card.level_info.current_level
		                        }
		                    }));
		                    displayUserInfo(mid, data.data.card);
		                }
		            });
		        };
		        SelectModule.bind(control.find('div.b-slt'), {
		            onChange: function(item) {
		                var sender = $(item[0]).data('sender');
		                control.find('.result').text('查询中…');
		                if (sender.indexOf('D') == 0) {
		                    control.find('.result').text('游客弹幕');
		                    return;
		                }
		                var mid = sessionStorage.getItem('hash/' + sender);
		                if (mid && (CRC32.bstr("" + mid) >>> 0) === parseInt(sender, 16)) return displayUserInfobyMid(mid);
		                mid = checkCRCHash(sender);
		                displayUserInfobyMid(mid, sender);
		            }
		        });
		        biliHelper.mainBlock.querySection.find('p').empty().append(control);
		    });
		};

		biliHelper.work = function() {
			chrome.runtime.sendMessage({
				command: "getVideoInfo",
				avid: biliHelper.avid,
				pg: biliHelper.page + biliHelper.pageOffset,
				isBangumi:(biliHelper.site ==1)
			}, function(response) {
				var videoInfo = response.videoInfo,
					error = false;
				if (typeof videoInfo.cid == 'number' && $('.b-page-body .viewbox').length == 0 && $('.main-inner .viewbox').length == 0) {
					biliHelper.genPage = true;
					biliHelper.copyright = true;
				}
				biliHelper.videoPic = videoInfo.pic;
				if (typeof biliHelper.totalPage == 'number' && biliHelper.totalPage > videoInfo.pages &&
					biliHelper.pageOffset > videoInfo.pages - biliHelper.totalPage) {
					biliHelper.pageOffset = videoInfo.pages - biliHelper.totalPage;
					biliHelper.work();
					return false;
				}
				if (typeof videoInfo.code !== "undefined") {
					if (biliHelper.page != 1) {
						chrome.runtime.sendMessage({
							command: "getVideoInfo",
							avid: biliHelper.avid,
							pg: 1,
							isBangumi:(biliHelper.site ==1)
						}, function(response) {
							var firstVideoInfo = response.videoInfo;
							if (firstVideoInfo.pages == biliHelper.page - 1) {
								biliHelper.pageOffset -= 1;
								biliHelper.work();
								return false;
							}
						});
					} else {
						biliHelper.error = '错误' + videoInfo.code + ': ' + videoInfo.error;
						biliHelper.mainBlock.errorSection = $('<div class="section error"><h3>Cid 获取失败</h3><p><span></span><span>' + parseSafe(biliHelper.error) + '</span></p></div>');
						biliHelper.mainBlock.append(biliHelper.mainBlock.errorSection);
						$('#loading-notice').fadeOut(300);
						biliHelper.switcher.original();
					}
				} else {
					if (!isNaN(biliHelper.cid) && biliHelper.originalPlayer) biliHelper.originalPlayer.replace('cid=' + biliHelper.cid, 'cid=' + videoInfo.cid);
					biliHelper.cid = videoInfo.cid;
					biliHelper.commentsUrl = 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
					if(videoInfo.avid) biliHelper.avid = videoInfo.avid;
					if (!biliHelper.genPage) {
						biliHelper.downloadFileName = getDownloadOptions(biliHelper.commentsUrl, getNiceSectionFilename(biliHelper.avid, biliHelper.page, biliHelper.totalPage, 1, 1)).filename;
						biliHelper.mainBlock.infoSection.find('p').append($('<span>cid: ' + biliHelper.cid + '</span>'));
						var commentDiv = $('<div class="section comment"><h3>弹幕下载</h3><p><a class="b-btn w" href="' + biliHelper.commentsUrl+ '">下载 XML 格式弹幕</a></p></div>');
						commentDiv.find('a').attr('download', biliHelper.downloadFileName).click(function(e) {
							e.preventDefault();
							chrome.runtime.sendMessage({
								command: 'requestForDownload',
								url: $(e.target).attr('href'),
								filename: $(e.target).attr('download')
							});
						});
						biliHelper.mainBlock.commentSection = commentDiv;
						biliHelper.mainBlock.append(biliHelper.mainBlock.commentSection);
						biliHelper.loadComments(biliHelper.commentsUrl);
					}
				}
				if (biliHelper.genPage) {
					tagList = "";
					var alist = "";
					if (videoInfo && videoInfo.list && videoInfo.list.length > 1) {
						alist += "<select id='dedepagetitles' onchange='location.href=this.options[this.selectedIndex].value;'>";
						videoInfo.list.forEach(function(vPart) {
							alist += "<option value='/video/av" + biliHelper.avid + "/index_" + parseSafe(vPart.page) + ".html'>" + parseSafe(vPart.page) + "、" + (vPart.part ? vPart.part : ("P" + parseSafe(vPart.page))) + "</option>";
						});
						alist += "</select>";
					}
					if (videoInfo && videoInfo.tag) videoInfo.tag.split(",").forEach(function(tag) {
						tagList += '<li><a class="tag-val" href="/tag/' + encodeURIComponent(tag) + '/" title="' + tag + '" target="_blank">' + tag + '</a></li>';
					});
					if (!videoInfo.tag) videoInfo.tag = "";
					$.get(chrome.extension.getURL("template.html"), function(template) {
						var page = template.replace(/__bl_avid/g, biliHelper.avid).replace(/__bl_page/g, biliHelper.page).replace(/__bl_cid/g, biliHelper.cid).replace(/__bl_tid/g, videoInfo.tid).replace(/__bl_mid/g, videoInfo.mid)
							.replace(/__bl_pic/g, videoInfo.pic).replace(/__bl_title/g, parseSafe(videoInfo.title)).replace(/__bl_sp_title_uri/g, videoInfo.sp_title ? encodeURIComponent(videoInfo.sp_title) : '')
							.replace(/__bl_sp_title/g, videoInfo.sp_title ? parseSafe(videoInfo.sp_title) : '').replace(/__bl_spid/g, videoInfo.spid).replace(/__bl_season_id/g, videoInfo.season_id)
							.replace(/__bl_created_at/g, videoInfo.created_at).replace(/__bl_description/g, parseSafe(videoInfo.description)).replace(/__bl_redirectUrl/g, biliHelper.redirectUrl)
							.replace(/__bl_tags/g, JSON.stringify(videoInfo.tag.split(","))).replace(/__bl_tag_list/g, tagList).replace(/__bl_alist/g, alist).replace(/__bl_bangumi_cover/g, videoInfo.bangumi ? videoInfo.bangumi.cover : '')
							.replace(/__bl_bangumi_desc/g, videoInfo.bangumi ? videoInfo.bangumi.desc : '');
						document.open();
						document.write(page);
						document.close();
						var prob = document.createElement("script");
						prob.id = "page-prob";
						prob.innerHTML = "$('.player-wrapper .v-plist').attr('length', window.VideoPart.nodedata.length);$('#page-prob').remove();";
						setTimeout(function() {
							var body = document.body || document.getElementsByTagName('body')[0];
							body.appendChild(prob); 
							biliHelper.genPage = false;
							if (!videoInfo.bangumi) {
								$('.bangumi-content .v_bgm_list').empty();
							}
							intilize_style(function() {
								$('.player-wrapper .arc-toolbar').append(biliHelper.helperBlock);
							});
							biliHelperFunc();
						}, biliHelper.genPage ? 1500 : 500);
					});
					return false;
				}

				window.postMessage ? (c = function(a) {
					"https://secure.bilibili.com" != a.origin && "https://ssl.bilibili.com" != a.origin || "secJS:" != a.data.substr(0, 6) || eval(a.data.substr(6));
				}, window.addEventListener ? window.addEventListener("message", c, !1) : window.attachEvent && window.attachEvent("onmessage", c)) : setInterval(function() {
					if (evalCode = __GetCookie("__secureJS")) {
						__SetCookie("__secureJS", ""), eval(evalCode)
					}
				}, 1000);

				if (biliHelper.cid && !biliHelper.favorHTML5 && localStorage.getItem('bilimac_player_type') != 'force') {
					$('#loading-notice').fadeOut(300, function() {
						biliHelper.switcher.swf();
					});
				}

				if (!biliHelper.cid) {
					biliHelper.error = '错误' + videoInfo.code + ': ' + videoInfo.error;
					biliHelper.mainBlock.errorSection = $('<div class="section error"><h3>Cid 获取失败</h3><p><span></span><span>' + parseSafe(biliHelper.error) + '</span></p></div>');
					biliHelper.mainBlock.append(biliHelper.mainBlock.errorSection);
					biliHelper.switcher.original();
					return false;
				}

				finishUp();

				$('.viewbox .info .v-title h1').html(addTitleLink($('.viewbox .info .v-title h1').attr('title'), response.rel_search));
				$(".titleNumber").click(function() {
					var msgbox = new MessageBox;
					msgbox.show(this, '\u70b9\u51fb\u641c\u7d22\u76f8\u5173\u89c6\u9891\uff1a<br /><a target="_blank" href="http://www.bilibili.com/search?orderby=default&keyword=' + encodeURIComponent($(this).attr("previous")) + '">' + $(this).attr("previous") + '</a><br /><a target="_blank" href="http://www.bilibili.com/search?orderby=ranklevel&keyword=' + encodeURIComponent($(this).attr("next")) + '">' + $(this).attr("next") + '</a>', 1e3);
				});
			});
		}
		biliHelper.work();
		//window.stop();
		window.addEventListener("hashchange", function() {
			var hashPage = (/page=([0-9]+)/).exec(document.location.hash);
			if (hashPage && typeof hashPage == "object" && !isNaN(hashPage[1])) hashPage = parseInt(hashPage[1]);
			if (hashPage && hashPage != biliHelper.page) {
				biliHelper.page = hashPage;
				biliHelper.mainBlock.infoSection.html('<h3>视频信息</h3><p><span></span><span>aid: ' + biliHelper.avid + '</span><span>pg: ' + biliHelper.page + '</span></p>');
				biliHelper.mainBlock.downloaderSection.html('<h3>视频下载</h3><p><span></span>视频地址获取中，请稍等…</p>');
				biliHelper.mainBlock.querySection.html('<h3>弹幕发送者查询</h3><p><span></span>正在加载全部弹幕, 请稍等…</p>');
				if (biliHelper.mainBlock.commentSection) biliHelper.mainBlock.commentSection.remove();
				if (biliHelper.mainBlock.errorSection) biliHelper.mainBlock.errorSection.remove();
				window.stop();
				biliHelper.work();
			}
		}, false);

	};

	function getNiceSectionFilename(avid, page, totalPage, idx, numParts) {
		// TODO inspect the page to get better section name
		var idName = 'av' + avid,
			// page/part name is only shown when there are more than one pages/parts
			pageIdName = (totalPage && (totalPage > 1)) ? ('p' + page) : "",
			pageName = "",
			partIdName = (numParts && (numParts > 1)) ? ('' + idx) : "";

		// try to find a good page name
		if (pageIdName) {
			pageName = $('.player-wrapper #plist > span').text();
			pageName = pageName.substr(pageName.indexOf('、') + 1);
			if(!partIdName) document.title = pageName + '_' + $('div.v-title').text() + '_' + idName +'_' +pageIdName;
			return partIdName ? pageName + '_' + $('div.v-title').text() + '_' + idName +'_' +pageIdName + '_' + partIdName : pageName + '_' + $('div.v-title').text() + '_' + idName +'_' +pageIdName;
		}
		if(!partIdName) document.title = $('div.v-title').text() + '_' + idName;
		// document.title contains other info feeling too much
		return partIdName ? $('div.v-title').text() + '_' + idName  + '_' + partIdName :  $('div.v-title').text() + '_' + idName;
	}

	// Helper function, return object {url, filename}, options object used by
	// "chrome.downloads.download"
	function getDownloadOptions(url, filename) {
		// TODO Improve file extension determination process.
		//
		// Parsing the url should be ok in most cases, but the best way should
		// use MIME types and tentative file names returned by server. Not
		// feasible at this stage.
		var resFn = null,
			fileBaseName = url.split(/[\\/]/).pop().split('?')[0],
			// arbitrarily default to "mp4" for no better reason...
			fileExt = fileBaseName.match(/[.]/) ? fileBaseName.match(/[^.]+$/) : 'mp4';

		// file extension auto conversion.
		//
		// Some sources are known to give weird file extensions, do our best to
		// convert them.
		switch (fileExt) {
			case "letv":
				fileExt = "flv";
				break;
			default:
				; // remain the same, nothing
		}

		resFn = filenameSanitize(filename, {
			replacement: '_',
			max: 255 - fileExt.length - 1
		}) + '.' + fileExt;

		return {
			"url": url,
			"filename": resFn
		};
	}
})();
(function(){
	if(location.href=="http://www.bilibili.com/video/bgm_calendar.html"){
		var l = $('#bangumi');
		var d= new Date().getDay()-1;
		for(var i = 0;i<7;++i){
			if(l.children()[0].getAttribute('weekday')!=d){
				var c = l.children()[0];
				l.children()[0].remove();
				l.append(c);
			}else break;
		}
	}
})();
