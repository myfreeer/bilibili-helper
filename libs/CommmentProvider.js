import {fetchretry, parseXmlSafe} from './utils';

// Fix comments to be valid
const foramtTab = (text) => text.replace(/\t/, '\\t');
// Fix Mode7 comments when they are bad
const formatMode7 = (text) => {
    if (text.charAt(0) === '[') {
        switch (text.charAt(text.length - 1)) {
        case ']':
            return text;
        case '"':
            return text + ']';
        case ',':
            return text.substring(0, text.length - 1) + '"]';
        default:
            return formatMode7(text.substring(0, text.length - 1));
        }
    } else {
        return text;
    }
};

/**
 * Bilibili Format Parser
 * @license MIT License
 * @param {Node} elem - a single xml element containing comment
 * @return {Object} comment
 * Takes in an XMLDoc/LooseXMLDoc and parses that into a Generic Comment List
 **/
const parseSingleComment = (elem) => {
    let params;
    try {
        params = elem.getAttribute('p').split(',');
    } catch (e) {
    // Probably not XML
        return null;
    }
    let text = elem.textContent;
    let comment = {};
    comment.time = params[0];
    comment.stime = Math.round(parseFloat(params[0]) * 1000);
    comment.size = parseInt(params[2]);
    comment.color = parseInt(params[3]);
    comment.mode = parseInt(params[1]);
    comment.date = parseInt(params[4]);
    comment.pool = parseInt(params[5]);
    comment.position = 'absolute';
    if (params[7]) {
        comment.dbid = parseInt(params[7]);
    }
    comment.hash = params[6];
    comment.border = false;
    if (comment.mode < 7) {
        comment.text = text.replace(/(\/n|\\n|\n|\r\n)/g, '\n');
    } else {
        if (comment.mode === 7) {
            try {
                text = foramtTab(formatMode7(text));
                comment.mode7Text = text;
                let extendedParams = JSON.parse(text);
                comment.shadow = true;
                comment.x = parseFloat(extendedParams[0]);
                comment.y = parseFloat(extendedParams[1]);
                if (Math.floor(comment.x) < comment.x || Math.floor(comment.y) < comment.y) {
                    comment.position = 'relative';
                }
                comment.text = extendedParams[4].replace(/(\/n|\\n|\n|\r\n)/g, '\n');
                comment.rZ = 0;
                comment.rY = 0;
                if (extendedParams.length >= 7) {
                    comment.rZ = parseInt(extendedParams[5], 10);
                    comment.rY = parseInt(extendedParams[6], 10);
                }
                comment.motion = [];
                comment.movable = false;
                if (extendedParams.length >= 11) {
                    comment.movable = true;
                    let singleStepDur = 500;
                    let motion = {
                        'x': {
                            'from': comment.x,
                            'to': parseFloat(extendedParams[7]),
                            'dur': singleStepDur,
                            'delay': 0,
                        },
                        'y': {
                            'from': comment.y,
                            'to': parseFloat(extendedParams[8]),
                            'dur': singleStepDur,
                            'delay': 0,
                        },
                    };
                    if (extendedParams[9] !== '') {
                        singleStepDur = parseInt(extendedParams[9], 10);
                        motion.x.dur = singleStepDur;
                        motion.y.dur = singleStepDur;
                    }
                    if (extendedParams[10] !== '') {
                        motion.x.delay = parseInt(extendedParams[10], 10);
                        motion.y.delay = parseInt(extendedParams[10], 10);
                    }
                    if (extendedParams.length > 11) {
                        comment.shadow = (extendedParams[11] !== 'false' && extendedParams[11] !== false);
                        if (extendedParams[12]) {
                            comment.font = extendedParams[12];
                        }
                        if (extendedParams.length > 14) {
              // Support for Bilibili advanced Paths
                            if (comment.position === 'relative') {
                                console.warn('Cannot mix relative and absolute positioning!');
                                comment.position = 'absolute';
                            }
                            let path = extendedParams[14];
                            let lastPoint = {
                                x: motion.x.from,
                                y: motion.y.from,
                            };
                            let pathMotion = [];
                            let regex = new RegExp('([a-zA-Z])\\s*(\\d+)[, ](\\d+)', 'g');
                            let counts = path.split(/[a-zA-Z]/).length - 1;
                            let m = regex.exec(path);
                            while (m !== null) {
                                switch (m[1]) {
                                case 'M':
                                    {
                                        lastPoint.x = parseInt(m[2], 10);
                                        lastPoint.y = parseInt(m[3], 10);
                                    }
                                    break;
                                case 'L':
                                    {
                                        pathMotion.push({
                                            'x': {
                                                'from': lastPoint.x,
                                                'to': parseInt(m[2], 10),
                                                'dur': singleStepDur / counts,
                                                'delay': 0,
                                            },
                                            'y': {
                                                'from': lastPoint.y,
                                                'to': parseInt(m[3], 10),
                                                'dur': singleStepDur / counts,
                                                'delay': 0,
                                            },
                                        });
                                        lastPoint.x = parseInt(m[2], 10);
                                        lastPoint.y = parseInt(m[3], 10);
                                    }
                                    break;
                                }
                                m = regex.exec(path);
                            }
                            motion = null;
                            comment.motion = pathMotion;
                        }
                    }
                    if (motion !== null) {
                        comment.motion.push(motion);
                    }
                }
                comment.dur = 2500;
                if (extendedParams[3] < 12) {
                    comment.dur = extendedParams[3] * 1000;
                }
                let tmp = extendedParams[2].split('-');
                if (tmp && tmp.length > 1) {
                    let alphaFrom = parseFloat(tmp[0]);
                    let alphaTo = parseFloat(tmp[1]);
                    comment.opacity = alphaFrom;
                    if (alphaFrom !== alphaTo) {
                        comment.alpha = {
                            'from': alphaFrom,
                            'to': alphaTo,
                        };
                    }
                }
            } catch (e) {
                console.warn('Error occurred in JSON parsing. Could not parse comment:', text);
            }
        } else if (comment.mode === 8) {
            comment.code = text; // Code comments are special. Treat them that way.
        } else {
            console.warn('Unknown comment type : ' + comment.mode + '. Not doing further parsing.', text);
        }
    }
    if (comment.text !== null && typeof comment.text === 'string') {
        comment.text = comment.text.replace(/\u25a0/g, '\u2588');
    }
    return comment;
};
const serializeCommment = (comment) => `<d p="${comment.time},${comment.mode},${comment.size},${comment.color},${comment.pool},${comment.hash},${comment.dbid}">${comment.code || comment.mode7Text || comment.text}</d>`;

class CommmentProvider {
    constructor(cid) {
        this.dbids = {};
        this.comments = [];
        this.cid = cid;
        this.url = `${location.protocol}//comment.bilibili.com/${cid}.xml`;
    }
    set url(url) {
        this._url = url;
        this.status = this.pushUrl(url);
    }
    get url() {
        return this._url;
    }
    async pushUrl(url) {
        const xml = await fetchretry(url).then((res) => res.text()).then((text) => parseXmlSafe(text));
        const comments = [...xml.getElementsByTagName('d')].map(parseSingleComment);
        this.comments = [...this.comments, ...comments.filter((e) => {
            if (!e.dbid) return true;
            if (this.dbids[e.dbid] !== 1) {
                this.dbids[e.dbid] = 1;
                return true;
            }
        })];
    }
    toString() {
        return decodeURIComponent('%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22UTF-8%22%3F%3E<i><chatserver>chat.bilibili.com</chatserver><chatid>') + this.cid + '</chatid><mission>0</mission><maxlimit>' + this.comments.length + '</maxlimit>\n' + this.comments.map(serializeCommment).join('\n') + '\n</i>';
    }
    get xml() {
        return parseXmlSafe(this.toString());
    }
}

export default CommmentProvider;
