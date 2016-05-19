'use strict';

const http = require('http');

const clientChecker = require('./clientChecker');
const geoipChecker = require('./geoipChecker');
const agent = require('./agent');


// create jet server
const jet = http.createServer();


// proxy an HTTP request.
jet.on('request', (req, res) => {
  clientChecker(req, res, () => {
    geoipChecker(req, (tunnel) => {
      agent.http(tunnel)(req, res);
    });
  });
});


// proxy an HTTPS requset.
jet.on('connect', (req, socket, head) => {
  clientChecker(req, socket, () => {
    geoipChecker(req, (tunnel) => {
      agent.https(tunnel)(req, socket, head);
    });
  });
});


module.exports = jet;
