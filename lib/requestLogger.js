'use strict';

const colors = require('colors');

module.exports = function requestLogger(req, type) {
  const log = `● ${req.connection.remoteAddress}:${req.method} ${req.url}`;

  if (type === 'tunnel') {
    console.log(log.yellow);
  } else if (type === 'block') {
    console.log(log.red);
  } else {
    console.log(log.green);
  }
};
