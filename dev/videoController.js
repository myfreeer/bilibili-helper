'use strict';
class videoController {
  constructor(opts) {
    this.video = document.createElement('video');
    this.element = document.createElement('div');
    this.element.className = "section speed";
    this.element.titleElement = document.createElement('h3');
    this.element.titleElement.innerText = "视频播放控制";
    this.element.appendChild(this.element.titleElement);
    this.element.pElement = document.createElement('p');
    this.element.appendChild(this.element.pElement);
    this.element.pElement.innerHTML = '<span id="videoController_resolution"></span><a class="b-btn w" id="videoController_mirror">镜像视频</a><br>视频播放速度<input id="videoController_speed" type="number" class="b-input" placeholder="1.0" value=1.0></br>旋转视频<input id="videoController_rotate" type="number" class="b-input" placeholder="0" value=0>';
    let array = ['speed', 'mirror', 'rotate', 'resolution'];
    for (let i in array) this.element[array[i] + 'Controller'] = this.element.querySelector('#videoController_' + array[i]);
    this.element.speedController.step = 0.1;
    this.element.rotateController.step = 90;
    if (opts) this.attach(opts);
    this.element.speedController.addEventListener("change", e => {
      if (Number(e.target.value)) {
        this.video.playbackRate = Number(e.target.value);
        restart(this.video);
      } else {
        e.target.value = 1.0;
        restart(this.video);
      }
    });
    this.element.rotateController.addEventListener("change", function (e) {
      if (Number(e.target.value) % 360 === 0) e.target.value = 0;
      //if (this.element.mirrorController.className==="b-btn") {
      if (document.getElementById('videoController_mirror').className === "b-btn") {
        this.video.style.transform = 'rotate(' + Number(e.target.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
      } else {
        this.video.style.transform = 'rotate(' + Number(e.target.value) + 'deg)';
      }
    });
    this.element.mirrorController.addEventListener("click", function (e) {
      let rotateController = document.getElementById('videoController_rotate');
      if (e.target.className === "b-btn w") {
        this.video.style.transform = 'rotate(' + Number(rotateController.value) + 'deg) matrix(-1, 0, 0, 1, 0, 0)';
        e.target.className = "b-btn";
      } else {
        this.video.style.transform = 'rotate(' + Number(rotateController.value) + 'deg)';
        e.target.className = "b-btn w";
      }
    });
  }
  attach(opts) {
    if (!opts) return false;
    if (opts.video) this.attachVideo(opts.video);
    if (opts.controller) this._attachController(opts.controller);
  }
  _attachController(element) {
    if (!element) return false;
    this.controller = element;
    element.appendChild(this.element);
  }
  _restartVideo(video) {
    if (video.paused) return;
    video.pause();
    video.play();
  }
  attachVideo(element) {
    if (!element) return false;
    this.video = element;
    this.element.mirrorController.video = element;
    this.element.rotateController.video = element;
    element.addEventListener("loadedmetadata", e => document.getElementById('videoController_resolution').innerText = '分辨率: ' + e.target.videoWidth + "x" + e.target.videoHeight);
    if (element.readyState > 0) this.element.resolutionController.innerText = '分辨率: ' + element.videoWidth + "x" + element.videoHeight;
  }
  destroy() {
    this.video = null;
    this.element = null;
    this.controller = null;
  }
  detech() {
    this.video = null;
    this.controller = null;
    this.element.mirrorController.video = null;
    this.element.rotateController.video = null;
  }
  hide() {
    this.element.style.display = 'none';
  }
  show() {
    this.element.style.display = '';
  }
}
if (typeof module == 'object' && module.exports) module.exports = videoController;