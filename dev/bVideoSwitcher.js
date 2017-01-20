var COMMONJS = typeof module == 'object' && module.exports;

class bVideoSwitcher {
	constructor(opts){
//Object:opts {lowResLink,mp4Link,mediaDataSource,video,avid,cid,page,videoController,switcherElement,videoPic,comment}
		if(!opts) throw new Error('bVideoSwitcher: opts required');
		for (let i in opts) this[i] = opts[i];
		for (let i of ['lowResLink','mp4Link','mediaDataSource','video','avid','cid','page','videoController','switcherElement','videoPic']) if (!this[i]) throw new Error('bVideoSwitcher: opts.'+i+'not found');
		localStorage.removeItem('defaulth5');
		this.current = "original";
		this.flvPlayer= flvjs.createPlayer(this.mediaDataSource);
		if (!this.comment) this.comment = 'http://comment.bilibili.com/' + biliHelper.cid + '.xml';
	}
	changeComment(comment,type = this.current){
		if(!comment)return false;
		this.comment = comment;
		this.Switch(this.current,comment,this);
	}
	_set(type=this.current,element = this.switcherElement){
		
	}
	Switch(type = this.current,comment = this.comment,root=this){
		if (type !== this.current) 
		this.current = type;
		this.videoController.detech();
		this.videoController.hide();
		switch (type){
			case 'original'
	}
}