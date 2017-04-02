// adapted from https://github.com/parshap/node-sanitize-filename/blob/master/index.js
// remove node "Buffer" to work in browser.
'use strict';
/**
 * Replaces characters in strings that are illegal/unsafe for filenames.
 * Unsafe characters are either removed or replaced by a substitute set
 * in the optional `options` object.
 *
 * Illegal Characters on Various Operating Systems
 * / ? < > \ : * | "
 * https://kb.acronis.com/content/39790
 *
 * Unicode Control codes
 * C0 0x00-0x1f & C1 (0x80-0x9f)
 * http://en.wikipedia.org/wiki/C0_and_C1_control_codes
 *
 * Reserved filenames on Unix-based systems (".", "..")
 * Reserved filenames in Windows ("CON", "PRN", "AUX", "NUL", "COM1",
 * "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
 * "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", and
 * "LPT9") case-insesitively and with or without filename extensions.
 *
 * Capped at 255 characters in length.
 * http://unix.stackexchange.com/questions/32795/what-is-the-maximum-allowed-filename-and-folder-size-with-ecryptfs
 *
 * @param  {String} input   Original filename
 * @param  {Object} options {replacement: String, max: Number(<255)}
 * @return {String}         Sanitized filename
 */

// http://stackoverflow.com/questions/30960190/problematic-characters-for-filename-in-chrome-downloads-download
// Despite "~" is totally valid in filenames, Chrome thinks otherwise.
// so add "~" to illegalRe.
//
// TODO Through my own tests, I find actually Chrome can sanitize the file path
// automatically but there are no API found for it though?
const illegalRe = /[\/\?<>\\:\*\|":~]/g;
const controlRe = /[\x00-\x1f\x80-\x9f]/g;
const reservedRe = /^\.+$/;
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

// Truncate string by size in bytes
function truncate(str, maxByteSize) {
    let strLen = str.length,
        curByteSize = 0,
        codePoint = -1;

    for (let i = 0; i < strLen; i++) {
        codePoint = str.charCodeAt(i);

        // handle 4-byte non-BMP chars
        // low surrogate
        if (codePoint >= 0xdc00 && codePoint <= 0xdfff) {
            // when parsing previous hi-surrogate, 3 is added to curByteSize
            curByteSize++;
            if (curByteSize > maxByteSize) {
                return str.substring(0, i - 1);
            }
            continue;
        }

        if (codePoint <= 0x7f) {
            curByteSize++;
        } else if (codePoint >= 0x80 && codePoint <= 0x7ff) {
            curByteSize += 2;
        } else if (codePoint >= 0x800 && codePoint <= 0xffff) {
            curByteSize += 3;
        }

        if (curByteSize > maxByteSize) {
            return str.substring(0, i);
        }
    }

    // never exceeds the upper limit
    return str;
}

function sanitize(input, replacement, max) {
    const sanitized = input
        .replace(illegalRe, replacement)
        .replace(controlRe, replacement)
        .replace(reservedRe, replacement)
        .replace(windowsReservedRe, replacement);
    return truncate(sanitized, max);
}

let filenameSanitize = function(input, options) {
    const replacement = (options && options.replacement) || '';
    const max = (options && options.max && (options.max < 255)) ? options.max : 255;
    const output = sanitize(input, replacement, max);
    if (replacement === '') {
        return output;
    }
    return sanitize(output, '');
};

export function getNiceSectionFilename(avid, page, totalPage, idx, numParts, videoInfo) {
    // TODO inspect the page to get better section name
    let idName = 'av' + avid,
        // page/part name is only shown when there are more than one pages/parts
        pageIdName = (totalPage && (totalPage > 1)) ? ('p' + page) : '',
        pageName = '',
        partIdName = (numParts && (numParts > 1)) ? ('' + idx) : '';

    // try to find a good page name
    if (pageIdName) {
        pageName = videoInfo.list[page - 1].part;
        pageName = pageName.substr(pageName.indexOf('、') + 1);
        if (!partIdName) document.title = pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName;
        return partIdName ? pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName + '_' + partIdName : pageName + '_' + videoInfo.title + '_' + idName + '_' + pageIdName;
    }
    if (!partIdName) document.title = videoInfo.title + '_' + idName;
    // document.title contains other info feeling too much
    return partIdName ? videoInfo.title + '_' + idName + '_' + partIdName : videoInfo.title + '_' + idName;
}

// Helper function, return object {url, filename}, options object used by
// "chrome.downloads.download"
export function getDownloadOptions(url, filename) {
    // TODO Improve file extension determination process.
    //
    // Parsing the url should be ok in most cases, but the best way should
    // use MIME types and tentative file names returned by server. Not
    // feasible at this stage.
    let resFn = null,
        fileBaseName = url.split(/[\\/]/).pop().split('?')[0],
        // arbitrarily default to "mp4" for no better reason...
        fileExt = fileBaseName.match(/[.]/) ? fileBaseName.match(/[^.]+$/) : 'mp4';

    // file extension auto conversion.
    //
    // Some sources are known to give weird file extensions, do our best to
    // convert them.
    switch (fileExt) {
    case 'letv':
        fileExt = 'flv';
        break;
    default:
         // remain the same, nothing
    }

    resFn = filenameSanitize(filename, {
        replacement: '_',
        max: 255 - fileExt.length - 1,
    }) + '.' + fileExt;

    return {
        'url': url,
        'filename': resFn,
    };
}
