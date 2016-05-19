'use strict';

const url = require('url');
const colors = require('colors');


function request(req, type) {
  // const log = `● ${req.connection.remoteAddress}:${req.method} ${req.url}`;
  const log = `● ${req.connection.remoteAddress}:${req.method} ${req.headers.host}`;

  if (type === 'tunnel') {
    console.log(log.yellow);
  } else if (type === 'block') {
    console.log(log.red);
  } else {
    console.log(log.green);
  }
};

function info(log) {
  console.log(`[INFO] ${log}`.cyan);
}


function erro(log) {
  console.log(`[ERRO] ${log}`.yellow);
}


module.exports = {
  request,
  info,
  erro,
};
