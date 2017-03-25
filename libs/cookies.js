var utils = {
    bindFn: function (e, f) {
        var d = Array.prototype.slice.call(arguments, 2);
        return function () {
            return e.apply(f, d.concat(Array.prototype.slice.call(arguments)))
        }
    },
    cookie: {
        get: function (f) {
            var h = "" + document.cookie,
                e = h.indexOf(f + "=");
            if (-1 == e || "" == f) {
                return ""
            }
            var g = h.indexOf(";", e); - 1 == g && (g = h.length);
            return unescape(h.substring(e + f.length + 1, g))
        },
        set: function (f, h, e) {
            e = void 0 !== e ? e : 365;
            var g = new Date;
            g.setTime(g.getTime() + 86400000 * e);
            document.cookie = f + "=" + escape(h) + ";expires=" + g.toGMTString() + "; path=/; domain=.bilibili.com"
        },
        "delete": function (b) {
            this.set(b, "", -1)
        }
    }
};
export const __GetCookie = utils.bindFn(utils.cookie.get, utils);
export const __SetCookie = utils.bindFn(utils.cookie.set, utils);