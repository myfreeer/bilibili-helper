var lastMessageBoxLayer = 20000;

function MessageBox(msg) {
    this.params = {
        evType: "over",
        center: !0,
        Overlap: !1,
        focusShowPos: "up",
        zIndex: null,
        animation: "fade",
        position: null,
        event: null,
        bound: !0,
        margin: 5,
        backdrop: !1,
        bindInput: !1
    };
    "string" == typeof msg && (msg = {
        evType: msg
    });
    if ("object" == typeof msg) {
        for (var i in this.params) {
            msg.hasOwnProperty(i) && (this.params[i] = msg[i])
        }
    }
}
MessageBox.prototype = {
    timer: null,
    msgbox: null,
    bindobj: null,
    backobj: null,
    incomingTimer: null,
    position: {},
    reverseMap: {
        up: "down",
        down: "up",
        left: "right",
        right: "left"
    },
    show: function (i, o, h, n, l) {
        i = $(i);
        if (!1 != this.params.Overlap || "yes" != i.attr("hasMessageBox")) {
            i.attr("hasMessageBox", "yes");
            "undefined" == typeof h && (h = 1000);
            "undefined" == typeof n && (n = "msg");
            "button" == h && (l = n, n = h, h = 1000);
            var k = h;
            0 == h && (k = 50);
            var j = this;
            j.leftTimer = function () {
                "button" != n && (clearTimeout(j.timer), j.timer = setTimeout(function () {
                    clearTimeout(j.timer);
                    j.close(j)
                }, k))
            };
            j.incomingTimer = function () {
                clearTimeout(j.timer)
            };
            this.bindobj = i;
            this.msgbox = $('<div class="m-layer m_layer"><div class="bg"><div class="content"><div class="mini"><div class="msg-text"><i class="b-icon"></i>' + o + "</div>" + ("button" == n ? '<div class="btnbox"><a class="b-btn ok">\u786e\u8ba4</a><a class="b-btn-cancel cancel">\u53d6\u6d88</a></div>' : "") + "</div></div></div></div>").prependTo("body");
            this.msgbox.addClass("m-" + n);
            j.params.backdrop && (j.backobj = $('<div class="m-backdrop"></div>').css({
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.6,
                backgroundColor: "#000",
                zIndex: (j.params.zIndex || lastMessageBoxLayer) - 1
            }).appendTo("body"));
            "over" == this.params.evType ? (i.bind("mouseleave", j.leftTimer), i.bind("mouseenter", j.incomingTimer), this.msgbox.bind("mouseenter", function () {
                clearTimeout(j.timer)
            }), this.msgbox.bind("mouseleave", j.leftTimer)) : i.bind("blur", j.leftTimer);
            this.setPos();
            this.msgbox.css("z-index", j.params.zIndex || lastMessageBoxLayer++);
            if (this.params.bindInput && "error" == n) {
                if (i.is(":text") || i.is("textarea")) {
                    i.addClass("error").on("focus.m-error", this.closeErrHandler())
                } else {
                    if (0 < i.find(":text,textarea").length) {
                        i.addClass("error").find(":text,textarea").on("focus.m-error", this.closeErrHandler())
                    }
                }
            }
            "button" == n && (this.msgbox.find(".ok").click(function () {
                "undefined" != typeof l && !1 == l(j) || j.close()
            }), this.msgbox.find(".cancel").click(function () {
                j.close()
            }));
            0 != h && j.leftTimer();
            "fade" != this.params.animation ? this.msgbox.addClass(this.params.animation) : this.moveIn(this.params.focusShowPos);
            this.bindobj.data("b-msgbox", this);
            return this.msgbox
        }
    },
    close: function () {
        var b = this,
            d = function () {
                b.msgbox.remove();
                b.params.backdrop && b.backobj.remove();
                "over" == b.params.evType && b.bindobj.off("mouseenter", b.incomingTimer);
                b.bindobj.off("over" == b.params.evType ? "mouseleave" : "blur", b.leftTimer)
            };
        this.bindobj.attr("hasMessageBox", "");
        "fade" != this.params.animation ? this.msgbox.removeClass(this.params.animation).fadeOut(200, d) : this.msgbox.fadeOut(200, d)
    },
    closeErrHandler: function () {
        var b = this;
        return function () {
            var a = b.bindobj.removeClass("error");
            b.close();
            a.is(":text") || a.is("textarea") ? a.off("focus.m-error") : 0 < a.find(":text,textarea").length && a.find(":text,textarea").off("focus.m-error")
        }
    },
    moveIn: function (f) {
        var h = {
                opacity: 1
            },
            e = 5,
            g = 5;
        switch (f) {
        case "up":
            h.top = "-=5";
            g = 0;
            break;
        case "down":
            h.top = "+=5";
            e = -e;
            g = 0;
            break;
        case "left":
            h.left = "-=5";
            e = 0;
            break;
        case "right":
            h.left = "+=5";
            g = -g;
            e = 0;
            break;
        default:
            h.top = "-=5", g = 0
        }
        this.msgbox.show().css({
            top: this.position.top + e,
            left: this.position.left + g,
            opacity: 0
        });
        this.msgbox.animate(h, 200)
    },
    setPos: function () {
        this.params.position ? (this.position = this.params.position, this.resetBound()) : this._pos(this.params.focusShowPos);
        this.msgbox.css("left", this.position.left);
        this.msgbox.css("top", this.position.top)
    },
    _pos: function (e, f) {
        var d = this.bindobj;
        this.params.focusShowPos = e;
        switch (e) {
        case "up":
            this.position.top = d.offset().top - this.msgbox.outerHeight() - this.params.margin;
            this.position.left = d.offset().left;
            this.params.center && (this.position.left = this.position.left - this.msgbox.outerWidth() / 2 + d.outerWidth() / 2);
            break;
        case "down":
            this.position.top = d.offset().top + d.outerHeight() + this.params.margin;
            this.position.left = d.offset().left;
            this.params.center && (this.position.left = this.position.left - this.msgbox.outerWidth() / 2 + d.outerWidth() / 2);
            break;
        case "left":
            this.position.top = d.offset().top;
            this.position.left = d.offset().left - this.msgbox.outerWidth() - this.params.margin;
            break;
        case "right":
            this.position.top = d.offset().top, this.position.left = d.offset().left + d.outerWidth() + this.params.margin
        }
        if (!this.checkBound(e)) {
            if (!0 !== f) {
                return this._pos(this.reverseMap[e], !0)
            }
            this.setBound("down");
            this.setBound("left");
            this.position.top -= 10;
            this.position.left += 10
        }
        this.resetBound();
        return this.position
    },
    resetBound: function (e) {
        if (this.params.bound || !0 === e) {
            e = ["up", "down", "left", "right"];
            for (var f = 0; f < e.length; f++) {
                var d = e[f];
                this.checkBound(d) || this.setBound(d)
            }
        }
    },
    checkBound: function (type) {
        switch (type) {
        case "up":
            return this.position.top >= $(window).scrollTop();
        case "down":
            return this.position.top + this.msgbox.outerHeight() <= $(window).height() + $(window).scrollTop();
        case "left":
            return this.position.left >= $(window).scrollLeft();
        case "right":
            return this.position.left + this.msgbox.outerWidth() <= $(window).width() + $(window).scrollLeft();
        default:
            return !0
        }
    },
    setBound: function (type) {
        switch (type) {
        case "up":
            this.position.top = $(window).scrollTop();
            break;
        case "down":
            this.position.top = $(window).height() + $(window).scrollTop() - this.msgbox.outerHeight();
            break;
        case "left":
            this.position.left = $(window).scrollLeft();
            break;
        case "right":
            this.position.left = $(window).width() + $(window).scrollLeft() - this.msgbox.outerWidth()
        }
    }
};
