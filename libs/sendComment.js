const errorCode = ['正常', '选择的弹幕模式错误', '用户被禁止', '系统禁止', '投稿不存在', 'UP主禁止', '权限有误', '视频未审核/未发布', '禁止游客弹幕'];
const sendComment = async(avid, cid, page, commentData) => {
    commentData.cid = cid;
    const comment = Object.keys(commentData).map((key) => encodeURIComponent(key).replace(/%20/g, '+') + '=' + encodeURIComponent(commentData[key]).replace(/%20/g, '+')).join('&');
    try {
        let result = await fetch(`${location.protocol}//interface.bilibili.com/dmpost?cid=${cid}&aid=${avid}&pid=${page}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            credentials: 'include',
            body: comment,
        }).then((res) => res.text());
        result = parseInt(result);
        return result < 0 ? {
            result: false,
            error: errorCode[-result],
        } : {
            result: true,
            id: result,
        };
    } catch (e) {
        return {
            result: false,
            error: e.toString(),
        };
    }
};
export default sendComment;
