import {fetchretry} from './utils';

const commentsHistorySection = async(cid, element, changeComments) => {
    let _rolldate = fetchretry(`${location.protocol}//comment.bilibili.com/rolldate,${cid}`).then(res => res.json());
    let dmrollUI = document.createElement('select');
    dmrollUI.style.cssText = 'max-width: 272px;height: 25px;border-radius: 4px;';
    let rolldate;
    try {
        rolldate = await _rolldate;
    } catch (e) {
        return e
    }
    let date = new Date();
    dmrollUI.innerHTML = `<option value="${location.protocol}//comment.bilibili.com/${cid}.xml" selected="selected">历史弹幕：现在</option>` + rolldate.map(e => `<option value="${location.protocol + '//comment.bilibili.com/dmroll,' + e.timestamp + ',' + cid}">历史弹幕：${(date.setTime(parseInt(e.timestamp) * 1000, 10)) && date.toLocaleDateString()}，新增${e.new}条</option>`).join('');
    dmrollUI.onchange = event => changeComments(dmrollUI.selectedOptions[0].value);
    element.empty().appendChild(dmrollUI);
    return true;
};
export default commentsHistorySection;