import {parseSafe, parseTime, $h, unsafeEval} from './utils';
import commentSenderQuery from './commentSenderQuery';

const commentQuerySection = (comments, element) => {
    let control = $h('<div><input type="text" class="b-input" placeholder="根据关键词筛选弹幕"><select class="list"><option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option></select><span class="result">选择弹幕查看发送者…</span></div>');
    control.find('.b-input').onkeyup = e => {
        const keyword = control.find('input').value,
            regex = new RegExp(parseSafe(keyword), 'gi');
        control.find('select.list').html('<option disabled="disabled" class="disabled" selected="selected">请选择需要查询的弹幕</option>');
        for (let node of comments){
            let text = node.childNodes[0];
            if (text && node && regex.test(text.nodeValue)) {
                text = text.nodeValue;
                const commentData = node.getAttribute('p').split(','),
    	                        sender = commentData[6],
    	                        time = parseTime(parseInt(commentData[0]) * 1000);
    	        let option = $h(`<option sender=${sender}></option>`);
    	        option.sender = sender;
    	        option.html('[' + time + '] ' + (keyword.trim() === '' ? parseSafe(text) : parseSafe(text).replace(regex, kw => '<span class="kw">' + kw + '</span>')));
    	        control.find('select.list').append(option);
    	    }
        }
    };
    control.find('.b-input').onkeyup();
    const displayUserInfo = (mid, data) => {
        if (!mid) return control.find('.result').text('查询失败');
        control.find('.result').html('发送者: <a href="http://space.bilibili.com/' + mid + '" target="_blank" card="' + parseSafe(data.name) + '" mid="' + mid + '">' + parseSafe(data.name) + '</a><div target="_blank" class="user-info-level l' + parseSafe(data.level_info.current_level) + '"></div>');
        unsafeEval('UserCard.bind($("#bilibili_helper .query .result"));');
    };

    const _selectList = control.find('select.list');
    _selectList.style.maxWidth = '272px';
    _selectList.style.borderRadius = '3px';
    _selectList.style.height = '25px';
    _selectList.onchange = e => {
        const sender = _selectList.selectedOptions[0].sender;
        control.find('.result').text('查询中…');
        if (sender.indexOf('D') == 0) return control.find('.result').text('游客弹幕');
        commentSenderQuery(sender).then(data => displayUserInfo(data.mid,data));
    };
    element.empty().append(control);
};
export default commentQuerySection;