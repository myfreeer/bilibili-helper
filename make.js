const path = require('path');
const process = require('process');
const fs = require('fs');
const webpack = require('webpack');
const config = {
    entry: path.resolve('libs/content_scripts.js'),
    output: {
        path: path.resolve('dist'),
        filename: 'content_scripts.js',
    },
};
const callback = (err, stats) => {
    if (err) console.warn(err);
    if (stats) console.log(stats);
    fs.unlinkSync('libs/crc32.js');
};
const copyFileSync = (sourceFile, targetFile) => fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
if (process.argv.length > 2 && process.argv[2] === 'gpl') copyFileSync('libs/crc32-gpl.js', 'libs/crc32.js');
else copyFileSync('libs/crc32-nogpl.js', 'libs/crc32.js');

webpack(config).run(callback);
