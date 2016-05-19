'use strict';

const fs = require('fs');
const path = require('path');

const debug = require('debug')('jet');

const logger = require('./logger');


let clientList = [];
const clientListFile = path.join(__dirname, '../rules/client.list');


function readClientList() {
  return fs.readFileSync(clientListFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank line
      return rx.length;
    })
    .filter(function (rx) { // filter line start with #
      return !rx.startsWith('#');
    });
}


function update() {
  logger.info('Reading Client List...');
  clientList = readClientList();
}


function checker(req, connector, next) {
  // connector can be request or socket
  const clientIP = req.connection.remoteAddress;

  for (let i in clientList) {
    if (clientList[i] === clientIP) {
      return next();
    }
  }

  logger.info(`${clientIP} is not a allowed client`);

  if (connector.constructor.name === 'IncomingMessage') {
    connector.writeHead(401, { 'Content-Type': 'text/plain' });
    connector.write('Your IP is denied by Jet.');
    connector.end();
  } else if (connector.constructor.name === 'Socket') {
    return;
  }
}


fs.watch(clientListFile, () => {
  update();
});
update();


module.exports = checker;
