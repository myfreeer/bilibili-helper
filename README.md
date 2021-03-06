# bilibili-helper

An auxiliary extension for Bilibili (bilibili.com) which allows users to bypass playback restrictions, replace video players and use shortcuts.

哔哩哔哩 (bilibili.com) 辅助工具，可以替换播放器、去广告、推送通知并进行一些快捷操作。

## Release
[![Latest Release](https://img.shields.io/github/release/myfreeer/bilibili-helper.svg)](https://github.com/myfreeer/bilibili-helper/releases/latest)
[![Download](https://img.shields.io/github/downloads/myfreeer/bilibili-helper/total.svg)](https://github.com/myfreeer/bilibili-helper/releases)

## License
[![GitHub license](https://img.shields.io/github/license/myfreeer/bilibili-helper.svg)](LICENSE) 

Especially, the file `libs/crc32-gpl.js` and any build including this file would be licensed as `GPL v3` as it has used code from [bilibili_danmaku_AntiAnonym](https://github.com/MoePus/bilibili_danmaku_AntiAnonym) project.

## Build
### Requirements
* nodejs
* webpack

### Regular Build
```
npm install webpack
node make
```

### GPL Build
The GPL Build uses file `libs/crc32-gpl.js` to resolve comment-sender hash to user-id locally, but this file requires `GPL v3` license.
```
npm install webpack
node make gpl
```

## Credits
- https://github.com/zacyu/bilibili-helper (MIT license)
- https://github.com/soimort/you-get (MIT license)
- https://github.com/rg3/youtube-dl (Unlicense)
- https://github.com/zacyu/ABPlayerHTML5-bilibili-ver (MIT License)
- https://github.com/jabbany/CommentCoreLibrary (MIT License)
- https://github.com/blueimp/JavaScript-MD5 (MIT License)
- https://github.com/SheetJS/js-crc32 (Apache License 2.0)
- https://github.com/NightlyFantasy/Bili_Fix_Player (MIT License)
- https://github.com/nareix/mama-hd (MIT license)
- https://github.com/tiansh/us-danmaku
- https://github.com/parshap/node-sanitize-filename (WTFPL and ISC licenses)
- https://github.com/MoePus/bilibili_danmaku_AntiAnonym (GPL v3)
