var COMMONJS = typeof module == 'object' && module.exports;
if (COMMONJS) {
    var {DOMParser,XMLSerializer} = require('./dom-parser');
    var fetch = require('./fetchretry');
    var fs = require('fs');
    var sanitize = require("./filename-sanitize");
}
'use strict';
class CommentsInHistory {
    constructor() {
        this.xmltext = '';
        this.commentsAll = [];
        this.dbids = {};
    }
    array(obj) {
        return Array.prototype.slice.call(obj);
    }
    serialize(xmldom) {
        return (new XMLSerializer()).serializeToString(xmldom);
    }
    parseXML(text) {
        text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, "");
        return (new DOMParser()).parseFromString(text, "text/xml");
    }
    getResult() {
        return decodeURIComponent("%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>") + this.cid + "</chatid><mission>0</mission><maxlimit>" + this.commentsAll.length + "</maxlimit>\n" + this.commentsAll.join('\n') + "\n</i>";
    }
    toString() {
        return this.getResult()
    }
    clear() {
        this.commentsAll = [];
        this.dbids = {};
    }
    add(string) {
        let response = this.parseXML(string);
        if (this.cid && this.cid !== this.array(response.getElementsByTagName('chatid')).reduce(e => e).textContent) {
            console.warn('CommentsInHistory: cid not match, continue.');
            this.ERROR_CID_NOT_MATCH = 1;
        }
        if (!this.cid) this.cid = this.array(response.getElementsByTagName('chatid')).reduce(e => e).textContent;
        let comments = response.getElementsByTagName('d');
        this.commentsAll = [...this.commentsAll, ...this.array(comments).filter(e => {
            let opt = e.getAttribute('p');
            if (!opt) return true;
            opt = opt.split(',');
            let dbid = parseInt(opt[7], 10);
            if (!dbid) return true;
            if (this.dbids[dbid] !== 1) {
                this.dbids[dbid] = 1;
                return true;
            }
        }).map(this.serialize)];
    }
}

//resolvePromiseArrayWait: https://gist.github.com/myfreeer/019ce116d241a0ec640db0f412e2c741
function resolvePromiseArrayWait(array, myPromise, timeout = 0, retries = 0) {
    return new Promise((resolve, reject) => {
        let resultArray = [];
        let resolver = index => setTimeout(() => myResolver(index), timeout);
        let fails = (index, e) => array[index + 1] ? console.warn('resolvePromiseArrayWait: index', index, 'failed! ', ', target:', array[index], ', error:', e, ',continue to next.', resolver(++index)) : console.warn('resolvePromiseArrayWait: index', index, 'failed! ', 'target:', array[index], ', error:', e, ', process done.', resolve(resultArray));
        let myResolver = index => myPromise(array[index]).then(result => resultArray[index] = (result)).then(e => typeof (array[++index]) === "undefined" ? resolve(resultArray) : resolver(index)).catch(e => retries-- > 0 ? resolver(index) : fails(index, e));
        myResolver(0);
    });
}

function getAllCommentsinHistory(cid) {
    if (!cid) return false;
    console.time('mergeAllCommentsinHistory:' + cid);
    if (typeof cid === 'string') cid = cid.match(/(\d){3,}/)[0];
    var rolldate = "http://comment.bilibili.com/rolldate," + cid;
    var dmroll = ['http://comment.bilibili.com/' + cid + '.xml'];
    var count = 0;
    var cmts = new CommentsInHistory();
    let checkCount = (count, array) => {
        if (count < array.length) return;
        let xmltext = cmts.getResult();
        console.timeEnd('mergeAllCommentsinHistory:' + cid);
        return xmltext;
    };
    return fetch(rolldate).then(res => res.json().then(json => {
        for (let i in json)
            if (json[i].timestamp) dmroll.push('http://comment.bilibili.com/dmroll,' + json[i].timestamp + ',' + cid);
        return Promise.all(dmroll.map((url, index) => fetch(index % 2 ? url.replace('http\:\/\/', 'https\:\/\/') : url, {'timeout': 15*1000}).then(res => res.text()).then(res => {
            cmts.add(res);
            console.log(cid,': finished:',index,'of',dmroll.length,dmroll.length - count,'left');
            return checkCount(++count, dmroll);
        }).catch(e => checkCount(++count, dmroll)))).then(array => array.filter(e => e === 0 || e).reduce(e => e));
    }));
}

if (COMMONJS) {
    function mergeComments() {
        if (!arguments) return !1;
        if (!arguments.length) return !1;
        var cmts = new CommentsInHistory();
        for (let i in arguments) {
            let data = fs.readFileSync(arguments[i], 'utf8'); /*, function(err, data) {*/
            if (!data) {
                console.log('readFileSync Failed: ' + arguments[i]);
                continue;
            }
            console.log('fs readFile OK: ' + arguments[i]);
            cmts.add(data);
        }
        return cmts.getResult();
    }

    function save(data, filename) {
        return fs.writeFileSync(filename, data);
    }

    function getFilesizeInBytes(filename) {
        var stats = fs.statSync(filename)
        var fileSizeInBytes = stats["size"]
        return fileSizeInBytes
    }

    function update(file) {
        console.time('update: ' + file);
        var cmts = new CommentsInHistory();
        let data = fs.readFileSync(file, 'utf8');
        if (!data) return console.log('readFileSync Failed: ' + file);
        console.log('fs readFile OK: ' + file);
        cmts.add(data);
        if (cmts.cid) fetch('http://comment.bilibili.com/' + cmts.cid + '.xml').then(res => res.text()).then(text => {
            cmts.add(text);
            save(cmts.getResult(), file + '_updated.xml');
            console.timeEnd('update: ' + file);
            if (getFilesizeInBytes(file + '_updated.xml') > getFilesizeInBytes(file)) {
            	fs.renameSync(file, file + '_old.xml');
            	fs.renameSync(file + '_updated.xml', file);
            	if (fs.existsSync(file + '_old.xml') && !cmts.ERROR_CID_NOT_MATCH) fs.unlinkSync(file + '_old.xml');
            	return console.log('new file saved to : ' + file);
            }
            console.log('new file saved to : ' + file + '_updated.xml');
        });
    }

    function updateAll(file) {
        console.time('update: ' + file);
        var cmts = new CommentsInHistory();
        let data = fs.readFileSync(file, 'utf8');
        if (!data) return console.log('readFileSync Failed: ' + file);
        console.log('fs readFile OK: ' + file);
        cmts.add(data);
        if (cmts.cid) getAllCommentsinHistory(cmts.cid).then(text => {
            cmts.add(text);
            save(cmts.getResult(), file + '_updated.xml');
            console.timeEnd('update: ' + file);
            if (getFilesizeInBytes(file + '_updated.xml') > getFilesizeInBytes(file)) {
            	fs.renameSync(file, file + '_old.xml');
            	fs.renameSync(file + '_updated.xml', file);
            	if (fs.existsSync(file + '_old.xml') && !cmts.ERROR_CID_NOT_MATCH) fs.unlinkSync(file + '_old.xml');
            	return console.log('new file saved to : ' + file);
            }
            console.log('new file saved to : ' + file + '_updated.xml');
        });
    }

    function batchGetAllCommentsinHistory(avid, url) {
        if (typeof avid === 'string') avid = Number(avid.match(/(\d{3,})/)[0]);
        url = url || "https://api.bilibili.com/view?type=json&appkey=8e9fc618fbd41e28&id=" + avid + "&page=1&batch=true";
        console.log(avid,url);
        var myPromise;
        return fetch(url).then(res => res.json()).then(json => {
            if (!json.list && !url.match('bilibilijj.com')) return batchGetAllCommentsinHistory(avid, 'http://www.bilibilijj.com/Api/AvToCid/' + avid);
            if (url.match('bilibilijj.com') && json.list.length === 0) return false;
            if (url.match('api.bilibili.com/view')) {
                myPromise = e => new Promise((resolve, reject) => {
                    let filename = sanitize(e.part && e.part.length > 0 ? e.page + '、' + e.part + '.av' + avid + '_' + e.cid + '.full.xml' : e.page + '、' + json.title + '.av' + avid + '_' + e.cid + '.full.xml');
                    let j = getAllCommentsinHistory(e.cid);
                    j.then(str => save(str, filename)).then(e => resolve()); //using resolve(e) here may increase memory cost.
                });
            } else if (url.match('bilibilijj.com/Api/AvToCid/')) {
                myPromise = e => new Promise((resolve, reject) => {
                    let j = getAllCommentsinHistory(e.CID);
                    j.then(str => save(str, sanitize(e.P + '、' + e.Title + '.av' + avid + '_' + e.CID + '.full.xml'))).then(e => resolve());
                });
            }
            return resolvePromiseArrayWait(json.list, myPromise, 500);
        }).catch(console.log);
    }

    module.exports.get = getAllCommentsinHistory;
    module.exports.batch = batchGetAllCommentsinHistory;
    module.exports.merge = mergeComments;
    module.exports.save = save;
    module.exports.update = update;
    module.exports.updateAll = updateAll;
}
