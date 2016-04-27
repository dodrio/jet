'use strict';

const fs = require('fs');
const path = require('path');


let tunnelList = [];
const tunnelListFile = path.join(__dirname, '../rules/tunnel.list');


function readBlockList() {
  return fs.readFileSync(tunnelListFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank line
      return rx.length;
    })
    .map(function (rx) { // transfer echo line to a RegExp
      return RegExp(rx);
    });
}


function updateBlockList() {
  console.log('Jet: updating block list...');
  tunnelList = readBlockList();
}


tunnelList = readBlockList();
fs.watch(tunnelListFile, () => {
  updateBlockList();
});


function tunnelChecker(hostname) {
  for (let i in tunnelList) {
    if (tunnelList[i].test(hostname)) {
      return true;
    }
  }

  return false;
}

module.exports = tunnelChecker;
