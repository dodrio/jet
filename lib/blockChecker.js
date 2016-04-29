'use strict';

const fs = require('fs');
const path = require('path');


let blockList = [];
const blockListFile = path.join(__dirname, '../rules/block.list');


function readBlockList() {
  return fs.readFileSync(blockListFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank line
      return rx.length;
    })
    .filter(function (rx) { // filter line start with #
      return !rx.startsWith('#');
    })
    .map(function (rx) { // transfer echo line to a RegExp
      return RegExp(rx);
    });
}


function updateBlockList() {
  console.log('Jet: updating block list...');
  blockList = readBlockList();
}


function blockChecker(hostname) {
  for (let i in blockList) {
    if (blockList[i].test(hostname)) {
      return true;
    }
  }

  return false;
}


fs.watch(blockListFile, () => {
  updateBlockList();
});
updateBlockList();


module.exports = blockChecker;
