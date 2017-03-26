function addTitleLink(text, mode) {
    if (mode == "off") return text;
    return text.replace(/(\d+)/g, function (mathchedText, $1, offset, str) {
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
export default addTitleLink;