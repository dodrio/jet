'use strict';

const fs = require('fs');
const path = require('path');

const debug = require('debug')('jet');

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


function updateClientList() {
  console.log('Jet: updating client list...');
  clientList = readClientList();
  debug(clientList);
}


function checker(req, connector, next) {
  // connector can be request or socket
  const clientIP = req.connection.remoteAddress;

  for (let i in clientList) {
    if (clientList[i] === clientIP) {
      return next();
    }
  }

  console.log(`Jet: ${clientIP} is not allowed to use this proxy`);

  if (connector.constructor.name === 'IncomingMessage') {
    connector.writeHead(401, { 'Content-Type': 'text/plain' });
    connector.write('Your IP is denied by Jet.');
    connector.end();
  } else if (connector.constructor.name === 'Socket') {
    return;
  }
}

fs.watch(clientListFile, () => {
  updateClientList();
});
updateClientList();


module.exports = checker;
