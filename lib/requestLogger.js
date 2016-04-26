'use strict';

const colors = require('colors');

module.exports = function requestLogger(req, tunnelp) {
  const log = `● ${req.connection.remoteAddress}:${req.method} ${req.url}`;

  if (tunnelp === true) {
    console.log(log.yellow);
  } else {
    console.log(log.green);
  }
};
