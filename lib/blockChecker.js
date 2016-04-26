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
    .map(function (rx) { // transfer echo line to a RegExp
      return RegExp(rx);
    });
}


function updateBlockList() {
  console.log('Jet: updating block list...');
  blockList = readBlockList();
}


blockList = readBlockList();
fs.watch(blockListFile, () => {
  updateBlockList();
});


function blockChecker(req, res) {
  for (let i in blockList) {
    if (blockList[i].test(req.url)) {
      console.log(`Jet: block ${req.method} ${req.url}`);
      res.end('Jet block it');
      return;
    }
  }
}

module.exports = blockChecker;
