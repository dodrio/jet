'use strict';

const http = require('http');
const url = require('url');
const net = require('net');
const Socks = require('socks');

const requestLogger = require('./requestLogger');
const errorHandler = require('./errorHandler');
const tunnelChecker = require('./tunnelChecker');
const blockChecker = require('./blockChecker');
const ipChecker = require('./ipChecker');


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
  const body = `

                                         _|              _|
                                         _|    _|_|    _|_|_|_|
                                         _|  _|_|_|_|    _|
                                   _|    _|  _|          _|
                                     _|_|      _|_|_|      _|_|


                                    ${msg}

`;
  response.writeHead(401, { 'Content-Type': 'text/plain' });
  response.write(body);
  response.end();
}


// Jet
const jet = http.createServer();


// proxy an HTTP request.
jet.on('request', (req, res) => {
  console.log(req.httpVersion);
  const srcIp = req.connection.remoteAddress;

  if (!ipChecker(srcIp)) {
    console.log(`Jet: ${srcIp} is not allowed to use this proxy`);
    httpDeny(res, 'Your IP is denied by Jet.');
    return;
  }

  const _url = url.parse(req.url);

  const hostname = _url.hostname;

  if (blockChecker(hostname)) {
    requestLogger(req, 'block');
    httpDeny(res, 'This site is blocked by Jet.');
    return;
  }

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

  if (tunnelChecker(hostname)) {
    requestLogger(req, 'tunnel');
    options.agent = new Socks.Agent({ proxy },false, false);
  } else {
    requestLogger(req);
  }

  const jetRequest = http.request(options, (_res) => {
    _res.pipe(res);
    res.writeHead(_res.statusCode, _res.headers);
  });

  jetRequest.on('error', (err) => {
    errorHandler(err);
  });

  req.pipe(jetRequest);
});


// proxy an HTTPS requset.
jet.on('connect', (req, socket, head) => {
  const srcIp = req.connection.remoteAddress;

  if (!ipChecker(srcIp)) {
    console.log(`Jet: ${srcIp} is not allowed to use this proxy`);
    // How to give the denied ip a response?
    return;
  }

  const _url = url.parse(`https://${req.url}`);
  const hostname = _url.hostname;

  if (blockChecker(hostname)) {
    requestLogger(req, 'block');
    // How to give the blocked site a response?
    return;
  }

  const port = _url.port;

  if (tunnelChecker(hostname)) {
    requestLogger(req, 'tunnel');

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
    requestLogger(req);

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
});


// export jet
module.exports = jet;
