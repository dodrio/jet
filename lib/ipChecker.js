'use strict';

const fs = require('fs');
const path = require('path');

const debug = require('debug')('jet');

let ipList = [];
const ipListFile = path.join(__dirname, '../rules/ip.list');


function readIpList() {
  return fs.readFileSync(ipListFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank line
      return rx.length;
    })
    .filter(function (rx) { // filter line start with #
      return !rx.startsWith('#');
    });
}


function updateIpList() {
  console.log('Jet: updating ip list...');
  ipList = readIpList();
  debug(ipList);
}


function ipChecker(ip) {
  for (let i in ipList) {
    if (ipList[i] === ip) {
      return true;
    }
  }

  return false;
}


fs.watch(ipListFile, () => {
  updateIpList();
});
updateIpList();


module.exports = ipChecker;
