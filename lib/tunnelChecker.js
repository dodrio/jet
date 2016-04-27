'use strict';

const fs = require('fs');
const path = require('path');


let tunnelList = [];
const tunnelListFile = path.join(__dirname, '../rules/tunnel.list');


function readTunnelList() {
  return fs.readFileSync(tunnelListFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank line
      return rx.length;
    })
    .map(function (rx) { // transfer echo line to a RegExp
      return RegExp(rx);
    });
}


function updateTunnelList() {
  console.log('Jet: updating tunnel list...');
  tunnelList = readTunnelList();
}


function tunnelChecker(hostname) {
  for (let i in tunnelList) {
    if (tunnelList[i].test(hostname)) {
      return true;
    }
  }

  return false;
}


fs.watch(tunnelListFile, () => {
  updateTunnelList();
});
updateTunnelList();


module.exports = tunnelChecker;
