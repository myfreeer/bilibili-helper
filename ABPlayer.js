var ABP = {
	"version": "0.8.0"
};

/***********************
* XMLParser
* == Licensed Under the MIT License : /LICENSING
* Copyright (c) 2012 Jim Chen ( CQZ, Jabbany )
************************/
function CommentLoader(url, xcm, callback) {
    if (callback == null)
        callback = function() {
            return;
        };
    var xmlhttp = null;
    var retry = 0;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.onerror = function() {
        xmlhttp.abort();
        if (retry < 3) xmlhttp.send();
        retry += 1;
    };
    xmlhttp.ontimeout = xmlhttp.onerror;
    xmlhttp.send();
    var cm = xcm;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            if (navigator.appName == 'Microsoft Internet Explorer') {
                var f = new ActiveXObject("Microsoft.XMLDOM");
                f.async = false;
                f.loadXML(xmlhttp.responseText);
                cm.load(BilibiliParser(f));
                callback();
            } else {
                var standarizedXML = xmlhttp.responseXML == null ? (new window.DOMParser()).parseFromString(xmlhttp.responseText.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g,""), "text/xml") : xmlhttp.responseXML;
                cm.load(BilibiliParser(standarizedXML));
                //console.log(standarizedXML);
                callback();
            }
        }
    }
}

function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr){
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}


function isMobile() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
return check; }


(function() {
	"use strict";
	if (!ABP) return;
	var $$ = jQuery;
	var $ = function(e) {
		return document.getElementById(e);
	};
	var _ = function(type, props, children, callback) {
		var elem = null;
		if (type === "text") {
			return document.createTextNode(props);
		} else {
			elem = document.createElement(type);
		}
		for (var n in props) {
			if (n !== "style" && n !== "className") {
				elem.setAttribute(n, props[n]);
			} else if (n === "className") {
				elem.className = props[n];
			} else {
				for (var x in props.style) {
					elem.style[x] = props.style[x];
				}
			}
		}
		if (children) {
			for (var i = 0; i < children.length; i++) {
				if (children[i] != null)
					elem.appendChild(children[i]);
			}
		}
		if (callback && typeof callback === "function") {
			callback(elem);
		}
		return elem;
	};

	var findRow = function(node) {
		var i = 1;
		while (node = node.previousSibling) {
			if (node.nodeType === 1) {
				++i
			}
		}
		return i;
	}

	var findClosest = function(node, className) {
		for (; node; node = node.parentNode) {
			if (hasClass(node.parentNode, className)) {
				return node;
			}
		}
	}

	HTMLElement.prototype.tooltip = function(data) {
		this.tooltipData = data;
		this.dispatchEvent(new Event("updatetooltip"));
	};

	if (typeof HTMLElement.prototype.requestFullScreen == "undefined") {
		HTMLElement.prototype.requestFullScreen = function() {
			if (this.webkitRequestFullscreen) {
				this.webkitRequestFullscreen();
			} else if (this.mozRequestFullScreen) {
				this.mozRequestFullScreen();
			} else if (this.msRequestFullscreen) {
				this.msRequestFullscreen();
			}
		}
	}

	if (typeof document.isFullScreen == "undefined") {
		document.isFullScreen = function() {
			return document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenEnabled;
		}
	}

	if (typeof document.exitFullscreen == "undefined") {
		document.exitFullscreen = function() {
			if (document.webkitExitFullscreen) {
				document.webkitExitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (msExitFullscreen) {
				msExitFullscreen()
			}
		}
	}

	var pad = function(number, length) {
		length = length || 2;
		var str = '' + number;
		while (str.length < length) {
			str = '0' + str;
		}
		return str;
	}

	var htmlEscape = function(text) {
		return text.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
	}

	var formatInt = function(source, length) {
		var strTemp = "";
		for (var i = 1; i <= length - (source + "").length; i++) {
			strTemp += "0";
		}
		return strTemp + source;
	}

	var formatDate = function(timestamp, shortFormat) {
		if (timestamp == 0) {
			return lang['oneDay'];
		}
		var date = new Date((parseInt(timestamp)) * 1000),
			year, month, day, hour, minute, second;
		year = String(date.getFullYear());
		month = String(date.getMonth() + 1);
		if (month.length == 1) month = "0" + month;
		day = String(date.getDate());
		if (day.length == 1) day = "0" + day;
		hour = String(date.getHours());
		if (hour.length == 1) hour = "0" + hour;
		minute = String(date.getMinutes());
		if (minute.length == 1) minute = "0" + minute;
		second = String(date.getSeconds());
		if (second.length == 1) second = "0" + second;
		if (shortFormat) return String(month + "-" + day + " " + hour + ":" + minute);
		return String(year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second);
	}

	var formatTime = function(time) {
		if (isNaN(time)) return '00:00';
		return formatInt(parseInt(time / 60), 2) + ':' + formatInt(parseInt(time % 60), 2);
	}

	var convertTime = function(formattedTime) {
		var timeParts = formattedTime.split(":"),
			total = 0;
		for (var i = 0; i < timeParts.length; i++) {
			total *= 60;
			var value = parseInt(timeParts[i]);
			if (isNaN(value) || value < 0) return false;
			total += value;
		}
		return total;
	}
	var hoverTooltip = function(elem, follow, yoffset) {
		if (!elem) return;
		elem.addEventListener("mousemove", function(e) {
			var tooltip = $("ABP-Tooltip"),
				elemWidth = elem.clientWidth,
				elemHeight = elem.clientHeight,
				elemOffset = elem.getBoundingClientRect(),
				unitOffset = findClosest(elem, 'ABP-Unit').getBoundingClientRect(),
				elemTop = elemOffset.top - unitOffset.top,
				elemLeft = follow ? e.clientX - unitOffset.left : elemOffset.left - unitOffset.left;
			if (tooltip == null) {
				tooltip = _("div", {
					"id": "ABP-Tooltip",
				}, [_("text", elem.tooltipData)]);
				tooltip.by = elem;
				findClosest(elem, 'ABP-Unit').appendChild(tooltip);
				tooltip.style["top"] = elemTop + elemHeight + 2 + "px";
				tooltip.style["left"] = elemLeft + elemWidth / 2 - tooltip.clientWidth / 2 + "px";
			}
			if (follow) {
				tooltip.style["left"] = elemLeft - tooltip.clientWidth / 2 + "px";
			}
			if (yoffset) {
				tooltip.style["top"] = elemTop - tooltip.clientHeight + 2 + yoffset + "px";
			}
		});
		elem.addEventListener("mouseout", function() {
			var tooltip = $("ABP-Tooltip");
			if (tooltip && tooltip.parentNode) {
				tooltip.parentNode.removeChild(tooltip);
			}
		});
		elem.addEventListener("updatetooltip", function(e) {
			var tooltip = $("ABP-Tooltip");
			if (tooltip && tooltip.by == e.target) {
				tooltip.innerHTML = htmlEscape(elem.tooltipData);
			}
		});
	}
	var addClass = function(elem, className) {
		if (elem == null) return;
		var oldClass = elem.className.split(" ");
		if (oldClass[0] == "") oldClass = [];
		if (oldClass.indexOf(className) < 0) {
			oldClass.push(className);
		}
		elem.className = oldClass.join(" ");
	};
	var hasClass = function(elem, className) {
		if (elem == null) return false;
		var oldClass = elem.className.split(" ");
		if (oldClass[0] == "") oldClass = [];
		return oldClass.indexOf(className) >= 0;
	}
	var removeClass = function(elem, className) {
		if (elem == null) return;
		var oldClass = elem.className.split(" ");
		if (oldClass[0] == "") oldClass = [];
		if (oldClass.indexOf(className) >= 0) {
			oldClass.splice(oldClass.indexOf(className), 1);
		}
		elem.className = oldClass.join(" ");
	};
	var buildFromDefaults = function(n, d) {
		var r = {};
		for (var i in d) {
			if (n && typeof n[i] !== "undefined")
				r[i] = n[i];
			else
				r[i] = d[i];
		}
		return r;
	}


	ABP.create = function(element, params) {
		var elem = element;
		if (!params) {
			params = {};
		}
		ABP.playerConfig = params.config ? params.config : {};
		params = buildFromDefaults(params, {
			"replaceMode": true,
			"width": 512,
			"height": 384,
			"src": ""
		});
		if (typeof element === "string") {
			elem = $(element);
		}
		// 'elem' is the parent container in which we create the player.
		if (!hasClass(elem, "ABP-Unit")) {
			// Assuming we are injecting
			var container = _("div", {
				"className": "ABP-Unit",
				"style": {
					"width": params.width.toString().indexOf("%") >= 0 ? params.width : params.width + "px",
					"height": params.height.toString().indexOf("%") >= 0 ? params.height : params.height + "px"
				}
			});
			elem.appendChild(container);
		} else {
			container = elem;
		}
		// Create the innards if empty
		if (container.children.length > 0 && params.replaceMode) {
			container.innerHTML = "";
		}
		var playlist = [];
		var danmaku = [];
		if (typeof params.src === "string") {
			params.src = _("video", {
				"autobuffer": "true",
				"dataSetup": "{}",
			}, [
				_("source", {
					"src": params.src
				})
			]);
			playlist.push(params.src);
		} else if (params.src.hasOwnProperty("playlist")) {
			var data = params.src;
			var plist = data.playlist;
			for (var id = 0; id < plist.length; id++) {
				if (plist[id].hasOwnProperty("sources")) {
					var sources = [];
					for (var mime in plist[id]["sources"]) {
						sources.push(_("source", {
							"src": plist[id][mime],
							"type": mime
						}));
					}
					playlist.push(_("video", {
						"autobuffer": "true",
						"dataSetup": "{}",
					}, sources));
				} else if (plist[id].hasOwnProperty("video")) {
					playlist.push(plist[id]["video"]);
				} else {}
				danmaku.push(plist[id]["comments"]);
			}
		} else {
			playlist.push(params.src);
		}
		container.appendChild(_("div", {
			"className": "ABP-Player"
		}, [_("div", {
			"className": "ABP-Video",
			"tabindex": "10"
		}, [_("div", {
				"className": "ABP-Container"
			}),
			playlist[0]
		]), _("div", {
			"className": "ABP-Bottom",
		}, [_("div", {
			"className": "ABP-Text",
		}, [
			_("div", {
				"className": "ABP-CommentStyle"
			}, [
				_("div", {
					"className": "button-group ABP-Comment-FontGroup"
				}, [_("div", {
					"className": "button ABP-Comment-Font icon-font-style"
				}), _("div", {
					"className": "ABP-Comment-FontOption"
				}, [
					_("p", {
						"className": "style-title"
					}, [_("text", "弹幕字号")]),
					_("div", {
						"className": "style-select",
						"name": "commentFontSize"
					}, [_("div", {
						"className": "style-option",
						"value": 18
					}, [_("text", "小字号")]), _("div", {
						"className": "style-option on",
						"value": 25
					}, [_("text", "中字号")])]),
					_("p", {
						"className": "style-title"
					}, [_("text", "弹幕模式")]),
					_("div", {
						"className": "style-select",
						"name": "commentMode"
					}, [_("div", {
						"className": "style-option",
						"value": 5
					}, [_("text", "顶端渐隐")]), _("div", {
						"className": "style-option on",
						"value": 1
					}, [_("text", "滚动字幕")]), _("div", {
						"className": "style-option",
						"value": 4
					}, [_("text", "底端渐隐")])])
				])]),
				_("div", {
					"className": "button-group ABP-Comment-ColorGroup"
				}, [_("div", {
					"className": "ABP-Comment-Color-Display"
				}), _("div", {
					"className": "button ABP-Comment-Color icon-color-mode"
				}), _("div", {
					"className": "ABP-Comment-ColorOption"
				}, [_("div", {
					"className": "ABP-Comment-ColorPicker"
				})])]),
			]),
			_("input", {
				"className": "ABP-Comment-Input",
			}),
			_("div", {
				"className": "ABP-Comment-Send"
			}, [
				_("text", "发送")
			])
		]), _("div", {
			"className": "ABP-Control"
		}, [
			_("div", {
				"className": "button ABP-Play icon-play"
			}),
			_("div", {
				"className": "progress-bar"
			}, [
				_("div", {
					"className": "bar"
				}, [
					_("div", {
						"className": "load"
					}),
					_("div", {
						"className": "dark"
					})
				]),
			]),
			_("div", {
				"className": "time-label"
			}, [_("text", "00:00 / 00:00")]),
			_("div", {
				"className": "button ABP-Volume icon-volume-high"
			}),
			_("div", {
				"className": "volume-bar"
			}, [
				_("div", {
					"className": "bar"
				}, [
					_("div", {
						"className": "load"
					})
				]),
			]),
			_("div", {
				"className": "button-group ABP-CommentGroup"
			}, [_("div", {
				"className": "button ABP-CommentShow icon-comment on"
			}), _("div", {
				"className": "ABP-CommentOption"
			}, [_("p", {
				"className": "label"
			}, [_("text", "弹幕比例")]), _("div", {
				"className": "scale-bar"
			}, [
				_("div", {
					"className": "bar"
				}, [
					_("div", {
						"className": "load"
					})
				]),
			]), _("div", {
				"className": "prop-checkbox"
			}), _("p", {
				"className": "label"
			}, [_("text", "弹幕不透明度")]), _("div", {
				"className": "opacity-bar"
			}, [
				_("div", {
					"className": "bar"
				}, [
					_("div", {
						"className": "load"
					})
				]),
			])])]),
			_("div", {
				"className": "button ABP-Loop icon-loop"
			}),
			_("div", {
				"className": "button ABP-WideScreen icon-tv"
			}),
			_("div", {
				"className": "button-group ABP-FullScreenGroup"
			}, [_("div", {
				"className": "button ABP-FullScreen icon-screen-full"
			}), _("div", {
				"className": "button ABP-Web-FullScreen icon-screen"
			})])
		])])]));
		container.appendChild(_("div", {
			"className": "ABP-Comment-List"
		}, [
			_("div", {
				"className": "ABP-Comment-List-Title"
			}, [_("div", {
				"className": "cmt-time",
				"item": "time"
			}, [_("text", "时间")]), _("div", {
				"className": "cmt-content",
				"item": "content"
			}, [_("text", "评论")]), _("div", {
				"className": "cmt-date",
				"item": "date"
			}, [_("text", " 发送日期")])]), _("div", {
				"className": "ABP-Comment-List-Container"
			}, [_("ul", {
				"className": "ABP-Comment-List-Container-Inner"
			})])
		]));
		var bind = ABP.bind(container);
		if (playlist.length > 0) {
			var currentVideo = playlist[0];
			bind.gotoNext = function() {
				var index = playlist.indexOf(currentVideo) + 1;
				if (index < playlist.length) {
					currentVideo = playlist[index];
					currentVideo.style.display = "";
					var container = bind.video.parentNode;
					container.removeChild(bind.video);
					container.appendChild(currentVideo);
					bind.video.style.display = "none";
					bind.video = currentVideo;
					bind.swapVideo(currentVideo);
					currentVideo.addEventListener("ended", function() {
						bind.gotoNext();
					});
				}
				if (index < danmaku.length && danmaku[index] !== null) {
					CommentLoader(danmaku[index], bind.cmManager);
				}
			}
			currentVideo.addEventListener("ended", function() {
				bind.gotoNext();
			});
			CommentLoader(danmaku[0], bind.cmManager);
		}
		return bind;
	}

	ABP.bind = function(playerUnit, state) {
		var ABPInst = {
			playerUnit: playerUnit,
			btnPlay: null,
			barTime: null,
			barLoad: null,
			barTimeHitArea: null,
			barVolume: null,
			barVolumeHitArea: null,
			barOpacity: null,
			barOpacityHitArea: null,
			barScale: null,
			barScaleHitArea: null,
			btnFont: null,
			btnColor: null,
			btnSend: null,
			controlBar: null,
			timeLabel: null,
			timeJump: null,
			divComment: null,
			btnWide: null,
			btnFull: null,
			btnWebFull: null,
			btnDm: null,
			btnLoop: null,
			btnProp: null,
			videoDiv: null,
			btnVolume: null,
			video: null,
			txtText: null,
			commentColor: 'ffffff',
			commentFontSize: 25,
			commentMode: 1,
			displayColor: null,
			cmManager: null,
			commentList: null,
			commentListContainer: null,
			lastSelectedComment: null,
			commentCoolDown: 5000,
			commentScale: ABP.playerConfig.scale ? ABP.playerConfig.scale : 1,
			proportionalScale: ABP.playerConfig.prop,
			defaults: {
				w: 0,
				h: 0
			},
			state: buildFromDefaults(state, {
				fullscreen: false,
				commentVisible: true,
				allowRescale: false,
				autosize: false
			}),
			createPopup: function(text, delay) {
				if (playerUnit.hasPopup === true)
					return false;
				var p = _("div", {
					"className": "ABP-Popup"
				}, [_("text", text)]);
				p.remove = function() {
					if (p.isRemoved) return;
					p.isRemoved = true;
					playerUnit.removeChild(p);
					playerUnit.hasPopup = false;
				};
				playerUnit.appendChild(p);
				playerUnit.hasPopup = true;
				if (typeof delay === "number") {
					setTimeout(function() {
						p.remove();
					}, delay);
				}
				return p;
			},
			removePopup: function() {
				var pops = playerUnit.getElementsByClassName("ABP-Popup");
				for (var i = 0; i < pops.length; i++) {
					if (pops[i].remove != null) {
						pops[i].remove();
					} else {
						pops[i].parentNode.removeChild(pops[i]);
					}
				}
				playerUnit.hasPopup = false;
			},
			loadCommentList: function(sort, order) {
				order = order == "asc" ? -1 : 1;
				var keysSorted = Object.keys(ABPInst.commentList).sort(function(a, b) {
					if (ABPInst.commentList[a][sort] < ABPInst.commentList[b][sort]) return order;
					if (ABPInst.commentList[a][sort] > ABPInst.commentList[b][sort]) return -order;
					return 0;
				});
				ABPInst.commentObjArray = [];
				for (i in keysSorted) {
					var key = keysSorted[i];
					var comment = ABPInst.commentList[key];
					if (comment && comment.time) {
						var commentObj = _("li", {}),
							commentObjTime = _("span", {
								"className": "cmt-time"
							}, [_("text", formatTime(comment.time / 1000))]),
							commentObjContent = _("span", {
								"className": "cmt-content"
							}, [_("text", comment.content)]),
							commentObjDate = _("span", {
								"className": "cmt-date"
							}, [_("text", formatDate(comment.date, true))]);
						hoverTooltip(commentObjContent, false, 36);
						hoverTooltip(commentObjDate, false, 18);
						commentObjContent.tooltip(comment.content);
						commentObjDate.tooltip(formatDate(comment.date));
						commentObj.appendChild(commentObjTime);
						commentObj.appendChild(commentObjContent);
						commentObj.appendChild(commentObjDate);
						commentObj.data = comment;
						commentObj.addEventListener("dblclick", function(e) {
							ABPInst.video.currentTime = this.data.time / 1000;
							updateTime(video.currentTime);
						});
						ABPInst.commentObjArray.push(commentObj);
					}
				}
				ABPInst.commentListContainer.style.height = ABPInst.commentObjArray.length * 24 + "px";
				ABPInst.renderCommentList();
			},
			renderCommentList: function() {
				var offset = ABPInst.commentListContainer.parentElement.scrollTop,
					firstIndex = parseInt(offset / 24);
				ABPInst.commentListContainer.innerHTML = "";
				for (var i = firstIndex; i <= firstIndex + 40; i++) {
					if (typeof ABPInst.commentObjArray[i] !== "undefined") {
						if (i == firstIndex && i > 0) {
							var commentObj = ABPInst.commentObjArray[i].cloneNode(true),
								commentObjContent = commentObj.getElementsByClassName("cmt-content")[0],
								commentObjDate = commentObj.getElementsByClassName("cmt-date")[0];
							commentObj.addEventListener("dblclick", function(e) {
								ABPInst.video.currentTime = ABPInst.commentObjArray[i].data.time / 1000;
								updateTime(video.currentTime);
							});
							hoverTooltip(commentObjContent, false, 36);
							hoverTooltip(commentObjDate, false, 18);
							commentObjContent.tooltip(ABPInst.commentObjArray[i].data.content);
							commentObjDate.tooltip(formatDate(ABPInst.commentObjArray[i].data.date));
							commentObj.style.paddingTop = 24 * firstIndex + "px";
						} else {
							var commentObj = ABPInst.commentObjArray[i];
						}
						ABPInst.commentListContainer.appendChild(commentObj);
					} else {
						break;
					}
				}
				ABPInst.commentListContainer.parentElement.scrollTop = offset;
			},
			commentCallback: function(data) {
				if (data.result) {
					ABPInst.commentList[data.id] = ABPInst.commentList[data.tmp_id];
					delete ABPInst.commentList[data.tmp_id];
				} else {
					delete ABPInst.commentList[data.tmp_id];
					ABPInst.createPopup(data.error, 5000);
				}
			},
			swapVideo: null
		};
		ABPInst.swapVideo = function(video) {
			video.addEventListener("timeupdate", function() {
				if (!dragging) {
					updateTime(video.currentTime);
				}
			});
			video.addEventListener("ended", function() {
				ABPInst.btnPlay.className = "button ABP-Play icon-play";
				ABPInst.barTime.style.width = "0%";
			});
			video.addEventListener("progress", function() {
				if (this.buffered != null) {
					try {
						var s = this.buffered.start(0);
						var e = this.buffered.end(0);
					} catch (err) {
						return;
					}
					var dur = this.duration;
					var perc = (e / dur) * 100;
					ABPInst.barLoad.style.width = perc + "%";
				}
			});
			video.addEventListener("loadedmetadata", function() {
				if (this.buffered != null) {
					try {
						var s = this.buffered.start(0);
						var e = this.buffered.end(0);
					} catch (err) {
						return;
					}
					var dur = this.duration;
					var perc = (e / dur) * 100;
					ABPInst.barLoad.style.width = perc + "%";
				}
			});
			video.isBound = true;
			var lastPosition = 0;
			if (ABPInst.cmManager) {
				ABPInst.cmManager.addEventListener("load", function() {
					ABPInst.commentList = {};
					for (i in ABPInst.cmManager.timeline) {
						var danmaku = ABPInst.cmManager.timeline[i];
						if (danmaku.dbid && danmaku.stime) {
							ABPInst.commentList[danmaku.dbid] = {
								"date": danmaku.date,
								"time": danmaku.stime,
								"mode": danmaku.mode,
								"user": danmaku.hash,
								"pool": danmaku.pool,
								"content": danmaku.text
							}
						}
					}
					ABPInst.loadCommentList("date", "asc");
					ABPInst.commentListContainer.parentElement.addEventListener("scroll", ABPInst.renderCommentList);
				});
				ABPInst.cmManager.setBounds = function() {
					if (playerUnit.offsetHeight <= 300 || playerUnit.offsetWidth <= 700) {
						addClass(playerUnit, "ABP-Mini");
						ABPInst.proportionalScale = true;
					} else {
						removeClass(playerUnit, "ABP-Mini");
						ABPInst.proportionalScale = ABPInst.btnProp.classList.contains("on");
					}
					var actualWidth = ABPInst.videoDiv.offsetWidth,
						actualHeight = ABPInst.videoDiv.offsetHeight,
						scale = ABPInst.proportionalScale ? actualHeight / 493 * ABPInst.commentScale : ABPInst.commentScale;
					this.width = actualWidth / scale;
					this.height = actualHeight / scale;
					this.options.global.scale = this.width / 680;
					this.dispatchEvent("resize");
					for (var a in this.csa) this.csa[a].setBounds(this.width, this.height);
					this.stage.style.width = this.width + "px";
					this.stage.style.height = this.height + "px";
					this.stage.style.perspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
					this.stage.style.webkitPerspective = this.width * Math.tan(40 * Math.PI / 180) / 2 + "px";
					this.stage.style.zoom = scale;
				}
				ABPInst.cmManager.setBounds();
				ABPInst.cmManager.clear();
				var lastCheckTime = 0;
				video.addEventListener("progress", function() {
					if (lastPosition == video.currentTime && isPlaying && new Date().getTime() - lastCheckTime >= 100) {
						video.hasStalled = true;
						//ABPInst.cmManager.stopTimer();
						ABPInst.cmManager.stop();
						//ABPInst.cmManager.pauseComment();
					} else if (lastPosition != video.currentTime) {
						lastPosition = video.currentTime;
					}
					lastCheckTime = new Date().getTime();
				});
				if (window) {
					window.addEventListener("resize", function() {
						ABPInst.cmManager.setBounds();
					});
				}
				video.addEventListener("timeupdate", function() {
					if (ABPInst.cmManager.display === false) return;
					if (video.hasStalled) {
						//ABPInst.cmManager.startTimer();
						ABPInst.cmManager.start();
						//ABPInst.cmManager.resumeComment();
						video.hasStalled = false;
					}
					ABPInst.cmManager.time(Math.floor(video.currentTime * 1000));
				});
				video.addEventListener("play", function() {
					ABPInst.cmManager.setBounds();
					//ABPInst.cmManager.startTimer();
					ABPInst.cmManager.start();
					//ABPInst.cmManager.resumeComment();
					//console.log(ABPInst.cmManager);
					try {
						var e = this.buffered.end(0);
						var dur = this.duration;
						var perc = (e / dur) * 100;
						ABPInst.barLoad.style.width = perc + "%";
					} catch (err) {}
				});
				video.addEventListener("ratechange", function() {
					if (ABPInst.cmManager.options.global.scale != null) {
						if (video.playbackRate !== 0) {
							ABPInst.cmManager.options.global.scale = (1 / video.playbackRate);
							ABPInst.cmManager.rescale();
						}
					}
				});
				var isPlaying = false;
				video.addEventListener("pause", function() {
					//ABPInst.cmManager.stopTimer();
					ABPInst.cmManager.stop();
					//ABPInst.cmManager.pauseComment();
					isPlaying = false;
				});
				video.addEventListener("waiting", function() {
					//ABPInst.cmManager.stopTimer();
					ABPInst.cmManager.stop();
					//ABPInst.cmManager.pauseComment();
					isPlaying = false;
				});
				video.addEventListener("playing", function() {
					//ABPInst.cmManager.startTimer();
					ABPInst.cmManager.start();
					//ABPInst.cmManager.resumeComment();
					isPlaying = true;
				});
			}
		}
		if (playerUnit === null || playerUnit.getElementsByClassName === null) return;
		ABPInst.defaults.w = playerUnit.offsetWidth;
		ABPInst.defaults.h = playerUnit.offsetHeight;
		var _v = playerUnit.getElementsByClassName("ABP-Video");
		if (_v.length <= 0) return;
		var video = null;
		ABPInst.videoDiv = _v[0];
		for (var i in _v[0].children) {
			if (_v[0].children[i].tagName != null &&
				_v[0].children[i].tagName.toUpperCase() === "VIDEO") {
				video = _v[0].children[i];
				break;
			}
		}
		var cmtc = _v[0].getElementsByClassName("ABP-Container");
		if (cmtc.length > 0)
			ABPInst.divComment = cmtc[0];
		if (video === null) return;
		ABPInst.video = video;
		/** Bind the Play Button **/
		var _p = playerUnit.getElementsByClassName("ABP-Play");
		if (_p.length <= 0) return;
		ABPInst.btnPlay = _p[0];
		ABPInst.btnPlay.tooltip("播放");
		hoverTooltip(ABPInst.btnPlay);
		/** Bind the Loading Progress Bar **/
		var pbar = playerUnit.getElementsByClassName("progress-bar");
		if (pbar.length <= 0) return;
		var pbars = pbar[0].getElementsByClassName("bar");
		ABPInst.barTimeHitArea = pbars[0];
		ABPInst.barLoad = pbars[0].getElementsByClassName("load")[0];
		ABPInst.barTime = pbars[0].getElementsByClassName("dark")[0];
		/** Bind the Time Label **/
		var _tl = playerUnit.getElementsByClassName("time-label");
		if (_tl.length <= 0) return;
		ABPInst.timeLabel = _tl[0];
		/** Bind the Volume button **/
		var vlmbtn = playerUnit.getElementsByClassName("ABP-Volume");
		if (vlmbtn.length <= 0) return;
		ABPInst.btnVolume = vlmbtn[0];
		ABPInst.btnVolume.tooltip("静音");
		hoverTooltip(ABPInst.btnVolume);
		/** Bind the Volume Bar **/
		var vbar = playerUnit.getElementsByClassName("volume-bar");
		if (vbar.length <= 0) return;
		var vbars = vbar[0].getElementsByClassName("bar");
		ABPInst.barVolumeHitArea = vbars[0];
		ABPInst.barVolume = vbars[0].getElementsByClassName("load")[0];
		/** Bind the Opacity Bar **/
		var obar = playerUnit.getElementsByClassName("opacity-bar");
		if (obar.length <= 0) return;
		var obar = obar[0].getElementsByClassName("bar");
		ABPInst.barOpacityHitArea = obar[0];
		ABPInst.barOpacity = obar[0].getElementsByClassName("load")[0];
		/** Bind the Scale Bar **/
		var sbar = playerUnit.getElementsByClassName("scale-bar");
		if (sbar.length <= 0) return;
		var sbar = sbar[0].getElementsByClassName("bar");
		ABPInst.barScaleHitArea = sbar[0];
		ABPInst.barScale = sbar[0].getElementsByClassName("load")[0];
		/** Bind the Proportional Scale checkbox **/
		var pcheck = playerUnit.getElementsByClassName("prop-checkbox");
		if (pcheck.length <= 0) return;
		ABPInst.btnProp = pcheck[0];
		ABPInst.btnProp.tooltip("缩放同步");
		hoverTooltip(ABPInst.btnProp);
		/** Bind the FullScreen button **/
		var fbtn = playerUnit.getElementsByClassName("ABP-FullScreen");
		if (fbtn.length <= 0) return;
		ABPInst.btnFull = fbtn[0];
		ABPInst.btnFull.tooltip("浏览器全屏");
		hoverTooltip(ABPInst.btnFull);
		/** Bind the WebFullScreen button **/
		var wfbtn = playerUnit.getElementsByClassName("ABP-Web-FullScreen");
		if (wfbtn.length <= 0) return;
		ABPInst.btnWebFull = wfbtn[0];
		ABPInst.btnWebFull.tooltip("网页全屏");
		hoverTooltip(ABPInst.btnWebFull);
		/** Bind the WideScreen button **/
		var wsbtn = playerUnit.getElementsByClassName("ABP-WideScreen");
		if (wsbtn.length <= 0) return;
		ABPInst.btnWide = wsbtn[0];
		ABPInst.btnWide.tooltip("宽屏模式");
		hoverTooltip(ABPInst.btnWide);
		/** Bind the Comment Font button **/
		var cfbtn = playerUnit.getElementsByClassName("ABP-Comment-Font");
		if (cfbtn.length <= 0) return;
		ABPInst.btnFont = cfbtn[0];
		ABPInst.btnFont.tooltip("弹幕样式");
		hoverTooltip(ABPInst.btnFont);
		/** Bind the Comment Color button **/
		var ccbtn = playerUnit.getElementsByClassName("ABP-Comment-Color");
		if (ccbtn.length <= 0) return;
		ABPInst.btnColor = ccbtn[0];
		ABPInst.btnColor.tooltip("弹幕颜色");
		hoverTooltip(ABPInst.btnColor);
		var ccd = playerUnit.getElementsByClassName("ABP-Comment-Color-Display");
		if (ccd.length <= 0) return;
		ABPInst.displayColor = ccd[0];
		/** Bind the Comment Input **/
		var cmti = playerUnit.getElementsByClassName("ABP-Comment-Input");
		if (cmti.length <= 0) return;
		ABPInst.txtText = cmti[0];
		/** Bind the Send Comment List Container **/
		var clc = playerUnit.getElementsByClassName("ABP-Comment-List-Container-Inner");
		if (clc.length <= 0) return;
		ABPInst.commentListContainer = clc[0];
		/** Bind the Send Comment button **/
		var csbtn = playerUnit.getElementsByClassName("ABP-Comment-Send");
		if (csbtn.length <= 0) return;
		ABPInst.btnSend = csbtn[0];
		ABPInst.btnSend.tooltip("毁灭地喷射白光!da!");
		hoverTooltip(ABPInst.btnSend);
		// Controls
		var controls = playerUnit.getElementsByClassName("ABP-Control");
		if (controls.length > 0) {
			ABPInst.controlBar = controls[0];
		}
		/** Bind the Comment Disable button **/
		var cmbtn = playerUnit.getElementsByClassName("ABP-CommentShow");
		if (cmbtn.length <= 0) return;
		ABPInst.btnDm = cmbtn[0];
		ABPInst.btnDm.tooltip("隐藏弹幕");
		hoverTooltip(ABPInst.btnDm);
		/** Bind the Loop button **/
		var lpbtn = playerUnit.getElementsByClassName("ABP-Loop");
		if (lpbtn.length <= 0) return;
		ABPInst.btnLoop = lpbtn[0];
		ABPInst.btnLoop.tooltip("洗脑循环 off");
		hoverTooltip(ABPInst.btnLoop);
		/** Create a commentManager if possible **/
		if (typeof CommentManager !== "undefined") {
			ABPInst.cmManager = new CommentManager(ABPInst.divComment);
			ABPInst.cmManager.display = true;
			ABPInst.cmManager.init();
			ABPInst.cmManager.clear();
			if (window) {
				window.addEventListener("resize", function() {
					//Notify on resize
					ABPInst.cmManager.setBounds();
				});
			}
		}
		if (typeof ABP.playerConfig == "object") {
			if (ABP.playerConfig.volume) ABPInst.video.volume = ABP.playerConfig.volume;
			if (ABP.playerConfig.opacity) ABPInst.cmManager.options.global.opacity = ABP.playerConfig.opacity;
		}
		$$('.ABP-Comment-List-Title *').click(function() {
			var item = $$(this).attr('item'),
				order = $$(this).hasClass('asc') ? 'desc' : 'asc';
			$$('.ABP-Comment-List-Title *').removeClass('asc').removeClass('desc');
			$$(this).addClass(order);
			ABPInst.loadCommentList(item, order);
		});
		$$('.ABP-Unit .ABP-CommentStyle .ABP-Comment-FontOption .style-option').click(function() {
			$$(this).closest('.style-select').find('.style-option').removeClass('on');
			$$(this).addClass('on');
			ABPInst[$$(this).closest('.style-select').attr('name')] = parseInt($$(this).attr('value'));
		});
		$$(playerUnit).find('.ABP-Comment-ColorPicker').colpick({
			flat: true,
			submit: 0,
			color: 'ffffff',
			onChange: function(hsb, hex) {
				ABPInst.commentColor = hex;
				ABPInst.displayColor.style.backgroundColor = '#' + hex;
			}
		});
		if (video.isBound !== true) {
			ABPInst.swapVideo(video);
			ABPInst.videoDiv.addEventListener("click", function(e) {
				ABPInst.btnPlay.click();
				e.preventDefault();
			});
			var hideCursorTimer = null;
			ABPInst.videoDiv.addEventListener("mousemove", function() {
				if (hideCursorTimer) {
					window.clearTimeout(hideCursorTimer);
				}
				if (hasClass(ABPInst.videoDiv, "ABP-HideCursor")) {
					removeClass(ABPInst.videoDiv, "ABP-HideCursor");
				}
				hideCursorTimer = window.setTimeout(function() {
					addClass(ABPInst.videoDiv, "ABP-HideCursor");
				}, 3000);
			});
			ABPInst.btnVolume.addEventListener("click", function() {
				if (ABPInst.video.muted == false) {
					ABPInst.video.muted = true;
					this.className = "button ABP-Volume icon-volume-mute2";
					this.tooltip("取消静音");
					ABPInst.barVolume.style.width = "0%";
				} else {
					ABPInst.video.muted = false;
					this.className = "button ABP-Volume icon-volume-";
					if (ABPInst.video.volume < .10) this.className += "mute";
					else if (ABPInst.video.volume < .33) this.className += "low";
					else if (ABPInst.video.volume < .67) this.className += "medium";
					else this.className += "high";
					this.tooltip("静音");
					ABPInst.barVolume.style.width = (ABPInst.video.volume * 100) + "%";
				}
			});
			ABPInst.btnWebFull.addEventListener("click", function() {
				ABPInst.state.fullscreen = hasClass(playerUnit, "ABP-FullScreen");
				addClass(playerUnit, "ABP-FullScreen");
				ABPInst.btnFull.className = "button ABP-FullScreen icon-screen-normal";
				ABPInst.btnFull.tooltip("退出网页全屏");
				ABPInst.state.fullscreen = true;
				if (ABPInst.cmManager)
					ABPInst.cmManager.setBounds();
				if (!ABPInst.state.allowRescale) return;
				if (ABPInst.state.fullscreen) {
					if (ABPInst.defaults.w > 0) {
						ABPInst.cmManager.options.scrollScale = playerUnit.offsetWidth / ABPInst.defaults.w;
					}
				} else {
					ABPInst.cmManager.options.scrollScale = 1;
				}
			});
			ABPInst.btnFont.addEventListener("click", function(e) {
				this.parentNode.classList.toggle("on");
			});
			ABPInst.btnColor.addEventListener("click", function(e) {
				this.parentNode.classList.toggle("on");
			});
			if (ABPInst.proportionalScale) {
				ABPInst.btnProp.classList.add("on");
			}
			ABPInst.btnProp.addEventListener("click", function(e) {
				this.classList.toggle("on");
				ABPInst.proportionalScale = this.classList.contains("on");
				ABPInst.cmManager.setBounds();
				saveConfigurations();
			});
			var fullscreenChangeHandler = function() {
				if (!document.isFullScreen() && hasClass(playerUnit, "ABP-FullScreen")) {
					removeClass(playerUnit, "ABP-FullScreen");
					ABPInst.btnFull.className = "button ABP-FullScreen icon-screen-full";
					ABPInst.btnFull.tooltip("浏览器全屏");
				};/*
				if (document.isFullScreen()) {
				    ABPInst.proportionalScale = false;
				    ABPInst.cmManager.setBounds();
				} else {
				    ABPInst.proportionalScale = ABPInst.btnProp.classList.contains("on");
				    ABPInst.cmManager.setBounds();
				};*/
			}
			document.addEventListener("fullscreenchange", fullscreenChangeHandler, false);
			document.addEventListener("webkitfullscreenchange", fullscreenChangeHandler, false);
			document.addEventListener("mozfullscreenchange", fullscreenChangeHandler, false);
			document.addEventListener("MSFullscreenChange", fullscreenChangeHandler, false);
			ABPInst.btnFull.addEventListener("click", function() {
				ABPInst.state.fullscreen = hasClass(playerUnit, "ABP-FullScreen");
				if (!ABPInst.state.fullscreen) {
					addClass(playerUnit, "ABP-FullScreen");
					this.className = "button ABP-FullScreen icon-screen-normal";
					this.tooltip("退出全屏");
					playerUnit.requestFullScreen();
				} else {
					removeClass(playerUnit, "ABP-FullScreen");
					this.className = "button ABP-FullScreen icon-screen-full";
					this.tooltip("浏览器全屏");
					document.exitFullscreen();
				}
				ABPInst.state.fullscreen = !ABPInst.state.fullscreen;
				if (ABPInst.cmManager)
					ABPInst.cmManager.setBounds();
				if (!ABPInst.state.allowRescale) return;
				if (ABPInst.state.fullscreen) {
					if (ABPInst.defaults.w > 0) {
						ABPInst.cmManager.options.scrollScale = playerUnit.offsetWidth / ABPInst.defaults.w;
					}
				} else {
					ABPInst.cmManager.options.scrollScale = 1;
				}
			});

			ABPInst.btnWide.addEventListener("click", function() {
				ABPInst.state.widescreen = hasClass(playerUnit, "ABP-WideScreen");
				if (!ABPInst.state.widescreen) {
					addClass(playerUnit, "ABP-WideScreen");
					this.className = "button ABP-WideScreen icon-tv on";
					playerUnit.dispatchEvent(new Event("wide"));
					this.tooltip("退出宽屏");
				} else {
					removeClass(playerUnit, "ABP-WideScreen");
					this.className = "button ABP-WideScreen icon-tv";
					playerUnit.dispatchEvent(new Event("normal"));
					this.tooltip("宽屏模式");
				}
				ABPInst.state.widescreen = !ABPInst.state.widescreen;
				if (ABPInst.cmManager)
					ABPInst.cmManager.setBounds();
				if (!ABPInst.state.allowRescale) return;
				if (ABPInst.state.fullscreen) {
					if (ABPInst.defaults.w > 0) {
						ABPInst.cmManager.options.scrollScale = playerUnit.offsetWidth / ABPInst.defaults.w;
					}
				} else {
					ABPInst.cmManager.options.scrollScale = 1;
				}
			});
			ABPInst.btnDm.addEventListener("click", function() {
				if (ABPInst.cmManager.display == false) {
					ABPInst.cmManager.display = true;
					ABPInst.cmManager.start();
					this.className = "button ABP-CommentShow icon-comment on";
					this.tooltip("隐藏弹幕");
				} else {
					ABPInst.cmManager.display = false;
					ABPInst.cmManager.clear();
					ABPInst.cmManager.stop();
					this.className = "button ABP-CommentShow icon-comment";
					this.tooltip("显示弹幕");
				}
			});
			ABPInst.btnLoop.addEventListener("click", function() {
				if (ABPInst.video.loop == false) {
					ABPInst.video.loop = true;
					this.className = "button ABP-Loop icon-loop on";
					this.tooltip("洗脑循环 on");
				} else {
					ABPInst.video.loop = false;
					this.className = "button ABP-Loop icon-loop";
					this.tooltip("洗脑循环 off");
				}
			});

			var saveConfigurations = function() {
				ABPInst.playerUnit.dispatchEvent(new CustomEvent("saveconfig", {
					"detail": {
						"volume": ABPInst.video.volume,
						"opacity": ABPInst.cmManager.options.global.opacity,
						"scale": ABPInst.commentScale,
						"prop": ABPInst.proportionalScale
					}
				}));
			}

			var sendComment = function() {
				var date = new Date(),
					commentId = "" + date.getTime() + Math.random();
				if (ABPInst.txtText.value == "" || ABPInst.txtText.disabled) return false;
				ABPInst.playerUnit.dispatchEvent(new CustomEvent("sendcomment", {
					"detail": {
						"id": commentId,
						"message": ABPInst.txtText.value,
						"fontsize": ABPInst.commentFontSize,
						"color": parseInt("0x" + ABPInst.commentColor),
						"date": date.getFullYear() + "-" + pad(date.getMonth()) + "-" + pad(date.getDay()) +
							" " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()),
						"playTime": ABPInst.video.currentTime,
						"mode": ABPInst.commentMode,
						"pool": 0
					}
				}));
				ABPInst.cmManager.send({
					"text": ABPInst.txtText.value,
					"mode": ABPInst.commentMode,
					"stime": ABPInst.video.currentTime,
					"size": ABPInst.commentFontSize,
					"color": parseInt("0x" + ABPInst.commentColor),
					"border": true
				});
				ABPInst.commentList[commentId] = {
					"date": parseInt(date.getTime() / 1000),
					"time": ABPInst.video.currentTime * 1000,
					"mode": ABPInst.commentMode,
					"user": "-",
					"pool": 0,
					"content": ABPInst.txtText.value
				}
				ABPInst.txtText.value = "";
				ABPInst.txtText.disabled = true;
				setTimeout(function() {
					ABPInst.txtText.disabled = false;
				}, ABPInst.commentCoolDown);
			};

			ABPInst.txtText.addEventListener("keyup", function(e) {
				if (e.keyCode == 13) {
					sendComment();
				}
			});

			ABPInst.btnSend.addEventListener("click", sendComment);

			ABPInst.timeLabel.addEventListener("click", function() {
				ABPInst.timeJump = _("input", {
					"className": "time-jump"
				});
				ABPInst.timeJump.value = formatTime(ABPInst.video.currentTime);
				ABPInst.controlBar.appendChild(ABPInst.timeJump);
				ABPInst.timeJump.addEventListener("blur", function() {
					if (ABPInst.timeJump) ABPInst.timeJump.parentNode.removeChild(ABPInst.timeJump);
					ABPInst.timeJump = null;
				});
				ABPInst.timeJump.addEventListener("keydown", function(e) {
					if (e.keyCode == 13) {
						var time = convertTime(ABPInst.timeJump.value);
						if (time && time <= ABPInst.video.duration) {
							ABPInst.video.currentTime = time;
							if (ABPInst.video.paused) ABPInst.btnPlay.click();
						}
						ABPInst.timeJump.parentNode.removeChild(ABPInst.timeJump);
					} else if ((e.keyCode < 48 || e.keyCode > 58) && e.keyCode != 8 && e.keyCode != 37 && e.keyCode != 39 && e.keyCode != 46) {
						e.preventDefault();
					}
				});
				ABPInst.timeJump.focus();
				ABPInst.timeJump.select();
			});
			ABPInst.barTime.style.width = "0%";
			var dragging = false;
			ABPInst.barTimeHitArea.addEventListener("mousedown", function(e) {
				dragging = true;
			});
			document.addEventListener("mouseup", function(e) {
				if (dragging) {
					var newTime = ((e.clientX - ABPInst.barTimeHitArea.getBoundingClientRect().left) / ABPInst.barTimeHitArea.offsetWidth) * ABPInst.video.duration;
					if (newTime < 0) newTime = 0;
					if (Math.abs(newTime - ABPInst.video.currentTime) > 4) {
						if (ABPInst.cmManager)
							ABPInst.cmManager.clear();
					}
					ABPInst.video.currentTime = newTime;
				}
				dragging = false;
			});
			var updateTime = function(time) {
				ABPInst.barTime.style.width = (time / video.duration * 100) + "%";
				ABPInst.timeLabel.innerHTML = formatTime(time) + " / " + formatTime(video.duration);
			}
			document.addEventListener("mousemove", function(e) {
				var newTime = ((e.clientX - ABPInst.barTimeHitArea.getBoundingClientRect().left) / ABPInst.barTimeHitArea.offsetWidth) * ABPInst.video.duration;
				if (newTime < 0) newTime = 0;
				if (newTime > ABPInst.video.duration) newTime = ABPInst.video.duration;
				ABPInst.barTimeHitArea.tooltip(formatTime(newTime));
				if (dragging) {
					updateTime(newTime);
				}
			});
			hoverTooltip(ABPInst.barTimeHitArea, true, -12);
			var draggingVolume = false;
			ABPInst.barVolumeHitArea.addEventListener("mousedown", function(e) {
				draggingVolume = true;
			});
			ABPInst.barVolume.style.width = (ABPInst.video.volume * 100) + "%";
			var updateVolume = function(volume) {
				ABPInst.barVolume.style.width = (volume * 100) + "%";
				ABPInst.video.muted = false;
				ABPInst.btnVolume.className = "button ABP-Volume icon-volume-";
				if (volume < .10) ABPInst.btnVolume.className += "mute";
				else if (volume < .33) ABPInst.btnVolume.className += "low";
				else if (volume < .67) ABPInst.btnVolume.className += "medium";
				else ABPInst.btnVolume.className += "high";
				ABPInst.btnVolume.tooltip("静音");
				ABPInst.barVolumeHitArea.tooltip(parseInt(volume * 100) + "%");
				saveConfigurations();
			}
			document.addEventListener("mouseup", function(e) {
				if (draggingVolume) {
					var newVolume = (e.clientX - ABPInst.barVolumeHitArea.getBoundingClientRect().left) / ABPInst.barVolumeHitArea.offsetWidth;
					if (newVolume < 0) newVolume = 0;
					if (newVolume > 1) newVolume = 1;
					ABPInst.video.volume = newVolume;
					updateVolume(ABPInst.video.volume);
				}
				draggingVolume = false;
			});
			document.addEventListener("mousemove", function(e) {
				var newVolume = (e.clientX - ABPInst.barVolumeHitArea.getBoundingClientRect().left) / ABPInst.barVolumeHitArea.offsetWidth;
				if (newVolume < 0) newVolume = 0;
				if (newVolume > 1) newVolume = 1;
				if (draggingVolume) {
					ABPInst.video.volume = newVolume;
					updateVolume(ABPInst.video.volume);
				} else {
					ABPInst.barVolumeHitArea.tooltip(parseInt(newVolume * 100) + "%");
				}
			});
			hoverTooltip(ABPInst.barVolumeHitArea, true, -12);
			var draggingOpacity = false;
			ABPInst.barOpacityHitArea.addEventListener("mousedown", function(e) {
				draggingOpacity = true;
			});
			ABPInst.barOpacity.style.width = (ABPInst.cmManager.options.global.opacity * 100) + "%";
			var updateOpacity = function(opacity) {
				ABPInst.barOpacity.style.width = (opacity * 100) + "%";
				ABPInst.barOpacityHitArea.tooltip(parseInt(opacity * 100) + "%");
				saveConfigurations();
			}
			document.addEventListener("mouseup", function(e) {
				if (draggingOpacity) {
					var newOpacity = (e.clientX - ABPInst.barOpacityHitArea.getBoundingClientRect().left) / ABPInst.barOpacityHitArea.offsetWidth;
					if (newOpacity < 0) newOpacity = 0;
					if (newOpacity > 1) newOpacity = 1;
					ABPInst.cmManager.options.global.opacity = newOpacity;
					updateOpacity(ABPInst.cmManager.options.global.opacity);
				}
				draggingOpacity = false;
			});
			document.addEventListener("mousemove", function(e) {
				var newOpacity = (e.clientX - ABPInst.barOpacityHitArea.getBoundingClientRect().left) / ABPInst.barOpacityHitArea.offsetWidth;
				if (newOpacity < 0) newOpacity = 0;
				if (newOpacity > 1) newOpacity = 1;
				if (draggingOpacity) {
					ABPInst.cmManager.options.global.opacity = newOpacity;
					updateOpacity(ABPInst.cmManager.options.global.opacity);
				} else {
					ABPInst.barOpacityHitArea.tooltip(parseInt(newOpacity * 100) + "%");
				}
			});
			hoverTooltip(ABPInst.barOpacityHitArea, true, -6);
			var draggingScale = false;
			ABPInst.barScaleHitArea.addEventListener("mousedown", function(e) {
				draggingScale = true;
			});
			ABPInst.barScale.style.width = (ABPInst.commentScale - 0.2) / 4.8 * 100 + "%";
			var updateScale = function(scale) {
				ABPInst.barScale.style.width = (scale - 0.2) / 4.8 * 100 + "%";
				ABPInst.barScaleHitArea.tooltip(parseInt(scale * 100) + "%");
				ABPInst.cmManager.setBounds();
				saveConfigurations();
			}
			document.addEventListener("mouseup", function(e) {
				if (draggingScale) {
					var newScale = 0.2 + 4.8 * (e.clientX - ABPInst.barScaleHitArea.getBoundingClientRect().left) / ABPInst.barScaleHitArea.offsetWidth;
					if (newScale < 0.2) newScale = 0.2;
					if (newScale > 5) newScale = 5;
					ABPInst.commentScale = newScale;
					updateScale(ABPInst.commentScale);
				}
				draggingScale = false;
			});
			document.addEventListener("mousemove", function(e) {
				var newScale = 0.2 + 4.8 * (e.clientX - ABPInst.barScaleHitArea.getBoundingClientRect().left) / ABPInst.barScaleHitArea.offsetWidth;
				if (newScale < 0.2) newScale = 0.2;
				if (newScale > 5) newScale = 5;
				if (draggingScale) {
					ABPInst.commentScale = newScale;
					updateScale(ABPInst.commentScale);
				} else {
					ABPInst.barScaleHitArea.tooltip(parseInt(newScale * 100) + "%");
				}
			});
			hoverTooltip(ABPInst.barScaleHitArea, true, -6);
			ABPInst.btnPlay.addEventListener("click", function() {
				if (ABPInst.video.paused) {
					ABPInst.video.play();
					this.className = "button ABP-Play ABP-Pause icon-pause";
					this.tooltip("暂停");
				} else {
					ABPInst.video.pause();
					this.className = "button ABP-Play icon-play";
					this.tooltip("播放");
				}
			});
			playerUnit.addEventListener("keydown", function(e) {
				if (e && document.activeElement.tagName != "INPUT") {
					e.preventDefault();
					switch (e.keyCode) {
						case 32:
							ABPInst.btnPlay.click();
							break;
						case 37:
							var newTime = ABPInst.video.currentTime -= 5;
							ABPInst.cmManager.clear();
							if (newTime < 0) newTime = 0;
							ABPInst.video.currentTime = newTime.toFixed(3);
							if (ABPInst.video.paused) ABPInst.btnPlay.click();
							updateTime(video.currentTime);
							ABPInst.barTimeHitArea.tooltip(formatTime(video.currentTime));
							break;
						case 39:
							var newTime = ABPInst.video.currentTime += 5;
							ABPInst.cmManager.clear();
							if (newTime > ABPInst.video.duration) newTime = ABPInst.video.duration;
							ABPInst.video.currentTime = newTime.toFixed(3);
							if (ABPInst.video.paused) ABPInst.btnPlay.click();
							updateTime(video.currentTime);
							ABPInst.barTimeHitArea.tooltip(formatTime(video.currentTime));
							break;
						case 38:
							var newVolume = ABPInst.video.volume + .1;
							if (newVolume > 1) newVolume = 1;
							ABPInst.video.volume = newVolume.toFixed(3);
							updateVolume(ABPInst.video.volume);
							break;
						case 40:
							var newVolume = ABPInst.video.volume - .1;
							if (newVolume < 0) newVolume = 0;
							ABPInst.video.volume = newVolume.toFixed(3);
							updateVolume(ABPInst.video.volume);
							break;
					}
				}
			});
			playerUnit.addEventListener("touchmove", function(e) {
				event.preventDefault();
			});
			var _touch = null;
			playerUnit.addEventListener("touchstart", function(e) {
				if (e.targetTouches.length > 0) {
					//Determine whether we want to start or stop
					_touch = e.targetTouches[0];
				}
			});
			playerUnit.addEventListener("touchend", function(e) {
				if (e.changedTouches.length > 0) {
					if (_touch != null) {
						var diffx = e.changedTouches[0].pageX - _touch.pageX;
						var diffy = e.changedTouches[0].pageY - _touch.pageY;
						if (Math.abs(diffx) < 20 && Math.abs(diffy) < 20) {
							_touch = null;
							return;
						}
						if (Math.abs(diffx) > 3 * Math.abs(diffy)) {
							if (diffx > 0) {
								if (ABPInst.video.paused) {
									ABPInst.btnPlay.click();
								}
							} else {
								if (!ABPInst.video.paused) {
									ABPInst.btnPlay.click();
								}
							}
						} else if (Math.abs(diffy) > 3 * Math.abs(diffx)) {
							if (diffy < 0) {
								ABPInst.video.volume = Math.min(1, ABPInst.video.volume + 0.1)
							} else {
								ABPInst.video.volume = Math.max(0, ABPInst.video.volume - 0.1)
							}
						}
						_touch = null;
					}
				}
			});
			playerUnit.addEventListener("mouseup", function() {
				if (document.activeElement.tagName != "INPUT") {
					var oSY = window.scrollY;
					ABPInst.videoDiv.focus();
					window.scrollTo(window.scrollX, oSY);
				}
			});
		}
		/** Create a bound CommentManager if possible **/
		if (typeof CommentManager !== "undefined") {
			if (ABPInst.state.autosize) {
				var autosize = function() {
					if (video.videoHeight === 0 || video.videoWidth === 0) {
						return;
					}
					var aspectRatio = video.videoHeight / video.videoWidth;
					// We only autosize within the bounds
					var boundW = playerUnit.offsetWidth;
					var boundH = playerUnit.offsetHeight;
					var oldASR = boundH / boundW;

					if (oldASR < aspectRatio) {
						playerUnit.style.width = (boundH / aspectRatio) + "px";
						playerUnit.style.height = boundH + "px";
					} else {
						playerUnit.style.width = boundW + "px";
						playerUnit.style.height = (boundW * aspectRatio) + "px";
					}

					ABPInst.cmManager.setBounds();
				};
				video.addEventListener("loadedmetadata", autosize);
				autosize();
			}
		}
		return ABPInst;
	}
})()
