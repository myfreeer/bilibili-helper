const parseXmlSafe = text => {
    "use strict";
    text = text.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/ug, "");
    if (window.DOMParser) return (new window.DOMParser()).parseFromString(text, "text/xml");
    else if (ActiveXObject) {
        let activeXObject = new ActiveXObject("Microsoft.XMLDOM");
        activeXObject.async = false;
        activeXObject.loadXML(text);
        return activeXObject;
    } else throw new Error("parseXmlSafe: XML Parser Not Found.");
}
if (typeof module == 'object' && module.exports) module.exports = parseXmlSafe;