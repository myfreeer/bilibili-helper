/**
 * Created by Ruo on 4/12/2016.
 */
(function () {
    if (location.hostname == 'live.bilibili.com') {
        if (!store.enabled) return;
        store.delete = function (key, value) {

            if (key === undefined) return;
            var o = store.get(key);
            if (o == undefined) return;
            if (value !== undefined && value !== null) {
                if (typeof value === 'string' || typeof value === 'number') {
                    o[value] && delete o[value];
                    store.set(key, o);
                }
            } else store.remove(key);
        };
        var Live = { scriptOptions: {}, hasInit: false };
        if (store.has('bilibilihelper_init')) Live.hasInit = true;
        else {
            store.set('bilibilihelper_init', true);
        }
        Live.addScriptByFile = function (fileName, options) {
            var a = document.createElement('script');
            a.id = 'bilibiliHelperScript'
            a.src = chrome.extension.getURL(fileName);
            typeof options == 'object' && a.setAttribute('options', JSON.stringify(options));
            document.body.appendChild(a);
        }
        Live.addScriptByText = function (text) {
            var a = document.createElement('script');
            a.innerHTML = text;
            document.body.appendChild(a);
        }
        Live.addScriptByText('(function(){if (location.pathname.substr(1) && !isNaN(location.pathname.substr(1))) {var a=function(f,d,c){if(!window.localStorage||!f){return}var e=window.localStorage;if(!e[f]){e[f]=JSON.stringify({})}var b=JSON.parse(e[f]);if(c==undefined){e[f]=typeof d=="string"?d.trim():JSON.stringify(d)}else{b[d]=typeof c=="string"?c.trim():JSON.stringify(c);e[f]=JSON.stringify(b)}};a("helper_live_roomId",ROOMURL,ROOMID);a("helper_live_rnd",ROOMURL,DANMU_RND)}})();');

        Live.getRoomHTML = function (url) {
            return $.get('http://live.bilibili.com/' + url).promise();
        };
        Live.getRoomIdByUrl = function (url, callback) {
            var id = store.get('helper_live_roomId')[url];
            if (id != undefined) callback(id);
            else Live.getRoomHTML(url).done(function (roomHtml) {
                var reg = new RegExp("var ROOMID = ([\\d]+)");
                var roomID = reg.exec(roomHtml)[1];
                var o;(o=store.get('helper_live_roomId'))[url] = roomID;
                store.set('helper_live_roomId', o);
                if (typeof callback == 'function') callback(roomID);
            }).fail(function () {
                Live.getRoomIdByUrl(url, callback);
            });
        };
        Live.getUser = function () {
            return $.getJSON("/user/getuserinfo").promise();
        };
        Live.each = function (obj, fn) {
            if (!fn) return;
            if (obj instanceof Array) {
                var i = 0,
                    len = obj.length;
                for (; i < len; i++) {
                    if (fn.call(obj[i], i) == false)
                        break;
                }
            } else if (typeof obj === 'object') {
                var j = null;
                for (j in obj) {
                    if (fn.call(obj[j], j) == false)
                        break;
                }
            }
        };

        Live.getCookie = function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return unescape(arr[2]);
            else
                return null;
        };

        Live.setCookie = function (name, value, seconds) {
            seconds = seconds || 0;
            var expires = "";
            if (seconds != 0) {
                var date = new Date();
                date.setTime(date.getTime() + (seconds * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            document.cookie = name + "=" + escape(value) + expires + "; path=/";
        };

        Live.liveQuickLogin = function () {
            if (!Live.getCookie("DedeUserID") && !Live.getCookie("LIVE_LOGIN_DATA")) {
                try {
                    if (!window.biliQuickLogin) {
                        $.getScript("https://static-s.bilibili.com/account/bili_quick_login.js", function (response, status) {
                            status === "success" && login();
                        });
                    } else {
                        login();
                    }
                } catch (tryErr) {
                    throw new Error(tryErr);
                }
            }

            function login() {
                if (window.biliQuickLogin) {
                    window.biliQuickLogin(function () { window.location.reload(); });
                    throw "Bilibili Live: 您没登陆，想干撒子？~~ -_-";
                } else {
                    throw "Bilibili Live: 快速登录脚本未正确载入.";
                }
            }
        };

        Live.initUserInfo = function (callback) {
            return Live.getUser().done(function (user) {
                if (user.code == 'REPONSE_OK') {
                    user = user.data;
                    store.set('helper_userInfo', {
                        username: user.uname,
                        userLevel: user.user_level,
                        silver: user.silver,
                        gold: user.gold,
                        face: user.face,
                        vip: user.vip,
                        login: true
                    });
                    if (callback && typeof callback == 'function') callback(user);
                    return true;
                } else if (user.code == -101) store.remove('helper_userInfo');
            });
        };

        Live.clearLocalStorage = function () {
            store.delete('helper_live_bet', Live.roomId);
            store.delete('helper_live_check', Live.roomId);
            store.delete('helper_live_number', Live.roomId);
            store.delete('helper_live_rate', Live.roomId);
            store.delete('helper_live_which', Live.roomId);
            store.delete('helper_doSign');
            store.delete('helper_userInfo');
            store.delete('noTreasure');
        };

        Live.getRoomId = function () {
            return store.get('helper_live_roomId')[location.pathname.substr(1)];
        };

        Live.getRoomInfo = function () {
            return $.getJSON("/live/getInfo?roomid=" + Live.roomId).promise();
        };

        Live.numFormat = function (num) {
            var number = num;
            if (num >= 10000) number = (num / 10000).toFixed(1) + '万';
            return number;
        };

        Live.rgb2hex = function (rgb) {
            function zero_fill_hex(num, digits) {
                var s = num.toString(16);
                while (s.length < digits)
                    s = "0" + s;
                return s;
            }

            if (rgb.charAt(0) == '#') return rgb;

            var ds = rgb.split(/\D+/);
            var decimal = Number(ds[1]) * 65536 + Number(ds[2]) * 256 + Number(ds[3]);
            return "#" + zero_fill_hex(decimal, 6);
        };

        Live.getDomType = function (t) {
            var e = Object.prototype.toString.call(t),
                n = /HTML.*.Element/;
            return "[object Object]" === e && t.jquery ? "jQuery Object" : "[object Object]" === e ? "Object" : "[object Number]" === e ? "Number" : "[object String]" === e ? "String" : "[object Array]" === e ? "Array" : "[object Boolean]" === e ? "Boolean" : "[object Function]" === e ? "Function" : "[object Null]" === e ? "null" : "[object Undefined]" === e ? "undefined" : e.match(n) ? "HTML Element" : "[object HTMLCollection]" === e ? "HTML Elements Collection" : null
        };

        Live.randomEmoji = {
            list: {
                happy: ["(｀･ω･´)", "=‿=✧", "●ω●", "(/ ▽ \\)", "(=・ω・=)", "(●'◡'●)ﾉ♥", "<(▰˘◡˘▰)>", "(⁄ ⁄•⁄ω⁄•⁄ ⁄)", "(ง,,• ᴗ •,,)ง ✧"],
                shock: [",,Ծ‸Ծ,,", "(｀･д･´)", "Σ( ° △ °|||)︴", "┌( ಠ_ಠ)┘", "(ﾟДﾟ≡ﾟдﾟ)!?"],
                sad: ["∑(っ °Д °;)っ", "＞︿＜", "＞△＜", "●︿●", "(´；ω；`)"],
                helpless: ["◐▽◑", "ʅ（´◔౪◔）ʃ", "_(:3 」∠)_", "_(┐「ε:)_", "(/・ω・＼)", "(°▽°)ﾉ"]
            },
            happy: function () {
                return Live.randomEmoji.list.happy[Math.floor(Math.random() * Live.randomEmoji.list.happy.length)]
            },
            sad: function () {
                return Live.randomEmoji.list.sad[Math.floor(Math.random() * Live.randomEmoji.list.sad.length)]
            },
            shock: function () {
                return Live.randomEmoji.list.shock[Math.floor(Math.random() * Live.randomEmoji.list.shock.length)]
            },
            helpless: function () {
                return Live.randomEmoji.list.helpless[Math.floor(Math.random() * Live.randomEmoji.list.helpless.length)]
            }
        };
        Live.countdown = function CountDown(param) {
            if (!(this instanceof Live.countdown)) {
                return new Live.countdown(param);
            }
            var dateNow = new Date(),
                endTime = param.endTime;

            if (!endTime || !(endTime instanceof Date) || endTime.getTime() <= dateNow.getTime()) {
                console.log("倒计时时间设置错误");
                return;
            }

            // Definition: 倒计时定义.
            var interval = setInterval(function () {
                var ms = endTime.getTime() - dateNow.getTime(); // 倒计时剩余总时间: 毫秒.
                var mm = Math.floor(ms / 60 / 1000); // 倒计时剩余总时间: 分钟.
                var s = ms - (mm * 60 * 1000); // 倒计时秒数零头毫秒数: 总毫秒时间 - 总分钟取整时间
                var ss = Math.floor(s / 1000); // 倒计时秒数零头秒数.
                mm = mm < 10 ? "0" + mm : mm;
                ss = ss < 10 ? "0" + ss : ss;

                // Action: 在 HTML 中写入时间.
                var outputTime = mm + ":" + ss;
                if (Live.getDomType(param.element) === "jQuery Object") {
                    param.element.html(outputTime);
                } else {
                    param.element.innerHTML = outputTime;
                }

                // Action: 倒计时结束.
                if (mm == "00" && ss == "00") {
                    clearInterval(interval);
                    param.callback && param.callback();
                    return;
                }

                endTime.setSeconds(endTime.getSeconds() - 1);

            }, 1000);

            this.countDown = interval;
        };
        Live.countdown.prototype.clearCountdown = function () {
            clearInterval(this.countDown);
        };

        Live.console = {
            option: {
                display: {
                    "danmu": false,
                    "tv_end": false,
                    "gift": false,
                    "system": false,
                    "tv": false,
                    "sys_gift": false
                }
            },
            watcher: function (msg) {
                console.log("%c监控:" + msg, "color:#FFFFFF;background-color:#4fc1e9;padding:5px;border-radius:7px;line-height:30px;");
            },
            info: function (type, json) {
                if (type == 'danmu' && Live.console.option.display['danmu']) {
                    var danmu = json.info[1];
                    var userId = json.info[2][0];
                    var username = json.info[2][1];
                    var userUL = json.info[4][0];
                    var userULRank = json.info[4][1];
                    console.log("%c(UL:" + userUL + ')' + userId + '-' + username + ':' + danmu + ' 排名:' + userULRank, "color:#FFFFFF;background-color:#646c7a;padding:5px;border-radius:7px;line-height:30px;");
                } else if (type == 'system' && Live.console.option.display['system']) {
                    // var a = {
                    //     cmd: "SYS_MSG",
                    //     msg: "【磨茶先生】在直播间【44515】赠送 小电视一个，请前往抽奖",
                    //     rep: 1,
                    //     styleType: 2,
                    //     url: "http://live.bilibili.com/44515"
                    // };
                    var msg = json.msg;
                    var url = json.url;
                    console.log("%c系统通告:" + msg + ' 地址:' + url, "color:#FFFFFF;background-color:#e74e8f;padding:5px;border-radius:7px;line-height:30px;");
                } else if (type == 'tv_end' && Live.console.option.display['tv_end']) {
                    // var a = {
                    //     "cmd": "TV_END",
                    //     "data": {
                    //         "id": 5467,
                    //         "sname": "机智的聪明蛋",
                    //         "uname": "私生恋人Li"
                    //     },
                    //     "roomid": "20105"
                    // };
                    console.log(json);
                } else if (type == 'gift' && Live.console.option.display['gift']) {
                    // var a = {
                    //     "cmd": "SEND_GIFT",
                    //     "data": {
                    //         "giftName": "辣条",
                    //         "num": 11,
                    //         "uname": "墨颜曦",
                    //         "rcost": 26870158,
                    //         "uid": 7915142,
                    //         "top_list": [],
                    //         "timestamp": 1468160121,
                    //         "giftId": 1,
                    //         "giftType": 0,
                    //         "action": "喂食",
                    //         "super": 0,
                    //         "price": 100,
                    //         "rnd": "1468156041",
                    //         "newMedal": 0,
                    //         "medal": 1,
                    //         "capsule": []
                    //     },
                    //     "roomid": 1029
                    // };
                    var gift = json.data['giftName'];
                    var count = json.data['num'];
                    var uname = json.data['uname'];
                    console.log("%c喂食:" + gift + ' x' + count + ' 用户名:' + uname, "color:#FFFFFF;background-color:#ff8e29;padding:5px;border-radius:7px;line-height:30px;");
                } else if (type == 'sys_gift' && Live.console.option.display['sys_gift']) {
                    // var a = {
                    //     "cmd": "SYS_GIFT",
                    //     "msg": "正義の此方:? 在Hoshilily的:?直播间81688:?内赠送:?36:?共100个，触发1次刨冰雨抽奖，快去前往抽奖吧！",
                    //     "tips": "【正義の此方】在直播间【81688】内 赠送 刨冰共 100 个，触发 1 次刨冰雨抽奖，快去前往抽奖吧！",
                    //     "rep": 1,
                    //     "msgTips": 1,
                    //     "url": "http://live.bilibili.com/81688",
                    //     "roomid": 81688,
                    //     "rnd": "1468493403"
                    // };
                    console.log("%c系统通告:" + json.tips + ' 地址:' + json.url, "color:#FFFFFF;background-color:#e74e8f;padding:5px;border-radius:7px;line-height:30px;");
                }
            }
        };

        Live.liveToast = function (dom, type, msg) {
            if (n = type || "info", "success" !== n && "caution" !== n && "error" !== n && "info" !== n) return;
            var c = document.createDocumentFragment();
            var u = document.createElement("div");
            u.innerHTML = "<i class='toast-icon info'></i><span class='toast-text'>" + msg + Live.randomEmoji.helpless() + "</span>", u.className = "live-toast " + n;
            var d = null;
            switch (Live.getDomType(dom)) {
                case "HTML Element":
                    d = dom;
                    break;
                case "jQuery Object":
                    d = dom[0];
                    break;
                default:
                    throw new Error(a.consoleText.error + "在使用 Live Toast 时请传入正确的原生 Dom 对象或节点的 jQuery 对象.")
            }

            function o(t) {
                var e = t.offsetLeft;
                return null !== t.offsetParent ? e += o(t.offsetParent) : void 0, e
            }

            function i(t) {
                var e = t.offsetTop;
                return null !== t.offsetParent ? e += i(t.offsetParent) : void 0, e
            }

            var f = { width: $(d).width(), height: $(d).height() },
                p = o(d),
                m = i(d);
            $(u).css({ left: p + f.width });
            var v = 0;
            v = document.body.scrollTop, $(u).css({ top: m + f.height }), setTimeout(function () {
                $(u).addClass("out"), setTimeout(function () {
                    $(u).remove(), c = u = d = f = p = m = v = null
                }, 400)
            }, 2e3), c.appendChild(u), document.body.appendChild(c);
            var h = $(window).width(),
                g = u.offsetWidth,
                y = u.offsetLeft;
            0 > h - g - y && $(u).css({ left: h - g - 10 }), h = g = y = null
        };

        Live.doSign = {
            getSignInfo: function () {
                return $.getJSON("/sign/GetSignInfo").promise();
            },
            init: function () {
                var username = store.get('helper_userInfo')['username'];
                var o;(o={})[username]={today: false, date: undefined};
                !store.has('helper_doSign') && store.set('helper_doSign',o);
                Live.doSign.getSignInfo().done(function (data) {
                    if (data.code == 0 && data.data.status == 0) {
                        Live.doSign.sign();
                        setInterval(Live.doSign.sign, 60000); //doSign per 1 min
                    } else if (data.code == 0 && data.data.status == 1) {
                        var username = store.get('helper_userInfo')['username'];
                        var o;(o=store.get('helper_doSign'))[username]={today:true,date:new Date().getDate()}
                        store.set('helper_doSign',o);
                    }
                });
            },
            sign: function () {
                /*check login*/
                
                var date = new Date().getDate();
                var username = store.get('helper_userInfo')['username'];
                if (!store.get('helper_doSign')[username].today || store.get('helper_doSign')[username].date != date) {
                    $.get("/sign/doSign", function (data) {
                        var e = JSON.parse(data), msg;
                        //    {
                        //    "code": 0,
                        //    "msg": "ok",
                        //    "data": {
                        //        "text": "200\u94f6\u74dc\u5b50,3000\u7528\u6237\u7ecf\u9a8c\u503c",
                        //        "lottery": {"status": false, "lottery": {"id": "", "data": ""}},
                        //        "allDays": "30",
                        //        "hadSignDays": 22,
                        //        "remindDays": 8
                        //    }
                        //};
                        if (e.code == 0) {
                            //noinspection JSDuplicatedDeclaration
                            msg = new Notification("签到成功", {
                                body: "您获得了" + e.data.text,
                                icon: "//static.hdslb.com/live-static/images/7.png"
                            });
                            var o;
                            (o = store.get('helper_doSign'))[username] = { today: true, date: date };
                            store.set('helper_doSign', o);
                            setTimeout(function () {
                                msg.close();
                            }, 10000);
                            var spans = $('.body-container').find('.room-left-sidebar .sign-and-mission .sign-up-btn .dp-inline-block span');
                            $(spans[0]).hide(), $(spans[1]).show();
                        } else if (e.code == -500) {
                            msg = new Notification(eval("'" + e.msg + "'"), {
                                body: "不能重复签到",
                                icon: "//static.hdslb.com/live-static/live-room/images/gift-section/gift-1.gif"
                            });
                            var o;
                            (o = store.get('helper_doSign'))[username] = { today: true, date: date };
                            store.set('helper_doSign', o);
                            setTimeout(function () {
                                msg.close();
                            }, 10000);
                        } else {
                            msg = new Notification(eval("'" + e.msg + "'"), {
                                body: "",
                                icon: "//static.hdslb.com/live-static/live-room/images/gift-section/gift-1.gif"
                            });
                            setTimeout(function () {
                                msg.close();
                            }, 10000);
                        }
                    });
                }
            }
        };

        Live.Queue = function (which) {
            var o = {};
            o.id = new Date().getTime();
            o.which = which;
            o.total = 0;
            o.run = [];
            o.wait = [];
            o.error = [];
            o.success = [];
            o.cancel = [];
            o.add = function (appoint, state) {
                state = state == undefined ? 'wait' : state;
                o[state].push(appoint);
            };
            o.empty = function () {
                $('#quiz_helper').find(o.which + '-box *').addClass('hide');
                o.run = [];
                o.wait = [];
                o.error = [];
                o.cancel = [];
                o.success = [];
            };
            o.remove = function (appoint) {
                var index = o[appoint.state].indexOf(appoint);
                if (index != -1) {
                    o[appoint.state].splice(index, 1);
                    appoint.destory();
                }
            };
            o.pushQueue = function (appoint, state) {
                if (appoint.state != state) {
                    state = state == undefined ? 'wait' : state;
                    o.remove(appoint);
                    if (state != 'run') {
                        if (state == 'success') {
                            o.total += appoint.number;
                            //o.updateTotal();
                        }
                        appoint.state = state;
                        o.add(appoint, state);
                        appoint.create_dom().updateMenu();
                    } else {
                        appoint.state = 'run';
                        if (o.run.length > 0) {
                            var a = o.run.shift();
                            a.wait().updateMenu();
                            o.wait.unshift(a);
                        }
                        o.run.push(appoint);
                        appoint.create_dom(true).updateMenu();
                    }
                }
            };
            o.updateTotal = function () {
                Live.bet[o.which + '_sum_number'].text(o.total);
            };
            return o;
        };

        Live.Appoint = function (which, rate, number, state) {
            //var queueStr = {'0': 'cancel', '1': 'success', '2': 'error', '3': 'wait', '4': 'run'};
            var o = {};
            o.id = new Date().getTime();
            o.which = which;
            o.rate = rate;
            o.number = number;
            /*0:cancel,1:success,2:error,3:wait,4:run*/
            o.state = state == undefined ? 'wait' : state;
            o.emit = function (which, state) {
                /*set state*/
                o.state = state == undefined ? o.state : state;
                o.create_dom();

                /*emit*/
                Live.bet[which + '_box'].append(o.dom);
                Live.bet[which + '_queue'].pushQueue(o);
                Live.bet.checkQueue();
                return o;
            };
            o.create_dom = function (top) {
                if (o.dom == undefined) {
                    var rate_dom = $('<span>').addClass('rate').text(rate);
                    var number_dom = $('<h4>').addClass('number').text(Live.numFormat(o.number));
                    o.menu = $('<div>').addClass('menu');
                    o.dom = $('<div>').addClass('count').addClass(o.state).attr({
                        id: o.id,
                        rate: rate,
                        number: o.number
                    }).append(number_dom, rate_dom, $('<a>').addClass('close'), o.menu);
                    o.updateMenu();
                    var success_dom = Live.bet[which + '_box'].children('.success:last');
                    if (top) {
                        if (success_dom.length != 0) {
                            success_dom.after(o.dom);
                        } else Live.bet[which + '_box'].prepend(o.dom);
                    } else Live.bet[which + '_box'].append(o.dom);
                }
                return o;
            };
            o.updateMenu = function () {
                o.menu.empty();
                o.menu_delete = $('<span class="delete"></span>').off('click').click(function () {
                    Live.bet[o.which + '_queue'].remove(o);
                });
                o.menu_reset = $('<span class="reset"></span>').off('click').click(function () {
                    Live.bet[o.which + '_queue'].pushQueue(o, 'wait');
                });
                o.menu_run = $('<span class="run"></span>').off('click').click(function () {
                    Live.bet[o.which + '_queue'].pushQueue(o, 'run');
                });
                if (o.state == 'run' || o.state == 'success' || o.state == 'error' || o.state == 'cancel') {
                    o.menu.append(o.menu_reset, o.menu_delete);
                } else if (o.state == 'wait') {
                    o.menu.append(o.menu_run, o.menu_delete);
                }
                return o;
            };
            o.run = function (bet) {
                if (!bet) return false;
                o.state = 'run';
                /*deal style class*/
                o.dom.removeClass('cancel wait error success');
                if (!o.dom.hasClass('run')) o.dom.addClass('run');

                /*get data*/
                var w = (o.which == 'blue') ? 'a' : 'b';
                var bankerId = bet.silver[w].id;
                var rate = bet.silver[w].times;
                //var amount = bet.silver[w].amount;
                /*be canceled*/
                if (Live.bet.stop) clearInterval(store.get('helper_live_bet')[Live.roomId]);
                if (rate >= o.rate) {
                    $.ajax({
                        url: 'http://live.bilibili.com/bet/addBettor',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            bankerId: bankerId,
                            amount: o.number,
                            token: __GetCookie('LIVE_LOGIN_DATA')
                        },
                        complete: function (data) {
                            var b = JSON.parse(data.responseText);
                            if (b.code == -400) { //error
                                if (b.msg == '手慢了,剩余可购数量不足！') {} else o.error(b);
                            } else if (b.msg == 'ok') { //success
                                o.success();

                            }
                        }
                    });
                }
                return o;
            };
            o.error = function (data) {
                if (!data) return false;
                o.state = 'error';
                console.log(o.id + ':' + data.msg);
                /*deal style class*/
                o.dom.removeClass('cancel wait run success');
                if (!o.dom.hasClass('error')) o.dom.addClass('error').attr('title', data.msg);
                Live.bet[o.which + '_queue'].pushQueue(Live.bet[o.which + '_queue'].run.shift(), 'error');
                return o;
            };
            o.success = function () {
                o.updateMenu();
                /*deal style class*/
                o.dom.removeClass('cancel wait error run');
                if (!o.dom.hasClass('success')) o.dom.addClass('success');
                Live.bet[o.which + '_queue'].pushQueue(Live.bet[o.which + '_queue'].run.shift(), 'success');
                return o;
            };
            o.wait = function () {
                o.state = 'wait';
                /*deal style class*/
                o.dom.removeClass('cancel success error run');
                if (!o.dom.hasClass('wait')) o.dom.addClass('wait');
                return o;
            };
            o.cancel = function () {
                o.state = 'cancel';
                /*deal style class*/
                o.dom.removeClass('wait success error run');
                if (!o.dom.hasClass('cancel')) o.dom.addClass('cancel');
                Live.bet[o.which + '_queue'].pushQueue(Live.bet[o.which + '_queue'].run.shift(), 'cancel');
                return o;
            };
            o.destory = function () {
                o.dom.remove();
                o.dom = undefined;
            };
            o.dealWith = function (data) {
                switch (o.state) {
                    case 'cancel':
                        o.cancel();
                        break;
                    case 'success':
                        o.success();
                        break;
                    case 'error':
                        o.error(data);
                        break;
                    case 'wait':
                        o.wait();
                        break;
                    case 'run':
                        o.run(data);
                        break;
                }
            };
            return o;
        };

        Live.bet = {
            times: 0,
            stop: false,
            hasInit: false,
            hasShow: false,
            blue_queue: new Live.Queue('blue'),
            red_queue: new Live.Queue('red'),
            checkBetStatus: function (callback) {
                /*check bet*/
                Live.bet.getBet().done(function (bet) {
                    bet = bet.data;
                    if (!store.get('helper_userInfo')['login'] && bet.betStatus == false) {
                        Live.bet.cancelCheck();
                        return;
                    }
                    /*none bet permission or bet is not on*/
                    if (!Live.bet.canBet(bet) || !Live.bet.betOn(bet)) {
                        Live.bet.stopBet();
                        return;
                    }
                    if (store.get('helper_live_autoMode')[Live.roomId] == 1) {
                        if (Live.bet.hasInit && !Live.bet.hasShow) Live.bet.show();
                        else if (!Live.bet.hasInit) Live.bet.init();
                    }
                    if (typeof callback == 'function') callback();
                });
            },
            canBet: function (bet) {
                if (bet.isBet == false) {
                    if (store.get('helper_live_autoMode')[Live.roomId] == 1) {
                        Live.bet.disable();
                        var o;
                        (o = store.get('helper_live_autoMode'))[Live.roomId] = 0;
                        store.set('helper_live_autoMode', o);
                    }
                    return false;
                } else return true;
            },
            betOn: function (bet) {
                if (bet.betStatus == false) {
                    if (store.get('helper_live_autoMode')[Live.roomId] == 1) {
                        Live.bet.hide();
                        Live.bet.blue_queue.empty();
                        Live.bet.red_queue.empty();
                    }
                    return false;
                } else return true;
            },
            checkQueue: function () {
                Live.bet.cancelCheck();
                if (Live.bet.stop) Live.bet.stopBet();
                /*check wait queue*/
                /*wait queue is not empty*/
                if (Live.bet.blue_queue.wait.length != 0 || Live.bet.red_queue.wait.length != 0) {
                    /*check run queue*/
                    if (Live.bet.blue_queue.run.length == 0 && Live.bet.blue_queue.wait.length != 0) {
                        Live.bet.blue_queue.pushQueue(Live.bet.blue_queue.wait.shift(), 'run');
                    }
                    if (Live.bet.red_queue.run.length == 0 && Live.bet.red_queue.wait.length != 0) {
                        Live.bet.red_queue.pushQueue(Live.bet.red_queue.wait.shift(), 'run');
                    }
                }
                if (Live.bet.blue_queue.wait.length == 0 && Live.bet.red_queue.wait.length == 0 && Live.bet.blue_queue.run.length == 0 && Live.bet.red_queue.run.length == 0) {
                    Live.bet.stopBet();
                    Live.bet.check();
                }
                /*if run queue is not empty*/
                else if (!store.get('helper_live_bet')[Live.roomId]) {
                    Live.bet.do();
                    var o = new Object();
                    o[Live.roomId] = setInterval(Live.bet.do, 2000);
                    store.set('helper_live_bet', o)
                }
            },
            hide_quiz_helper: function () {
                Live.bet.hasShow = false;
                Live.bet.quiz_helper_height = Live.bet.quiz_helper.height();
                Live.bet.quiz_helper.animate({ "height": "0px" });
            },
            show_quiz_helper: function () {
                Live.bet.hasShow = true;
                if (Live.bet.quiz_helper_height == undefined) Live.bet.quiz_helper_height = 'auto';
                Live.bet.quiz_helper.animate({ height: Live.bet.quiz_helper_height }, function () {
                    Live.bet.quiz_helper.css('height', 'auto');
                });
            },
            init: function () {
                /*check login*/
                if (!store.get('helper_userInfo')['login']) return;

                /*auto mode*/
                if (!parseInt(store.get('helper_live_autoMode')[Live.roomId])) return;

                /*create quiz helper DOM*/
                if (!Live.bet.hasInit) {
                    Live.bet.quiz_panel = $('#quiz-control-panel');
                    Live.bet.quiz_helper = $('<div id="quiz_helper"></div>');
                    Live.bet.quiz_rate = $('<input type="range" class="rate" min="0" max="9.9" step="0.1" />').val(1);
                    Live.bet.quiz_rate_n = $('<span class="rate_n">1</span>');
                    Live.bet.quiz_number = $('<input class="number" type="text" placeholder="数额" min="1" maxlength="8" required="required" />');
                    Live.bet.quiz_msg = $('<span class="msg"></span>');
                    Live.bet.quiz_btns = $('<div class="bet-buy-btns p-relative clear-float"></div>');
                    Live.bet.quiz_blue_btn = $('<button class="bet-buy-btn blue float-left" data-target="a" data-type="silver">填坑</button>');
                    Live.bet.quiz_red_btn = $('<button class="bet-buy-btn pink float-right" data-target="b" data-type="silver">填坑</button>');
                    Live.bet.description = $('<a class="description" title="自动下注功能会根据您填写的赔率及下注数额和实时的赔率及可购买量进行不停的比对，一旦满足条件则自动买入\n当实时赔率大于等于目标赔率且有购买量时自动买入"><i class="help-icon"></i></a>');
                    Live.bet.quiz_btns.append(Live.bet.quiz_blue_btn, Live.bet.quiz_red_btn);

                    /*count panel*/
                    Live.bet.count_panel = $('<div>').addClass('quiz-panel');
                    Live.bet.blue_box = $('<div>').addClass('blue-box');
                    Live.bet.red_box = $('<div>').addClass('red-box');

                    Live.bet.sum_box = $('<div>').addClass('sum-sbox');
                    Live.bet.blue_sum_number = $('<div>').addClass('blue-sum-number');
                    Live.bet.blue_sum_income = $('<div>').addClass('blue-sum-income');
                    Live.bet.red_sum_number = $('<div>').addClass('red-sum-number');
                    Live.bet.red_sum_income = $('<div>').addClass('red-sum-income');
                    Live.bet.blue_sum_box = $('<div>').addClass('blue-sum-sbox');
                    Live.bet.red_sum_box = $('<div>').addClass('red-sum-box');

                    Live.bet.blue_sum_box.append(Live.bet.blue_sum_number, Live.bet.blue_sum_income);
                    Live.bet.red_sum_box.append(Live.bet.red_sum_number, Live.bet.red_sum_income);
                    Live.bet.sum_box.append(Live.bet.blue_sum_box, Live.bet.red_sum_box);
                    Live.bet.count_panel.append(Live.bet.blue_box, Live.bet.red_box);

                    Live.bet.quiz_helper.append(
                        Live.bet.count_panel,
                        Live.bet.sum_box,
                        $('<div class="quiz_helper">').append($('<span class="rate_title">').text('赔率'), Live.bet.quiz_rate, Live.bet.quiz_rate_n),
                        $('<div class="quiz_helper">').append($('<span class="number_title">').text('数额'), Live.bet.quiz_number, Live.bet.quiz_msg),
                        Live.bet.quiz_btns
                    );

                    Live.bet.quiz_panel.append(Live.bet.quiz_helper);

                    /*add listener*/
                    $('#quiz_helper').find('.bet-buy-btns button').click(function () {
                        var which = $(this).attr('data-target');
                        /*rate*/
                        var rate = parseFloat(Live.bet.quiz_rate.val());
                        if (rate.length > 3) rate = rate.toFixed(1);
                        var o;
                        (o = store.get('helper_live_rate'))[Live.roomId] = rate;
                        store.set('helper_live_rate', o);

                        /*number*/
                        var number = parseInt(Live.bet.quiz_number.val());

                        /*Style*/
                        if (Live.bet.quiz_rate.val() == '') {
                            Live.bet.quiz_rate.addClass('error');
                            return;
                        } else Live.bet.quiz_rate.removeClass('error');
                        if (Live.bet.quiz_number.val() == '') {
                            Live.bet.quiz_number.addClass('error');
                            return;
                        } else Live.bet.quiz_number.removeClass('error');
                        Live.bet.quiz_msg.text('');
                        if (Live.bet.quiz_number.val() < 1) {
                            Live.bet.quiz_number.addClass('error');
                            Live.bet.quiz_msg.text('下注数量不可小于1');
                            return;
                        }
                        var o, p;
                        (o = {})[Live.roomId] = number;
                        (p = {})[Live.roomId] = which;
                        store.set('helper_live_number', o);
                        store.set('helper_live_which', p);

                        which = which == 'a' ? 'blue' : 'red';
                        new Live.Appoint(which, rate, number).emit(which);
                    });
                    Live.bet.quiz_number.focus(function () {
                        Live.initUserInfo();
                    });
                    Live.bet.quiz_number.keyup(function () {
                        var v = $(this).val();
                        var silver = parseInt(store.get('helper_userInfo')['silver']);
                        while (v != '' && isNaN(v)) {
                            $(this).val(v.substr(0, v.length - 1));
                            v = $(this).val();
                        }
                        if (parseInt(v) > silver) {
                            $(this).val(silver);
                        }
                    });
                    Live.bet.quiz_rate.on('input change', function () {
                        Live.bet.quiz_rate_n.text($(this).val());
                    });
                }
                Live.bet.hasInit = true;
                Live.bet.show();
            },
            getBet: function () {
                return $.post('http://live.bilibili.com/bet/getRoomBet', { roomid: Live.roomId }, function () {}, 'json').promise();
            },
            do: function () {
                Live.bet.getBet().done(function (bet) {
                    bet = bet.data;
                    /*no bet permission or bet is not on*/
                    if (!Live.bet.canBet(bet) || !Live.bet.betOn(bet)) {
                        Live.bet.stopBet();
                        Live.bet.cancel(true);
                        return;
                    }
                    /*deal with run queue*/
                    var blue = Live.bet.blue_queue.run[0];
                    var red = Live.bet.red_queue.run[0];
                    if (blue) blue.dealWith(bet);
                    if (red) red.dealWith(bet);
                    Live.bet.checkQueue();
                });
            },
            cancel: function (check) {
                if (Live.bet.hasInit) {
                    Live.bet.quiz_helper.children('input,div').removeClass('hide');
                    Live.clearLocalStorage();
                }
                if (check) Live.bet.check();
            },
            hide: function (all) {
                if (Live.bet.hasInit) {
                    if (all) {
                        Live.bet.quiz_toggle_btn.removeClass('on');
                        $('.bet-buy-ctnr.dp-none').find('.bet-buy-btns').removeClass('hide');
                        $('#quiz-control-panel').find('.section-title .description').remove();
                    }
                    Live.bet.hide_quiz_helper();
                }
            },
            show: function () {
                if (Live.bet.hasInit) {
                    $('.bet-buy-ctnr.dp-none').find('.bet-buy-btns').addClass('hide');
                    $('#quiz-control-panel').find('.section-title').append(Live.bet.description);
                    Live.bet.quiz_toggle_btn.addClass('on');
                    Live.bet.show_quiz_helper();
                }
            },
            stopBet: function () {
                clearInterval(store.get('helper_live_bet')[Live.roomId]);
                store.delete('helper_live_bet', Live.roomId);
            },
            able: function () {
                Live.bet.stop = false;
                var o;
                (o = store.get('helper_live_autoMode'))[Live.roomId] = 1;
                store.set('helper_live_autoMode', o);
                if (Live.bet.hasInit) Live.bet.show();
                Live.bet.check();
            },
            disable: function () {
                if (Live.bet.hasInit) {
                    Live.bet.stopBet();
                    Live.bet.cancelCheck();
                    Live.bet.cancel(false);
                    Live.bet.hide(true);
                    var o;
                    (o = store.get('helper_live_autoMode'))[Live.roomId] = 0;
                    store.set('helper_live_autoMode', o);
                    Live.clearLocalStorage();
                    Live.bet.blue_queue.empty();
                    Live.bet.red_queue.empty();
                }
            },
            check: function () {
                if (!store.get('helper_live_check')[Live.roomId]) {
                    Live.bet.checkBetStatus();
                    var o;
                    (o = store.get('helper_live_check'))[Live.roomId] = setInterval(Live.bet.checkBetStatus, 3000);
                    store.set('helper_live_check', o);
                }
            },
            cancelCheck: function () {
                clearInterval(store.get('helper_live_check')[Live.roomId]);
                store.delete('helper_live_check', Live.roomId);
            }
        };

        Live.currentRoom = [];

        Live.treasure = {
            silverSum: 0,
            correctStr: { 'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1 },
            silverSeed: false, //current silver
            allowCtrl: true,
            status: "waiting", //current treasure status: "waiting" || "acquirable"
            finished: false,
            boxHidden: false,
            panelHidden: true,
            panelOut: false,
            aniStep: 1, //treasure animate status
            countdown: null, // countdown object
            taskInfo: {
                startTime: "",
                endTime: "",
                minute: "",
                award: ""
            },
            captcha: {
                img: "",
                userInput: "",
                question: "",
                answer: "",
                refresh: function () {
                    Live.treasure.captcha.img = Live.treasure.getCaptcha();
                    Live.treasure.treasureTipAcquire.find('img').attr('src', Live.treasure.captcha.img);
                }
            },
            awardBtn: {
                text: "领取",
                bk: "",
                interval: null,
                awarding: function () {
                    Live.treasure.awardBtn.bk = Live.treasure.awardBtn.text;
                    Live.treasure.awardBtn.text = "领取中.";
                    var btn = Live.treasure.treasureTip.find('.acquiring-panel .get-award-btn');
                    btn.text(Live.treasure.awardBtn.text);
                    Live.treasure.awardBtn.interval = setInterval(function () {
                        if (Live.treasure.awardBtn.text.indexOf("...") > -1) {
                            Live.treasure.awardBtn.text = "领取中";
                            btn.text(Live.treasure.awardBtn.text);
                            return;
                        }
                        Live.treasure.awardBtn.text += "."
                        btn.text(Live.treasure.awardBtn.text);
                    }, 500);
                },
                restore: function () {
                    clearInterval(Live.treasure.awardBtn.interval);
                    Live.treasure.awardBtn.text = Live.treasure.awardBtn.bk;
                }
            },
            waitingEmoji: Live.randomEmoji.happy(),
            panelEmoji: Live.randomEmoji.helpless(),
            init: function () {
                !store.has('noTreasure') && store.set("noTreasure", {});
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'autoTreasure',
                }, function (res) {
                    if (res['value'] == 'on') setTimeout(function () {
                        // Live.scriptOptions['treasure'] = true;
                        chrome.runtime.sendMessage({
                            command: "getTreasure"
                        }, function (response) {
                            Live.treasureInfoDOM = $('<div class="room-info treasure-info">自动领瓜子功能正在初始化</div>');
                            Live.bilibiliHelperInfoDOM.append(Live.treasureInfoDOM);
                            if (response['data'].roomId == undefined) {
                                //init background data
                                Live.getRoomInfo().done(function (data) {
                                    chrome.runtime.sendMessage({
                                        command: "setTreasure",
                                        data: {
                                            uid: data.data.UID,
                                            roomId: data.data.ROOMID,
                                            roomShortId: location.pathname.substr(1),
                                            roomTitle: data.data.ROOMTITLE,
                                            upName: data.data.ANCHOR_NICK_NAME,
                                            url: location.href,
                                        }
                                    });

                                    var msg = new Notification("自动领瓜子功能已经启动", {
                                        body: data.data.ANCHOR_NICK_NAME + '：' + data.data.ROOMTITLE,
                                        icon: "//static.hdslb.com/live-static/images/7.png"
                                    });

                                    setTimeout(function () {
                                        msg.close();
                                    }, 10000);
                                });

                                //init dom
                                Live.treasure.treasureCtrl = $('.treasure-box-ctnr').clone();
                                Live.treasure.treasureCtrl.attr('id', 'helperTreasurePlanel');
                                $('.treasure-box-ctnr').after(Live.treasure.treasureCtrl).hide();
                                Live.treasure.treasureBox = Live.treasure.treasureCtrl.find('.box-doms');
                                Live.treasure.treasureTip = Live.treasure.treasureCtrl.find('.box-panel');
                                Live.treasure.treasureTipWait = Live.treasure.treasureCtrl.find('.box-panel .waiting-panel');
                                Live.treasure.treasureTipAcquire = Live.treasure.treasureCtrl.find('.box-panel .acquiring-panel');
                                Live.treasure.captchaInput = Live.treasure.treasureCtrl.find('.get-award-btn');

                                //init canvas
                                Live.treasure.canvas = document.createElement('canvas');
                                Live.treasure.canvas.width = 120;
                                Live.treasure.canvas.height = 40;
                                document.body.appendChild(Live.treasure.canvas);
                                Live.treasure.context = Live.treasure.canvas.getContext('2d');
                                Live.treasure.context.font = '40px agencyfbbold';
                                Live.treasure.context.textBaseline = 'top';
                                if (!window.OCRAD) {
                                    var d = document.createElement('script');
                                    d.src = 'http://s.0w0.be/bsc/ocrad.js';
                                    document.body.appendChild(d);
                                }

                                //init dom event
                                Live.treasure.treasureBox.find('.hide-box').on('click', function () {
                                    Live.treasure.minBox();
                                });
                                Live.treasure.treasureBox.find('.count-down').on('click', function () {
                                    Live.treasure.maxBox();
                                });
                                Live.treasure.treasureBox.find('.treasure-box').on('click', function () {
                                    Live.treasure.showPanel();
                                });
                                Live.treasure.treasureTip.find('.close-btn,.waiting-panel .live-btn').on('click', function () {
                                    Live.treasure.hidePanel();
                                });
                                Live.treasure.treasureTip.find('.acquiring-panel .get-award-btn').on('click', function () {
                                    Live.treasure.getAward();
                                });

                                Live.treasure.totalTime = (store.get('helper_userInfo')['vip'] == 1) ? 3 : 5;
                                Live.treasure.checkNewTask();
                                Live.treasure.treasureTip.find('.close-btn').click();
                                $(window).on('beforeunload', function () {
                                    chrome.runtime.sendMessage({
                                        command: "delTreasure"
                                    });
                                    console.log(0);
                                });
                                var port = chrome.runtime.connect({ name: chrome.i18n.getMessage("@@extension_id") });
                                port.onMessage.addListener(function (request) {
                                    switch (request.command) {
                                        case 'updateCurrentTreasure':
                                            var startTime = request.data.time_start;
                                            var endTime = request.data.time_end;
                                            var minute = request.data.minute;
                                            var award = request.data.silver;
                                            Live.treasure.setNewTask(startTime, endTime, minute, award);
                                            break;
                                    }
                                });
                            } else if (store.get('noTreasure')[store.get('helper_userInfo')['username']]) {
                                Live.bilibiliHelperInfoDOM.find('.treasure-info').html('今天的瓜子已经领完');
                            } else if (response['data'].roomId != Live.roomId) {
                                Live.treasureInfoDOM.html('已在<a target="_blank" href="' + response['data'].url + '">' + response['data'].upName + '</a>的直播间自动领瓜子');
                                $('#player-container').find('.treasure-box-ctnr').hide('middle');
                                Live.treasure.checkNewTask(true);
                            } else if (response['data'].roomId == Live.roomId) {
                                Live.treasureInfoDOM.html('本直播间页面已经被打开过');
                                $('#player-container').find('.treasure-box-ctnr').hide('middle');
                                Live.treasure.checkNewTask(true);
                            } else {
                                Live.treasure.checkNewTask(true);
                            }
                        });
                    }, 2000);
                });
            },
            showBox: function () {
                if (!Live.treasure.boxHidden || !Live.treasure.allowCtrl) {
                    return;
                }
                Live.treasure.boxHidden = false;
            },
            hideBox: function () {
                if (!Live.treasure.allowCtrl || Live.treasure.boxHidden) {
                    return;
                }
                Live.treasure.boxHidden = true;
            },
            minBox: function () {
                Live.treasure.treasureBox.find('.hide-box,.box-footer,.treasure-box').hide();
                Live.treasure.treasureBox.find('.count-down-node').addClass('minimal');
            },
            maxBox: function () {
                Live.treasure.treasureBox.find('.hide-box,.box-footer,.treasure-box').show();
                Live.treasure.treasureBox.find('.count-down-node').removeClass('minimal');
            },
            showPanel: function () {
                if (!Live.treasure.allowCtrl || !Live.treasure.panelHidden) {
                    return;
                }
                Live.liveQuickLogin();

                Live.treasure.panelHidden = false;
                Live.treasure.captcha.userInput = "";
                Live.treasure.waitingEmoji = Live.randomEmoji.happy();
                Live.treasure.panelEmoji = Live.randomEmoji.helpless();
                Live.treasure.treasureBox.find('.hide-box').hide();
                if (Live.treasure.status === 'acquirable') {

                    Live.treasure.makeAcquirable();
                } else Live.treasure.makeWaiting();
                Live.treasure.treasureTip.show();
            },
            hidePanel: function () {
                if (Live.treasure.panelHidden) {
                    return;
                }
                Live.treasure.allowCtrl = false;
                Live.treasure.panelOut = true;
                Live.treasure.treasureBox.find('.hide-box').show();
                Live.treasure.treasureTip.addClass('out');
                setTimeout(function () {
                    Live.treasure.panelHidden = true;
                    Live.treasure.panelOut = false;
                    Live.treasure.allowCtrl = true;
                    Live.treasure.treasureTip.hide();
                    Live.treasure.treasureTip.removeClass('out');
                }, 300);
            },
            makeAcquirable: function () {
                Live.treasure.allowCtrl = true;
                Live.treasure.treasureTipAcquire.show();
                Live.treasure.treasureTipWait.hide();
                Live.treasure.treasureTipAcquire.find('.dp-i-block div').html('请输入计算结果领取 <span class="cyan-text">' + Live.treasure.taskInfo.award + '</span> 银瓜子 ' + Live.treasure.panelEmoji);
                Live.treasure.captcha.refresh();
                Live.treasure.showBox();
                Live.treasure.treasureTip.addClass('acquire');
                Live.treasure.playBoxAnimation();
                Live.treasure.status = "acquirable";
            },
            makeWaiting: function () {
                Live.treasure.treasureTipAcquire.hide();
                Live.treasure.treasureTipWait.show();
                Live.treasure.treasureTip.removeClass('acquire');
                Live.treasure.treasureTipWait.find('.cyan-text').text(Live.treasure.taskInfo.award);
                Live.treasure.treasureTipWait.find('.panel-title').text('宝箱倒计时' + Live.treasure.waitingEmoji);
                Live.treasure.status = "waiting";
            },
            makeFinished: function () {
                Live.treasure.finished = true;
                Live.setCookie("F_S_T_" + window.UID, 1);
                Live.treasure.treasureCtrl.hide('middle');
                Live.bilibiliHelperInfoDOM.find('.treasure-info').html('今天的瓜子已经领完');
            },
            restoreBox: function () {
                setTimeout(function () {
                    var interval = setInterval(function () {
                        Live.treasure.aniStep--;
                        if (Live.treasure.aniStep <= 1) {
                            clearInterval(interval);
                            Live.treasure.aniStep = 1;
                        }
                        Live.treasure.treasureBox.find('.treasure-box').addClass('animate' + Live.treasure.aniStep);
                        Live.treasure.treasureBox.find('.treasure-box').removeClass('animate' + (Live.treasure.aniStep + 1));
                    }, 100);
                }, 250);
            },
            playBoxAnimation: function (target) {
                target = target || 7;
                var interval = setInterval(function () {
                    Live.treasure.aniStep++;
                    if (Live.treasure.aniStep >= target) {
                        clearInterval(interval);
                        return;
                    }
                    Live.treasure.treasureBox.find('.treasure-box').addClass('animate' + Live.treasure.aniStep);
                    Live.treasure.treasureBox.find('.treasure-box').removeClass('animate' + (Live.treasure.aniStep - 1));
                }, 100);
            },
            checkNewTask: function (opened) {
                Live.treasure.getCurrentTask().done(function (result) {
                    if (result.code !== undefined) {
                        result.code = parseInt(result.code, 10);
                    } else {
                        console.log("接口数据不完整：code 丢失.");
                        return;
                    }
                    if (result.code === -10017) {
                        // Live.treasure.makeFinished();
                        Live.bilibiliHelperInfoDOM.find('.treasure-info').html('今天的瓜子已经领完');
                        var o;
                        (o = store.get('noTreasure'))[store.get('helper_userInfo')['username']] = true;
                        store.set('noTreasure', o);
                        Live.treasure.makeFinished();
                        return;
                    }
                    if (result.code !== 0) {
                        console.log("宝箱任务设置失败：" + result.msg);
                        if (result.code == -101) {
                            $('#head-info-panel').find('.treasure-info').html('没有登录');
                        } else if (data.code == -99) { //领奖信息不存在
                            $('#head-info-panel').find('.treasure-info').html('领奖信息不存在');
                        }
                        Live.treasure.makeFinished();
                        return;
                    }
                    var o;
                    (o = store.get('noTreasure'))[store.get('helper_userInfo')['username']] = false;
                    store.set('noTreasure', o);
                    chrome.runtime.sendMessage({
                        command: "setCurrentTreasure",
                        data: {
                            minute: result.data.minute,
                            silver: result.data.silver,
                            time_end: result.data.time_end,
                            time_start: result.data.time_start
                        }
                    });
                    if (!opened) {
                        $('#head-info-panel').find('.treasure-info').html('已开始在本直播间自动领瓜子');
                        Live.treasure.setNewTask(result.data.time_start, result.data.time_end, parseInt(result.data.minute, 10), parseInt(result.data.silver, 10));
                    }
                });
            },
            setNewTask: function (startTime, endTime, minute, award) {
                Live.treasure.hidePanel();
                Live.treasure.restoreBox();
                setTimeout(Live.treasure.makeWaiting, 300); // 等待动画结束后延迟执行.

                Live.treasure.taskInfo.startTime = startTime;
                Live.treasure.taskInfo.endTime = endTime;
                Live.treasure.taskInfo.minute = minute;
                Live.treasure.taskInfo.award = award;

                Live.treasure.setCountdown(minute);
            },
            getAward: function () {
                if (!Live.treasure.allowCtrl) return;

                Live.treasure.allowCtrl = false;
                Live.treasure.awardBtn.awarding();

                var img = Live.treasure.treasureTipAcquire.find('.captcha-img');
                Live.treasure.context.clearRect(0, 0, Live.treasure.canvas.width, Live.treasure.canvas.height);
                Live.treasure.context.drawImage(img[0], 0, 0);
                Live.treasure.captcha.question = Live.treasure.correctQuestion(OCRAD(Live.treasure.context.getImageData(0, 0, 120, 40)));
                Live.treasure.captcha.answer = eval(Live.treasure.captcha.question);
                Live.treasure.treasureTipAcquire.find('input').val(Live.treasure.captcha.answer);

                var data = Live.treasure.taskInfo;
                Live.treasure.captcha.userInput = Live.treasure.captcha.answer;
                var captcha = Live.treasure.captcha.answer;
                getAward(data.startTime, data.endTime, captcha);

                function getAward(time_start, time_end, captcha) {
                    $.get('http://live.bilibili.com/FreeSilver/getAward', { time_start: time_start, time_end: time_end, captcha: captcha }, function () {}, 'json').promise()
                        .done(function (result) {
                            if (result.code == -99) {
                                Live.treasure.allowCtrl = true;
                                Live.treasure.captcha.refresh();
                                Live.treasure.awardBtn.restore();
                                chrome.runtime.sendMessage({
                                    command: "getCurrentTreasure"
                                }, function (response) {
                                    console.log(request.data);
                                    var startTime = request.data.time_start;
                                    var endTime = response.data.time_end;
                                    var minute = response.data.minute;
                                    var award = response.data.silver;
                                    Live.treasure.setNewTask(startTime, endTime, minute, award);
                                });
                                return;
                            } else if (result.code != 0) {
                                Live.liveToast(Live.treasure.captchaInput[0], result.msg + Live.randomEmoji.helpless(), "info");
                                Live.treasure.allowCtrl = true;
                                Live.treasure.captcha.refresh();
                                Live.treasure.awardBtn.restore();
                                Live.treasure.checkNewTask();
                                return;
                            }

                            // 如果是最后一次则结束宝箱.
                            if (parseInt(result.data.isEnd, 10) === 1) {
                                Live.treasure.makeFinished();
                                return;
                            }

                            Live.liveToast(Live.treasure.captchaInput[0], "已成功领取 " + Live.treasure.taskInfo.award + " 银瓜子！" + Live.randomEmoji.happy(), "success");
                            Live.treasure.updateCurrency(); // 更新银瓜子.
                            Live.console.watcher('自动领瓜子 成功领取瓜子 ' + Live.treasure.taskInfo.award + ' 个')
                            var msg = new Notification("自动领取成功", {
                                body: "领取了" + Live.treasure.taskInfo.award + "个瓜子",
                                icon: "//static.hdslb.com/live-static/images/7.png"
                            });
                            setTimeout(function () {
                                msg.close();
                            }, 10000);

                            // 设置新的任务.
                            Live.treasure.checkNewTask();
                            Live.treasure.awardBtn.restore();
                            Live.treasure.allowCtrl = true;

                        })
                        .fail(function (xhrObject) {
                            Live.liveToast($captchaInput[0], "系统错误，请稍后再试 " + Live.randomEmoji.sad(), "error");
                            Live.treasure.captcha.refresh();
                            Live.treasure.awardBtn.restore();
                            Live.treasure.allowCtrl = true;
                            Live.treasure.getAward(time_start, time_end, captcha);
                            // MOCKING.
                            // treasureCtrl.setNewTask(111, 222, 5, 10);
                        })
                        .always(function () {
                            Live.treasure.captcha.userInput = "";
                        });
                }

            },
            updateCurrency: function () {
                if (isNaN(parseInt(Live.treasure.silverSeed, 10))) {
                    return
                }
                var newSeed = Live.treasure.silverSeed + Live.treasure.taskInfo.award;
                // Live.treasure.$fire("all!updateCurrency", { silver: newSeed });
                Live.treasure.silverSeed = newSeed;
            },
            setCountdown: function (countMinutes) {
                Live.treasure.countdown && Live.treasure.countdown.clearCountdown();
                var newDate = new Date();
                var targetMinutes = newDate.getMinutes() + countMinutes; // MOCKING: SHOULD RESTORE TO GET MINUTES.
                newDate.setMinutes(targetMinutes); // MOCKING: SHOULD RESTORE TO GET MINUTES.
                Live.treasure.countdown = new Live.countdown({
                    endTime: newDate,
                    element: Live.treasure.treasureCtrl.find(".count-down-node"),
                    callback: function () {
                        Live.treasure.makeAcquirable();
                        Live.treasure.treasureBox.find('.treasure-box').click();
                        setTimeout(function () {
                            Live.treasure.treasureTip.find('.acquiring-panel .get-award-btn').click();
                        }, 2000);
                    }
                });
                Live.treasure.allowCtrl = true;
            },
            correctQuestion: function (question) {
                var q = '',
                    question = question.trim();
                for (var i in question) {
                    var a = Live.treasure.correctStr[question[i]];
                    q += (a != undefined ? a : question[i]);
                }
                return q;
            },
            getCurrentTask: function () {
                return $.get('http://live.bilibili.com/FreeSilver/getCurrentTask', {}, function () {}, 'json').promise();
            },
            getSurplus: function () {
                return $.get('http://live.bilibili.com/FreeSilver/getSurplus', {}, function () {}, 'json').promise();
            },
            getCaptcha: function () {
                return "http://live.bilibili.com/freeSilver/getCaptcha?ts=" + Date.now();
            }
        };
        Live.chat = {
            maxLength: 20,
            text: '',
            colorValue: { 'white': '0xffffff', 'red': '0xff6868', 'blue': '0x66ccff', 'blue-2': '0x006098', 'cyan': '0x00fffc', 'green': '0x7eff00', 'yellow': '0xffed4f', 'orange': '0xff9800' },
            hideStyle: {
                chat: {
                    title: '聊天内容',
                    css: '#chat-msg-list .chat-msg{display:none;}',
                    value: 'off'
                },
                gift: {
                    title: '礼物信息',
                    css: '#chat-msg-list .gift-msg{display:none;}',
                    value: 'off'
                },
                vipEnterMsg: {
                    title: '老爷进场',
                    css: '#chat-msg-list .system-msg{padding:0 10px;height:auto;}#chat-msg-list .system-msg .live-icon,#chat-msg-list .system-msg .welcome,#chat-msg-list .system-msg .admin.square-icon,#chat-msg-list .system-msg .v-middle{display: none;}',
                    value: 'off'
                },
                liveTitleIcon: {
                    title: '成就头衔',
                    css: '#chat-msg-list .chat-msg .live-title-icon{display:none;}',
                    value: 'off'
                },
                mediaIcon: {
                    title: '粉丝勋章',
                    css: '#chat-msg-list .chat-msg .medal-icon{display:none;}',
                    value: 'off'
                },
                userLevel: {
                    title: '用户等级',
                    css: '#chat-msg-list .chat-msg .user-level-icon{display:none;}',
                    value: 'off'
                },
                chatBg: {
                    title: '聊天背景',
                    css: '#chat-list-ctnr{background:#f8f8f8;}',
                    value: 'off'
                },
                superGift: {
                    title: '礼物连击',
                    css: '.super-gift-ctnr{display:none;}',
                    value: 'off'
                },
                announcement: {
                    title: '系统通告',
                    css: '#chat-msg-list .announcement-container{display:none;}',
                    value: 'off'
                }
            },
            displayOption: [],
            init: function () {
                //init localstorage
                !store.has('bilibili_helper_chat_display') && store.set('bilibili_helper_chat_display', {});

                Live.chat.chat_ctrl_panel = $('#chat-ctrl-panel');
                Live.chat.counter = Live.chat.chat_ctrl_panel.find('.danmu-length-count');
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'danmu',
                }, function (response) {
                    if (response['value'] == 'on') {
                        $('#chat-ctrl-panel').append($('<div class="room-silent-merge dp-none p-absolute p-zero help-chat-shade" style="display:block;"><p><span class="hint-text"></span>弹幕增强功能正在初始化</p></div>'));
                        setTimeout(Live.chat.initDanmu, 2000);
                    }
                });
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'chatDisplay',
                }, function (response) {
                    if (response['value'] == 'on') {
                        Live.chat.initChatDisplay(true);
                    }
                });
            },
            do: function () {
                if (Live.chat.text.length > 0) {
                    var colorStr = $('.color-select-panel').find('a.active').attr('class').split(' ')[1];
                    $("#player_object")[0].sendMsg(Live.chat.text.substr(0, Live.chat.maxLength), Live.chat.colorValue[colorStr]);
                    Live.chat.text = Live.chat.text.substr(Live.chat.maxLength);
                    if (Live.chat.text.length > 0) setTimeout(function () {
                        Live.chat.do();
                    }, 4000);
                }
            },
            initDanmu: function () {
                //init & hide original ui
                var original_emoji_btn = Live.chat.chat_ctrl_panel.find('.chat-ctrl-btns .btns .emoji');
                var helper_emoji_btn = original_emoji_btn.clone().addClass('helper-emoji');
                original_emoji_btn.before(helper_emoji_btn).remove();

                var original_emoji_list = Live.chat.chat_ctrl_panel.find('.ctrl-panels .emoji-panel');
                var helper_emoji_list = original_emoji_list.clone().addClass('helper-emoji-list');
                original_emoji_list.before(helper_emoji_list).remove();

                var original_hot_words_btn = Live.chat.chat_ctrl_panel.find('.chat-ctrl-btns .btns .hot-words');
                var helper_hot_words_btn = original_hot_words_btn.clone().addClass('helper-hot-words');
                original_hot_words_btn.before(helper_hot_words_btn).remove();

                var original_hot_words_list = Live.chat.chat_ctrl_panel.find('.ctrl-panels .hot-words-panel');
                var helper_hot_words_list = original_hot_words_list.clone().addClass('helper-hot-words-list');
                original_hot_words_list.before(helper_hot_words_list).remove();

                var original_text_area = Live.chat.chat_ctrl_panel.find('.danmu-sender #danmu-textbox');
                Live.chat.maxLength = original_text_area.attr('maxlength');
                Live.chat.helper_text_area = original_text_area.clone().addClass('helper-text-area').removeAttr('maxlength');
                original_text_area.before(Live.chat.helper_text_area).remove();

                var original_send_btn = Live.chat.chat_ctrl_panel.find('.danmu-sender #danmu-send-btn');
                var helper_send_btn = original_send_btn.clone().addClass('helper-send-btn');
                original_send_btn.before(helper_send_btn).remove();

                Live.chat.maxLength = parseInt(store.get('helper_userInfo')['userLevel']) >= 20 ? 30 : 20;

                Live.chat.counter.text('0 / 1 + 0');

                //init event
                helper_emoji_btn.on('click', function () {
                    if (helper_emoji_list.css('display') == 'none') {
                        helper_emoji_list.show();

                        function n(t) {
                            var e = t && (t.target || t.srcElement);
                            e && e.className.indexOf("emoji-panel") > -1 || $(".emoji-panel").fadeOut(200, function () {
                                $(window).off("click", n);
                            })
                        }
                        setTimeout(function () {
                            $(window).on("click", n)
                        }, 1);
                    }
                });
                helper_hot_words_btn.on('click', function () {
                    if (helper_hot_words_list.css('display') == 'none') {
                        helper_hot_words_list.show();

                        function n(t) {
                            var e = t && (t.target || t.srcElement);
                            e && e.className.indexOf("hot-words-panel") > -1 || $(".hot-words-panel").fadeOut(200, function () {
                                $(window).off("click", n);
                            })
                        }

                        setTimeout(function () {
                            $(window).on("click", n)
                        }, 1);
                    }
                });
                helper_send_btn.on('click', function (e) {
                    e.preventDefault();
                    if (Live.chat.helper_text_area.val() != '') {
                        if (Live.chat.text.length == 0) {
                            Live.chat.text = Live.chat.helper_text_area.val().trim();
                            Live.chat.helper_text_area.val('');
                            Live.chat.do();
                        } else {
                            Live.chat.text += Live.chat.helper_text_area.val();
                            Live.chat.helper_text_area.val('');
                        }
                    } else Live.liveToast(helper_send_btn, 'info', '请输入弹幕后再发送~');
                });
                Live.chat.helper_text_area.on('keydown', function (e) {
                    var text = Live.chat.helper_text_area.val().trim();
                    if (e.keyCode === 13 && text == '') {
                        e.preventDefault();
                        Live.liveToast(helper_send_btn, 'info', '请输入弹幕后再发送~');
                        Live.chat.helper_text_area.val('');
                        return false;
                    } else if (e.keyCode === 13 && text != '') {
                        e.preventDefault();
                        if (Live.chat.text.length == 0) {
                            Live.chat.helper_text_area.val(text.substr(0, text.length));
                            helper_send_btn.click();
                        } else {
                            Live.chat.text += text;
                            Live.chat.helper_text_area.val('');
                            Live.chat.updateCounter('');
                        }
                        return false;
                    }
                    Live.chat.updateCounter(text);
                });
                Live.chat.helper_text_area.on('keyup', function () {
                    var text = Live.chat.helper_text_area.val().trim();
                    var part = parseInt(text.length / Live.chat.maxLength);
                    Live.chat.updateCounter(text);
                });
                helper_emoji_list.on('click', 'a', function () {
                    var text = Live.chat.helper_text_area.val().trim();
                    Live.chat.helper_text_area.val(text + $(this).text());
                    Live.chat.helper_text_area.focus();
                    Live.chat.updateCounter(Live.chat.helper_text_area.val().trim());
                });
                helper_hot_words_list.on('click', 'a', function () {
                    var text = Live.chat.helper_text_area.val().trim();
                    Live.chat.helper_text_area.val(text + $(this).text());
                    Live.chat.helper_text_area.focus();
                    Live.chat.updateCounter(Live.chat.helper_text_area.val().trim());
                });

                //init has finished
                Live.chat.chat_ctrl_panel.find('.help-chat-shade').hide('middle');
            },
            initChatHelper: function () {
                Live.chat.chat_ctrl_panel.find('#chatHelper').remove();
                Live.chat.chatHelper = $('<div id="chatHelper"></div>').css('background-image', 'url(' + chrome.extension.getURL("imgs/jinkela.png") + ')');
                Live.chat.chatDisplayBlock = $('<div class="chat-display"><h2 class="panel-title">屏蔽选项</h2></div>');
                Live.chat.chatHelperWindow = $('<div id="chatHelperWindow" class="chat-helper-panel ctrl-panel"></div>').hide();
                Live.each(Live.chat.hideStyle, function (i) {
                    var displayOptionDOM = $(
                        '<div class="display-option">' +
                        '<span class="title">' + Live.chat.hideStyle[i].title + '</span>' +
                        '<div class="option">' +
                        '<div class="button ' + i + (Live.chat.hideStyle[i].value == 'on' ? ' on' : '') + '" option="on">屏蔽</div>' +
                        '<div class="button ' + i + (Live.chat.hideStyle[i].value == 'off' ? ' on' : '') + '" option="off">显示</div>' +
                        '</div>' +
                        '</div>');
                    Live.chat.chatDisplayBlock.append(displayOptionDOM);
                });
                Live.chat.chatHelperWindow.append(Live.chat.chatDisplayBlock);
                Live.chat.chat_ctrl_panel.append(Live.chat.chatHelper, Live.chat.chatHelperWindow);
                Live.chat.chatHelper.off('click').on('click', function () {
                    if (Live.chat.chatHelperWindow.css('display') == 'none') {
                        Live.chat.chatHelperWindow.show();

                        function n(t) {
                            var e = t && (t.target || t.srcElement);
                            !$(e).hasClass('chat-helper-panel') && !$(e).parents('#chatHelperWindow').length &&
                                $(".chat-helper-panel").fadeOut(200, function () {
                                    $(window).off("click", n);
                                });
                        }
                        setTimeout(function () {
                            $(window).on("click", n)
                        }, 1);
                    }
                });
                Live.chat.chatDisplayBlock.find('.display-option .option .button').off('click').on('click', function () {
                    var classes = $(this).attr('class').split(' ')[1];
                    if ($(this).hasClass('on')) return false;
                    $('.' + classes).removeClass('on');
                    $(this).addClass('on');
                    var type = $(this).attr('option');
                    if (type == "on") {
                        var index = Live.chat.displayOption.indexOf(classes);
                        if (index == -1) Live.chat.displayOption.push(classes);

                    } else {
                        var index = Live.chat.displayOption.indexOf(classes);
                        if (index != -1) Live.chat.displayOption.splice(index, 1);

                    }
                    var o;
                    (o = store.get('bilibili_helper_chat_display'))[Live.roomId] = Live.chat.displayOption;
                    store.set('bilibili_helper_chat_display', o)

                    Live.chat.initChatDisplay();
                });
            },
            initChatDisplay: function (isInit) {
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'displayOption',
                }, function (response) {
                    var local = store.get('bilibili_helper_chat_display')[Live.roomId] || [];
                    var local_option = local.length ? local : [];
                    var global_option = JSON.parse(response['value']);
                    var big, small, count = 0;
                    if (local_option.length > global_option.length) {
                        big = local_option;
                        small = global_option
                    } else {
                        big = global_option;
                        small = local_option
                    }
                    count = big.length;
                    for (var i = 0; i < big.length; ++i) {
                        if (small.indexOf(big[i]) >= 0) --count;
                    }
                    if (!count) store.delete('bilibili_helper_chat_display', Live.roomId);
                    isInit && (Live.chat.displayOption = global_option);
                    var options = Live.chat.displayOption;
                    Live.each(Live.chat.hideStyle, function (i) {
                        var index = options.indexOf(i);
                        if (index < 0) {
                            $('.chatDisplayStyle_' + i).remove();
                            Live.chat.hideStyle[i].value = 'off';
                        } else if ($('.chatDisplayStyle_' + i).length == 0) {
                            Live.chat.addStylesheet(i);
                            Live.chat.hideStyle[i].value = 'on';
                        }
                    });
                    if (isInit) Live.chat.initChatHelper();
                });
            },
            addStylesheet: function (displayType) {
                var styleElement = document.createElement("style");
                styleElement.setAttribute("class", 'chatDisplayStyle_' + displayType);
                styleElement.setAttribute("type", "text/css");
                styleElement.appendChild(document.createTextNode(Live.chat.hideStyle[displayType].css));
                if (document.head) document.head.appendChild(styleElement);
                else document.documentElement.appendChild(styleElement);
            },
            updateCounter: function (text) {
                var part = parseInt(text.length / Live.chat.maxLength);
                var rest = part > 0 ? text.length % Live.chat.maxLength : 0;
                Live.chat.counter.text(text.length + ' / ' + (part == 0 ? 1 : part) + ' + ' + rest);
            },
        };
        Live.notise = {
            init: function () {
                var upInfo = {};
                Live.getRoomInfo().done(function (data) {
                    upInfo.uid = data.data.UID;
                    upInfo.roomId = data.data.ROOMID;
                    upInfo.roomShortI = location.pathname.substr(1);
                    upInfo.roomTitle = data.data.ROOMTITLE;
                    upInfo.upName = data.data.ANCHOR_NICK_NAME;
                    upInfo.url = location.href;
                    var notiseBtn = $('<div>').addClass('mid-part').append('<i class="live-icon-small favourite p-relative" style="top: 1px"></i><span>特别关注</span>').click(function () {
                        if ($(this).find('i').hasClass('favourited')) {
                            chrome.runtime.sendMessage({
                                command: "setNotFavourite",
                                id: upInfo.roomId
                            }, function (response) {
                                if (response.data) {
                                    notiseBtn.find('span').html('特别关注');
                                    notiseBtn.find('i').removeClass('favourited');
                                }
                            });
                        } else {
                            chrome.runtime.sendMessage({
                                command: "setFavourite",
                                upInfo: upInfo
                            }, function (response) {
                                if (response.data) notiseBtn.find('span').html('已特别关注')
                                notiseBtn.find('i').addClass('favourited');
                            });
                        }
                    }).hover(function(){
                        $(this).attr('title','关注之后再特别关注会在主播开播时进行推送哦'+Live.randomEmoji.happy());
                    });
                    chrome.runtime.sendMessage({
                        command: "getFavourite"
                    }, function (response) {
                        if (response.data.indexOf(parseInt(Live.roomId)) != -1) {
                            notiseBtn.find('span').html('已特别关注');
                            notiseBtn.find('i').addClass('favourited');
                        }
                    });
                    $('.attend-button').find('.left-part').after(notiseBtn);
                });
            }
        };
        Live.smallTV = {
            tvs: {},
            count: 0,
            reward: {},
            rewardList: {
                "1": "大号小电视",
                "2": "蓝白胖次道具",
                "3": "B坷垃",
                "4": "喵娘",
                "5": "便当",
                "6": "银瓜子",
                "7": "辣条"
            },
            init: function () {
                !store.has('bilibili_helper_tvs_count') && store.set('bilibili_helper_tvs_count', 0);
                !store.has('bilibili_helper_tvs_reward') && store.set('bilibili_helper_tvs_reward', {});
                Live.smallTV.reward = store.get('bilibili_helper_tvs_reward');
                Live.smallTV.count = store.get('bilibili_helper_tvs_count');
            },
            getTVByUrl: function (url) {
                var roomId = store.get('helper_live_roomId')[url];
                return Live.smallTV.tvs[roomId];
            },
            get: function (roomId) {
                $.getJSON('/SmallTV/index', { roomid: roomId, _: (new Date()).getTime() }).promise().done(function (result) {
                    if (result.code == 0) { // 正在抽奖中
                        if (result.data.unjoin.length || result.data.join.length) {
                            // sTvVM.isShowPanel = true;
                        }
                        // sTv.events.updatePanelsArr();
                        Live.console.watcher('监测到小电视抽奖活动 直播间【' + roomId + '】');
                    }
                    if (result.code == 0 && result.data.lastid) { // 抽奖结束
                        // sTv.events.showSmallTvTips(result.data.lastid);
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 抽奖已经结束');
                    } else {
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 成功获取抽奖信息');
                        var unjoin = result.data.unjoin;
                        Live.each(unjoin, function (index) {
                            Live.smallTV.join(roomId, unjoin[index].id);
                        });
                    }
                }).fail(function (result) {
                    Live.smallTV.get(roomId);
                });
            },
            join: function (roomId, tvId) {
                $.getJSON('/SmallTV/join', { roomid: roomId, _: (new Date()).getTime(), id: tvId }).promise().then(function (result) {
                    if (result.code == 0 && result.data.status == 1) { // 参加成功
                        Live.smallTV.tvs[roomId] = result.data;
                        var time = new Date();
                        Live.smallTV.tvs[roomId].timestamp = {
                            year: time.getFullYear(),
                            month: time.getMonth(),
                            day: time.getDate(),
                            week: time.getDay(),
                            hour: time.getHours(),
                            min: time.getMinutes(),
                            sec: time.getSeconds()
                        };
                        Live.smallTV.count += 1;
                        store.set('bilibili_helper_tvs_count', Live.smallTV.count);
                        Live.watcher.pushNotification('tv', "已参与小电视抽奖", "直播间【" + roomId + "】", "//static.hdslb.com/live-static/live-room/images/gift-section/gift-25.png")
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' 参加抽奖成功');
                    } else if (result.code == 0 && result.data.status == 2) { // 参加的时候已经过了三百秒，但是还未计算出结果
                        // sTv.panels.drawingPanel.open();
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' ' + result.msg);
                    } else {
                        // sTv.panels.commonPanel("提示", result.msg);
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' ' + result.msg);
                    }
                });
            },
            getReward: function (tvId, roomId) {
                $.getJSON('/SmallTV/getReward', { id: tvId }).promise().then(function (result) {

                    if (result.code == 0 && result.data.status == 0) {
                        Live.smallTV.tvs[roomId]['reward'] = result.data.reward;
                        Live.smallTV.tvs[roomId]['win'] = result.data.win;
                        var reward_num = Live.smallTV.reward[result.data.reward.id];
                        if (reward_num == undefined) Live.smallTV.reward[result.data.reward.id] = 0;

                        Live.smallTV.reward[result.data.reward.id] += result.data.reward.num;
                        store.set('bilibili_helper_tvs_reward', Live.smallTV.reward);
                        if (result.data.reward.num) {
                            Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' 获得' + Live.smallTV.rewardList[result.data.reward.id] + "x" + result.data.reward.num);
                            if (Live.watcher.notifyOptions && Live.watcher.notifyOptions.tv) {
                                chrome.runtime.sendMessage({
                                    command: "getTVReward",
                                    data: {
                                        roomId: roomId,
                                        rewardId: result.data.reward.id,
                                        rewardNum: result.data.reward.num,
                                        isWin: result.data.win
                                    }
                                });
                            }
                        } else Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' 您未赢得任何奖品');

                        // Live.console.info('tv', { msg: '你居然中了小电视' });
                    } else if (result.code == 0 && result.data.status == 1) {
                        // sTv.panels.commonPanel("抽奖过期", "非常抱歉，您错过了此次抽奖，下次记得早点来哦 (▔□▔)/");
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' ' + result.msg);
                    } else if (result.code == 0 && result.data.status == 2) {
                        // sTv.panels.drawingPanel.open();
                        // setTimeout(Live.smallTV.getReward(result.data.id, roomId), 1000);
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' ' + result.msg);
                    } else {
                        // sTv.panels.commonPanel("提示", result.msg);
                        Live.console.watcher('小电视活动 直播间【' + roomId + '】 编号:' + tvId + ' ' + result.msg);
                    }
                });
            }
        };
        Live.summer = {
            lotteryMap: {},
            lotteries: {},
            iteratorMap: {},
            reward: {},
            count: 0,
            init: function () {
                !store.has('bilibili_helper_summer_count') && store.set('bilibili_helper_summer_count', 0);
                !store.has('bilibili_helper_summer_reward') && store.set('bilibili_helper_summer_reward', {});
                Live.summer.count = store.get('bilibili_helper_summer_count');
                Live.summer.reward = store.get('bilibili_helper_summer_reward');
            },
            get: function (roomId) {
                // var result = {
                //     "code": 0,
                //     "msg": "\u83b7\u53d6\u6210\u529f",
                //     "data": [{
                //         "type": "summer",
                //         "raffleId": 171,
                //         "time": 83,
                //         "status": false 0  没有参加  1  等待抽奖； 2 等待开奖
                //     }]
                // };
                $.getJSON('/summer/check', { roomid: roomId }).promise().then(function (result) {
                    if (result.code == -403) Live.console.watcher('刨冰活动 获取抽奖信息失败');
                    else if (result.code == 0 && result.data.length > 0) {
                        Live.console.watcher('监测到刨冰抽奖活动 直播间【' + roomId + '】');
                        if (Live.summer.lotteryMap[roomId] == undefined) Live.summer.lotteryMap[roomId] = [];
                        Live.each(result.data, function (index) {
                            // console.log(result.data, index)
                            var lottery = result.data[index];
                            var raffleId = lottery.raffleId;
                            if (Live.summer.lotteries[raffleId] == undefined) { //new
                                var time = new Date();
                                lottery.timestamp = {
                                    year: time.getFullYear(),
                                    month: time.getMonth(),
                                    day: time.getDate(),
                                    week: time.getDay(),
                                    hour: time.getHours(),
                                    min: time.getMinutes(),
                                    sec: time.getSeconds()
                                };
                                Live.summer.lotteries[raffleId] = lottery;
                                Live.summer.lotteryMap[roomId].push(raffleId);
                                Live.console.watcher('刨冰活动 直播间【' + roomId + '】 编号:' + raffleId + ' 已加入监控列表 ');
                                Live.summer.join(roomId, raffleId);
                                // if (Live.summer.iteratorMap[roomId] == null) Live.summer.iteratorMap[roomId] = 0;
                            }
                        });
                        // if ((Live.summer.lotteryMap[roomId].length - 1) <= Live.summer.iteratorMap[roomId]) {
                        //     var iter = Live.summer.iteratorMap[roomId];
                        //     var raffleId = Live.summer.lotteryMap[roomId][iter];
                        //     Live.summer.join(roomId, raffleId);
                        // }
                    }
                }, function () {
                    Live.console.watcher('刨冰活动 直播间【' + roomId + '】 编号:' + raffleId + ' 获取抽奖信息失败');
                    Live.summer.check(roomId);
                });
            },
            join: function (roomId, raffleId) {
                // var result = {
                //     code: 0,
                //     msg: "等待开奖",
                //     data: []
                // };
                $.getJSON('/summer/join', { roomid: roomId, raffleId: raffleId }).promise().then(function (result) {
                    Live.console.watcher('刨冰活动 直播间【' + roomId + '】 编号:' + raffleId + ' 参加成功');
                    Live.summer.count += 1;
                    store.set('bilibili_helper_summer_count', Live.summer.count);
                    Live.watcher.pushNotification('lottery', "已参与刨冰抽奖", "直播间:" + roomId + " 编号:" + raffleId, "//static.hdslb.com/live-static/live-room/images/gift-section/gift-36.png");
                    Live.summer.lotteries[raffleId].setTimeoutNum = setTimeout(function () {
                        Live.summer.getReward(roomId, raffleId, function (result, roomId, raffleId) {
                            var msg;
                            if (result.data.giftName != "") {
                                var rewardCount = Live.summer.reward[result.data.giftId];
                                if (rewardCount == undefined) Live.summer.reward[result.data.giftId] = 0;
                                Live.console.watcher("刨冰活动 直播间【" + roomId + "】 编号:" + raffleId + " 抽中" + result.data.giftName + "x" + result.data.giftNum);
                                Live.watcher.pushNotification('lottery', "直播间【" + roomId + "】刨冰抽奖结果", "编号:" + raffleId + " 抽中" + result.data.giftName + "x" + result.data.giftNum, "//static.hdslb.com/live-static/live-room/images/gift-section/gift-36.png");
                                Live.summer.reward[result.data.giftId] += result.data.giftNum;
                                store.set('bilibili_helper_summer_reward', Live.summer.reward);
                                Live.summer.lotteries[raffleId].reward = result.data;
                            } else {
                                Live.console.watcher("刨冰活动 直播间【" + roomId + "】 编号:" + raffleId + " " + result.msg);
                                Live.watcher.pushNotification('lottery', "直播间【" + roomId + "】刨冰抽奖结果", "编号:" + raffleId + " " + result.msg, "//static.hdslb.com/live-static/live-room/images/gift-section/gift-36.png");
                            }

                            // if ((Live.summer.lotteryMap[roomId].length - 1) > Live.summer.iteratorMap[roomId]) {
                            //     var iter = ++Live.summer.iteratorMap[roomId];
                            //     var raffleId = Live.summer.lotteryMap[roomId][iter];
                            //     Live.summer.join(roomId, raffleId);
                            // }
                        });
                    }, (Live.summer.lotteries[raffleId].time + 50) * 1000);
                }, function () {
                    Live.console.watcher('刨冰活动 直播间【' + roomId + '】 编号:' + raffleId + ' 参加抽奖信息失败');
                    Live.summer.join(roomId, raffleId);
                });
            },
            getReward: function (roomId, raffleId, callback) {
                // var result = {
                //     code: 0,
                //     msg: "你一无所获，酋长喊你回部落吃饭。",
                //     data: {
                //         giftName: ""
                //     }
                // };
                // var result = {
                //     code: 0,
                //     msg: "获取成功",
                //     data: {
                //         giftName: "辣条",
                //         giftNum: 5,
                //         giftId: "1",
                //         raffleId: 964
                //     }
                // };
                $.getJSON('/summer/notice', { roomid: roomId, raffleId: raffleId }).promise().then(function (result) {
                    if (typeof callback == 'function') callback(result, roomId, raffleId);
                }, function () {
                    Live.console.watcher('刨冰活动 直播间【' + roomId + '】 编号:' + raffleId + ' 获取领奖信息失败');
                    Live.summer.getReward(roomId, raffleId);
                });
            }
        };
        Live.watcher = {
            options: {
                'tv': false,
                'lottery': false
            },
            notifyStatus: false,
            notifyOptions: {
                'tv': false,
                'lottery': false
            },
            init: function () {
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'watcher'
                }, function (res) {
                    if (res['value'] == 'on') setTimeout(function () {
                        chrome.runtime.sendMessage({
                            command: "getWatcherRoom"
                        }, function (response) {
                            Live.watcherInfoDOM = $('<div class="room-info watcher-info">直播信息监控功能正在初始化</div>');
                            Live.bilibiliHelperInfoDOM.append(Live.watcherInfoDOM);
                            if (response['data'].roomId == undefined) {
                                //setWatcherRoom
                                var roomId = Live.roomId;
                                Live.getRoomInfo().done(function (data) {
                                    chrome.runtime.sendMessage({
                                        command: "setWatcherRoom",
                                        data: {
                                            uid: data.data.UID,
                                            roomId: data.data.ROOMID,
                                            roomShortId: location.pathname.substr(1),
                                            roomTitle: data.data.ROOMTITLE,
                                            upName: data.data.ANCHOR_NICK_NAME,
                                            url: location.href
                                        }
                                    });
                                });
                                chrome.runtime.sendMessage({
                                    command: "getOption",
                                    key: 'watchList',
                                }, function (response) {
                                    var watchList = response['value'] ? JSON.parse(response['value']) : [];
                                    Live.scriptOptions['watcher'] = [];
                                    Live.each(watchList, function (i) {
                                        var option = Live.watcher.options[watchList[i]];
                                        if (!option) {
                                            Live.watcher.options[watchList[i]] = true;
                                            Live.scriptOptions['watcher'].push(watchList[i]);
                                            Live.console.watcher('启动:' + watchList[i]);
                                        }
                                    });
                                    $(window).on('beforeunload', function () {
                                        chrome.runtime.sendMessage({
                                            command: "delWatcherRoom"
                                        });
                                        console.log(0);
                                    });

                                    Live.watcher.options['tv'] && Live.smallTV.init();
                                    Live.watcher.options['lottery'] && Live.summer.init();
                                    document.addEventListener("sendMessage", function (event) {
                                        var message = store.get('bilibili_helper_message');
                                        if (!message.cmd) return false;
                                        Live.watcher.classify(message);
                                    });
                                });
                                chrome.runtime.sendMessage({
                                    command: "getOption",
                                    key: 'watchNotify',
                                }, function (response) {
                                    Live.watcher.notifyStatus = response['value'] == 'on';
                                });
                                chrome.runtime.sendMessage({
                                    command: "getOption",
                                    key: 'watchNotifyList',
                                }, function (response) {
                                    var notifyOptionsList = response['value'] ? JSON.parse(response['value']) : [];
                                    Live.each(notifyOptionsList, function (i) {
                                        var option = Live.watcher.notifyOptions[notifyOptionsList[i]];
                                        if (!option) {
                                            Live.watcher.notifyOptions[notifyOptionsList[i]] = true;
                                        }
                                    });
                                });
                                Live.watcherInfoDOM.html('该房间已开启监控功能');
                            } else {
                                Live.watcherInfoDOM.html('监控功能已在<a target="_blank" href="' + response['data'].url + '">' + response['data'].upName + '</a>的直播间启动');
                            }
                        });
                    }, 2000);
                });
            },
            classify: function (json) {
                switch (json.cmd) {
                    case 'DANMU_MSG':
                        Live.console.info('danmu', json);
                        break;
                    case 'SYS_MSG':
                        Live.console.info('system', json);
                        Live.watcher.options['tv'] && Live.watcher.dealWithSysMsg(json);
                        break;
                    case 'TV_END':
                        Live.console.info('tv_end', json);
                        break;
                    case 'SEND_GIFT':
                        Live.console.info('gift', json);
                        break;
                    case 'SYS_GIFT':
                        Live.console.info('sys_gift', json);
                        Live.watcher.options['lottery'] && Live.watcher.dealWithSysGift(json);
                        break;
                }
            },
            dealWithSysMsg: function (json) {
                var msg = json.msg;
                if (msg[0] == "【" && json.url != "" && json.rep == 1 && json.styleType == 2) { //smallTV
                    var reg = new RegExp("【([\\S]+)】在直播间【([\\d]+)】");
                    var res = reg.exec(msg);
                    var user = res[1];
                    var roomUrl = res[2];
                    Live.getRoomIdByUrl(roomUrl, function (roomId) {
                        Live.smallTV.get(roomId);
                    });
                } else if (msg[0] == "恭" && json.url == "" && json.rep == 1 && json.styleType == 2) { //get smallTV
                    var reg = new RegExp("恭喜【([\\S]+)】在直播间【([\\d]+)】");
                    var res = reg.exec(msg);
                    var user = res[1];
                    var url = res[2];
                    var tv = Live.smallTV.getTVByUrl(url);
                    var roomId = store.get('helper_live_roomId')[url];
                    tv && Live.smallTV.getReward(tv.id, roomId);
                }
            },
            dealWithSysGift: function (json) {
                //"tips": "【正義の此方】在直播间【81688】内 赠送 刨冰共 100 个，触发 1 次刨冰雨抽奖，快去前往抽奖吧！"
                try {

                    var msg = json.tips;
                    if (typeof msg != 'string') return;
                    else if (msg.charAt(0) != '【') return;
                    if (json.tips && msg[0] == "【" && json.url != "" && json.rep == 1) { //smallTV
                        var reg = new RegExp("【([\\S]+)】在直播间【([\\d]+)】内 赠送 刨冰共 ([\\d]+)");
                        var res = reg.exec(msg);
                        var user = res[1];
                        var roomUrl = res[2];
                        var num = res[3];
                        Live.getRoomIdByUrl(roomUrl, function (roomId) {
                            Live.summer.get(roomId);
                        });
                    }
                } catch (e) {
                    console.log(e);
                    return;
                }
            },
            pushNotification: function (type, title, body, icon) {
                if (Live.watcher.notifyStatus && Live.watcher.notifyOptions[type]) {
                    var msg = new Notification(title, {
                        body: body,
                        icon: icon
                    });
                    setTimeout(function () {
                        msg.close();
                    }, 5000);
                }
            }
        };
        // Live.giftpackage = {
        //     giftPackageStatus: 0, // 0: 没有道具 1: 包裹中有赠送的新道具 2:包裹里非新增道具
        //     panelStatus: false,
        //     giftPackageData: [],
        //     giftPackageMap: {},

        //     toggleGiftPackage: function (event) {
        //         event.stopPropagation();
        //         Live.liveQuickLogin();
        //         if (!giftPackagelVM.panelStatus) {
        //             if (giftPackagelVM.giftPackageStatus == 1) { // 有新道具，先打开新送道具面板
        //                 Live.giftpackage.openGiftPackageNewPanel();
        //             } else {
        //                 Live.giftpackage.openGiftPackagePanel(); // 否则直接打开包裹
        //             }
        //         } else {
        //             Live.giftpackage.closeGiftPackagePanel();
        //         }
        //     },
        //     giftSendPanel: {
        //         giftData: {
        //             giftId: "",
        //             giftName: "",
        //             giftNum: 0,
        //             type: "silver",
        //             count: 1,
        //             bagId: 0
        //         },
        //         show: false,
        //         out: false,
        //         outTimeout: null,
        //         open: function (giftId, giftName, giftNum, bigId) {
        //             var sendPanel = Live.giftpackage.giftSendPanel;

        //             sendPanel.giftData.giftId = giftId;
        //             sendPanel.giftData.giftName = giftName;
        //             sendPanel.giftData.giftNum = giftNum;
        //             sendPanel.giftData.count = 1;
        //             sendPanel.giftData.bagId = bigId;

        //             Live.giftpackage.panelStatus = false;
        //             sendPanel.show = true;
        //         },
        //         close: function () {
        //             var sendPanel = Live.giftpackage.giftSendPanel;
        //             sendPanel.out = true;
        //             sendPanel.outTimeout = setTimeout(function () {
        //                 sendPanel.out = false;
        //                 sendPanel.show = false;
        //                 sendPanel = null;
        //             }, 380);
        //         },
        //         sendGift: function (event) {
        //             if (event.type === "keyup" && event.keyCode !== 13) {
        //                 return;
        //             }

        //             var element = event.target || event.srcElement;
        //             var giftData = Live.giftpackage.giftSendPanel.giftData;
        //             var num = parseInt(giftData.count, 10);

        //             // 检测礼物数量是否为合法数字.
        //             if (isNaN(num)) {
        //                 giftData.count = "";
        //                 liveToast(element, "请填写正确的送礼数量 " + Live.randomEmoji.helpless(), true);
        //                 return;
        //             }

        //             var timestamp = timestampShorter(Date.now());

        //             var sendGiftUrl = "";
        //             if (param.type == "normal") {
        //                 sendGiftUrl = "/gift/send";
        //             } else if (param.type == "package") {
        //                 sendGiftUrl = "/giftBag/send";
        //             }

        //             $.ajax({
        //                 url: sendGiftUrl,
        //                 type: "POST",
        //                 data: {
        //                     giftId: giftData.data.giftId,
        //                     roomid: ROOMID,
        //                     ruid: MASTERID,
        //                     num: giftData.data.num,
        //                     coinType: giftData.data.coinType,
        //                     Bag_id: giftData.data.bagId || 0,
        //                     timestamp: timestamp,
        //                     rnd: DANMU_RND,
        //                     token: Live.getCookie("LIVE_LOGIN_DATA") || ""
        //                 },
        //                 dataType: "JSON",
        //                 success: function (result) {
        //                     if (result.code == 0) {
        //                         console.log("Gift-sending is successful.");
        //                         // 更新瓜子数.
        //                         // giftCtrl.$fire("all!updateCurrency", {
        //                         //     gold: result.data.gold,
        //                         //     silver: result.data.silver
        //                         // });

        //                         // 如果是弹幕道具通知 Flash.
        //                         result.data.data.giftType == 1 && $("#player_object")[0].sendGift(result.data.data.giftId, result.data.data.num);

        //                         // 如果获得勋章.
        //                         result.data.data.newMedal == 1 && giftCtrl.$fire("all!newFansMedalNotice", {
        //                             medalId: result.data.data.medal.medalId,
        //                             medalName: result.data.data.medal.medalName,
        //                             medalLevel: result.data.data.medal.level
        //                         });

        //                         // 获得新头衔
        //                         result.data.data.newTitle == 1 && giftCtrl.$fire("all!newTitleNotice", result.data.data.title);

        //                         // 判断礼物价值并将其放在对应位置.
        //                         // Edited By LancerComet at XX:XX (Afternoon), 2016.03.22.
        //                         if (parseInt(result.data.data.num, 10) < 10 && chatGiftJudgement(result.data.data.giftId)) {
        //                             chatGiftList(result.data);
        //                         } else {
        //                             // 本地添加送礼记录.
        //                             window.liveRoomFuncs.addGiftHistory(result.data);
        //                         }

        //                         // 连击礼物.
        //                         giftCtrl.$fire("all!superGift", result.data.data);

        //                         // 更新投喂榜.
        //                         giftCtrl.$fire("all!updateGiftTop", result.data.data.top_list);

        //                         // 更新扭蛋机数据
        //                         giftCtrl.$fire("all!updateCapsuleData", result.data.data.capsule);

        //                         // 送小电视用户通过接口获得通知，屏蔽广播
        //                         if (result.data.data.giftId == 25) {
        //                             (function () {
        //                                 var msgItem = {};
        //                                 for (var i = 0; i < result.data.data.smalltv_msg.length; i++) {
        //                                     msgItem = result.data.data.smalltv_msg[i];
        //                                     msgItem.msg = msgItem.msg.replace(/\:\?/g, " ");
        //                                     giftCtrl.$fire("all!addSysMsg", msgItem);
        //                                 }
        //                             })();
        //                         }

        //                         // 调用 Flash 礼物公共方法
        //                         if (result.data.data.notice_msg) {
        //                             $("#player_object")[0].noticeGift(result.data.data.notice_msg);
        //                         }

        //                     }

        //                     // 道具包裹刷道具锁定状态不提示错误
        //                     else if (result.code == 1) {
        //                         console.log("系统繁忙...");
        //                     }

        //                     // 余额不足自动弹出相应弹窗.
        //                     else if (result.code == -400 && result.msg == "余额不足") {
        //                         giftCtrl.$fire("all!noSeed");
        //                         closeGiftSendPanel();
        //                     }

        //                     // Error Handler.
        //                     else {
        //                         element && liveToast(element, result.msg + " " + Live.randomEmoji.sad(), "caution", true);
        //                     }

        //                     // Callback
        //                     if (result.code == 0) {
        //                         giftData.giftNum = result.data.remain;
        //                         // 当 remain 为 0 时检查包裹状态并更新
        //                         if (result.data.remain == 0) {
        //                             getGiftPackageStatus(function (result) {
        //                                 giftPackagelVM.giftPackageStatus = result.data.result;
        //                             });
        //                         }
        //                     }
        //                 },
        //                 error: function (result) {
        //                     element && liveToast(element, Live.randomEmoji.sad() + " 送礼失败：" + result.statusText + " " + Live.randomEmoji.sad(), "error");
        //                     param.errorCallback && param.errorCallback();
        //                 }
        //             });

        //             giftPackagelVM.$fire("all!sendGift", {
        //                 element: element,
        //                 type: "package",
        //                 data: {
        //                     giftId: giftData.giftId,
        //                     num: num,
        //                     coinType: giftData.type,
        //                     bagId: giftData.bagId
        //                 },
        //                 callback: function (result) {
        //                     if (result.code == 0) {
        //                         giftData.giftNum = result.data.remain;
        //                         // 当 remain 为 0 时检查包裹状态并更新
        //                         if (result.data.remain == 0) {
        //                             getGiftPackageStatus(function (result) {
        //                                 giftPackagelVM.giftPackageStatus = result.data.result;
        //                             });
        //                         }
        //                     }
        //                 }
        //             });
        //         }
        //     },
        //     giftPackageNewPanel: {
        //         data: [],
        //         show: false,
        //         out: false,
        //         outTimeout: null,
        //         open: Live.giftpackage.openGiftPackageNewPanel,
        //         close: Live.giftpackage.closeGiftPackageNewPanel
        //     },
        //     init: function () {
        //         //init dom
        //         Live.giftpackage.controlPanel = $('#gift-panel').find('.control-panel');
        //         Live.giftpackage.package = Live.giftpackage.controlPanel.find('.items-package').clone();
        //         Live.giftpackage.controlPanel.find('.items-package').after(Live.giftpackage.package).hide();
        //         Live.giftpackage.packageBtn = Live.giftpackage.package.find('.link');
        //         Live.giftpackage.packagePanel = Live.giftpackage.package.find('.gifts-package-panel');
        //     },
        //     initGiftsDOM: function () {
        //         Live.giftpackage.getGiftPackage().then(function (result) {
        //             if (result.code == 0) {

        //                 Live.giftpackage.giftPackageData = result.data;
        //                 Live.giftpackage.giftPackageMap = Live.giftpackage.sortGifts(result.data);
        //             }
        //         }, function () {
        //             console.log('获取礼物包裹数据失败，正在重试')
        //             Live.giftpackage.initGiftsDOM();
        //         });
        //     },
        //     sortGifts: function (giftpackageData) {
        //         var r = {},
        //             gs = giftpackageData;
        //         for (var i in gs) {
        //             var gift = gs[i];
        //             // expireat:"31天"
        //             // gift_id:37
        //             // gift_name:"团扇"
        //             // gift_num:39
        //             // gift_price:"1000金瓜子"
        //             // gift_type:3
        //             // id:4473074
        //             // uid:50623
        //             if (r[gift.gift_id] == undefined) r[gift.gift_id] = {};

        //         }
        //     },
        //     getGiftPackage: function () { //get package data
        //         return $.get('http://live.bilibili.com/gift/playerBag', {}, function () {}, 'json').promise();
        //     },
        //     getSendGift: function () { // get new gift
        //         return $.get('http://live.bilibili.com/giftBag/getSendGift', {}, function () {}, 'json').promise();
        //     },
        //     getGiftPackageStatus: function () { //get the info for 'if has new gift'
        //         return $.get('http://live.bilibili.com/giftBag/sendDaily', {}, function () {}, 'json').promise();
        //     },
        //     openGiftPackageNewPanel: function () {
        //         var giftPackageNewPanel = Live.giftpackage.giftPackageNewPanel;
        //         // 获取赠送的新道具数据
        //         getSendGift(function (result) {
        //             if (result.code == 0) {
        //                 giftPackageNewPanel.data = result.data;
        //                 giftPackageNewPanel.show = true;
        //             }
        //         });
        //     },
        //     closeGiftPackageNewPanel: function () {
        //         var giftPackageNewPanel = Live.giftpackage.giftPackageNewPanel;
        //         giftPackageNewPanel.out = true;
        //         giftPackageNewPanel.outTimeout = setTimeout(function () {
        //             giftPackageNewPanel.out = false;
        //             giftPackageNewPanel.show = false;
        //             giftPackageNewPanel = null;
        //             giftPackagelVM.giftPackageStatus = 2;
        //             Live.giftpackage.openGiftPackagePanel(); // 打开包裹
        //         }, 380);
        //     },
        //     openGiftPackagePanel: function () {
        //         Live.giftpackage.getGiftPackage(function (result) {
        //             giftPackagelVM.giftPackageData = result.data;
        //             giftPackagelVM.panelStatus = true;
        //         });
        //         setTimeout(function () {
        //             $(document).on("click", Live.giftpackage.closeGiftPackagePanel);
        //         }, 1);
        //     },
        //     closeGiftPackagePanel: function () {
        //         $(".gifts-package-panel").fadeOut(200, function () {
        //             Live.giftpackage.panelStatus = false;
        //             $(document).off("click", Live.giftpackage.closeGiftPackagePanel);
        //         });
        //     }
        // };
        Live.init = {
            do: function () {
                Live.clearLocalStorage();
                chrome.runtime.sendMessage({
                    command: "getOption",
                    key: 'version',
                }, function (response) {
                    Live.version = response.value;
                    $('#gift-panel').find('.control-panel').prepend("<div class=\"ctrl-item version\">哔哩哔哩助手 v" + Live.version + " by <a href=\"http://weibo.com/guguke\" target=\"_blank\">@啾咕咕www</a> <a href=\"http://weibo.com/ruo0037\" target=\"_blank\">@沒睡醒的肉啊</a></div>");
                    Live.init.initStyle();
                });
                store.set('helper_userInfo', { 'login': false });
                Live.roomId = Live.getRoomId();
                if (!store.has('helper_live_autoMode')) store.set('helper_live_autoMode', {});
                if (!store.has('helper_live_roomId')) store.set('helper_live_roomId', {});
                Live.initUserInfo(function () {
                    if (store.get('helper_userInfo', 'login')) {
                        chrome.runtime.sendMessage({
                            command: "getOption",
                            key: 'doSign',
                        }, function (response) {
                            if (response['value'] == 'on') Live.doSign.init();
                        });
                        Live.bilibiliHelperInfoDOM = $('<div class="room-info bilibili-helper-info"></div>');
                        $('#head-info-panel').append(Live.bilibiliHelperInfoDOM);
                        if (location.pathname.substr(1) && !isNaN(location.pathname.substr(1))) {
                            Live.bet.quiz_toggle_btn = $('<a class="bet_toggle">自动下注</a>');
                            $('#quiz-control-panel').find('.section-title').append(Live.bet.quiz_toggle_btn);
                            Live.bet.quiz_toggle_btn.click(function () {
                                if (store.get('helper_live_autoMode')[Live.roomId] == 1) Live.bet.disable();
                                else Live.bet.able();
                            });
                            if (store.get('helper_live_autoMode')[Live.roomId] == 1) Live.bet.check();

                            Live.treasure.init();
                            Live.watcher.init();
                            Live.chat.init();
                            Live.notise.init();
                            setTimeout(function () {
                                Live.addScriptByFile('live-content-script.js', Live.scriptOptions);
                            }, 3500);
                            Notification.requestPermission();
                        }
                    }
                });
            },
            initStyle: function () {
                var l = $('document').find('#bilibiliHelperLive');
                if (l.length) l.remove();
                var styleLink = document.createElement("link");
                styleLink.setAttribute("id", 'bilibiliHelperLive');
                styleLink.setAttribute("type", "text/css");
                styleLink.setAttribute("rel", "stylesheet");
                styleLink.setAttribute('href', chrome.extension.getURL('live.css'));
                if (document.head) document.head.appendChild(styleLink);
                else document.documentElement.appendChild(styleLink);
            }
        };
        Live.init.do();
    }
})();
