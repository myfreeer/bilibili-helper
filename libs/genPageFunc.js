import {sleep, parseSafe, mySendMessage} from './utils';
const docReady = () =>new Promise(r => document.addEventListener( "DOMContentLoaded", r));
const genPageFunc = async(cid, videoInfo, redirectUrl) => {
    let tagList = "";
    let alist = "";
    if (videoInfo && videoInfo.list && videoInfo.list.length > 1) {
        alist += "<select id='dedepagetitles' onchange='location.href=this.options[this.selectedIndex].value;'>";
        alist += videoInfo.list.map(vPart => "<option value='/video/av" + videoInfo.avid + "/index_" + parseSafe(vPart.page) + ".html'>" + parseSafe(vPart.page) + "、" + (vPart.part ? vPart.part : ("P" + parseSafe(vPart.page))) + "</option>").join();
        alist += "</select>";
    }
    if (videoInfo && videoInfo.tag) tagList += videoInfo.tag.split(",").map(tag => '<li><a class="tag-val" href="/tag/' + encodeURIComponent(tag) + '/" title="' + tag + '" target="_blank">' + tag + '</a></li>').join();
    if (!videoInfo.tag) videoInfo.tag = "";
    const template = await fetch(chrome.runtime.getURL("template.html")).then(res => res.text());
    const page = template.replace(/__bl_avid/g, videoInfo.avid).replace(/__bl_page/g, videoInfo.currentPage).replace(/__bl_cid/g, cid).replace(/__bl_tid/g, videoInfo.tid).replace(/__bl_mid/g, videoInfo.mid)
        .replace(/__bl_pic/g, videoInfo.pic).replace(/__bl_title/g, parseSafe(videoInfo.title)).replace(/__bl_sp_title_uri/g, videoInfo.sp_title ? encodeURIComponent(videoInfo.sp_title) : '')
        .replace(/__bl_sp_title/g, videoInfo.sp_title ? parseSafe(videoInfo.sp_title) : '').replace(/__bl_spid/g, videoInfo.spid).replace(/__bl_season_id/g, videoInfo.season_id)
        .replace(/__bl_created_at/g, videoInfo.created_at).replace(/__bl_description/g, parseSafe(videoInfo.description)).replace(/__bl_redirectUrl/g, redirectUrl)
        .replace(/__bl_tags/g, JSON.stringify(videoInfo.tag.split(","))).replace(/__bl_tag_list/g, tagList).replace(/__bl_alist/g, alist).replace(/__bl_bangumi_cover/g, videoInfo.bangumi ? videoInfo.bangumi.cover : '')
        .replace(/__bl_bangumi_desc/g, videoInfo.bangumi ? videoInfo.bangumi.desc : '');
    document.open();
    document.write(page);
    document.close();
    await docReady();
    await sleep(500);
    await mySendMessage({command: "injectCSS"});
    return false;
};
export default genPageFunc;