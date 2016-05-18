'use strict';

const http = require('http');
const url = require('url');
const net = require('net');
const Socks = require('socks');

const logger = require('./logger');
const errorHandler = require('./errorHandler');

// Proxy Setting
const proxy = {
  ipaddress: '127.0.0.1',
  port: 1080,
  type: 5,
};


// Jet Header
function genJetHeader(httpVersion) {
  return `HTTP/${httpVersion} 200 Connection Established\r\n` +
    'Proxy-agent: Jet Proxy\r\n' +
    '\r\n';
}

function httpDeny(response, msg) {
  const body = msg;
  response.writeHead(401, { 'Content-Type': 'text/plain' });
  response.write(body);
  response.end();
}


function agentHttp(tunnelFlag = false) {
  return function (req, res) {
    const _url = url.parse(req.url);
    const hostname = _url.hostname;
    const port = _url.port;
    const path = _url.path;
    const method = req.method;
    const headers = req.headers;

    const options = {
      hostname,
      port,
      path,
      method,
      headers,
    };

    if (tunnelFlag) {
      logger.request(req, 'tunnel');
      options.agent = new Socks.Agent({ proxy }, false, false);
    } else {
      logger.request(req);
    }

    const jetRequest = http.request(options, (_res) => {
      _res.pipe(res);
      res.writeHead(_res.statusCode, _res.headers);
    });

    jetRequest.on('error', (err) => {
      errorHandler(err);
    });

    req.pipe(jetRequest);
  };
}

function agentHttps(tunnelFlag = false) {
  return function (req, socket, head) {
    const _url = url.parse(`https://${req.url}`);
    const hostname = _url.hostname;

    const port = _url.port;

    if (tunnelFlag) {
      logger.request(req, 'tunnel');

      Socks.createConnection({
        proxy,
        target: {
          host: hostname,
          port: port,
        },
        command: 'connect',
      }, (err, jetSocket, info) => {
        if (err) {
          errorHandler(err);
        } else {
          // tell the client that the connection is established
          socket.write(genJetHeader(req.httpVersion));
          jetSocket.write(head);
          // creating pipes in both ends
          jetSocket.pipe(socket);
          socket.pipe(jetSocket);
        }
      });
    } else {
      logger.request(req);

      const jetSocket = net.connect(port, hostname, () => {
        // tell the client that the connection is established
        socket.write(genJetHeader(req.httpVersion));
        jetSocket.write(head);
        // creating pipes in both ends
        jetSocket.pipe(socket);
        socket.pipe(jetSocket);
      });

      jetSocket.on('error', (err) => {
        errorHandler(err);
      });
    }
  };
}

module.exports = {
  http: agentHttp,
  https: agentHttps,
};
