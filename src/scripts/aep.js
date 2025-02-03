const readDir = 'src/vendor/aep';
const writeDirIos = 'ios/MySubaru';
const writeDirAndroid = 'android/src/main/assets';

const fileName = 'AEPConfig.json';
const fs = require('fs');

const data = fs.readFileSync(`${readDir}/${fileName}`, 'utf8');

fs.writeFileSync(`${writeDirIos}/${fileName}`, data);
fs.writeFileSync(`${writeDirAndroid}/${fileName}`, data);
