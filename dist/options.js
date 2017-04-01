const storageSet = data => new Promise(resolve => chrome.storage.local.set(data, () => resolve()));
const storageGet = keys => new Promise(resolve => chrome.storage.local.get(keys, resolve));
const $ = e => document.querySelector(e);
const $$ = e => document.querySelectorAll(e);
Element.prototype.attr = Element.prototype.getAttribute;
Element.prototype.text = function(str){ return str ? (this.innerText = str) : this.innerText; };
Element.prototype.addClass = function(){ return this.classList.add(...arguments); };
(async() => {
    let options = await storageGet();
    //console.log(options);
    $("#menu_title").text(chrome.i18n.getMessage('extShortName'));
    $("#version").text(chrome.runtime.getManifest().version);
    const resetOptions = () => {
        $$('.button').forEach(e => e.classList.remove('on'));
        $(`div[option="${options.rel_search}"].rel_search`).addClass("on");
        $(`div[option="${options.trackingBlock}"].trackingBlock`).addClass("on");
        $(`div[option="${options.scrollToPlayer}"].scrollToPlayer`).addClass("on");
        $(`div[option="${options.replace}"].replace`).addClass("on");
        $(`div[option="${options.player}"].player`).addClass("on");
        $(`div[option="${options.api}"].api`).addClass("on");
    };
    resetOptions();
    const paseBool = str => {
        switch (str) {
        case 'true':
            return true;
        case 'false':
            return false;
        default:
            return str;
        }
    };
    document.getElementById('options_form').onclick = e => {
        if (!e.target.attr('option')) return;
        options[e.target.classList[1]] = paseBool(e.target.attr('option'));
        storageSet(options).then(() => resetOptions()).then(chrome.runtime.sendMessage({command: 'refreshOptions'}));
    };
})();