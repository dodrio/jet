'use strict';

const http = require('http');
const url = require('url');
const net = require('net');
const Socks = require('socks');

const requestLogger = require('./requestLogger');
const tunnelChecker = require('./tunnelChecker');
const blockChecker = require('./blockChecker');
const errorHandler = require('./errorHandler');


// Proxy Setting
const proxy = {
  ipaddress: '127.0.0.1',
  port: 1080,
  type: 5,
};


// Jet Header
const jetHeader = 'HTTP/1.1 200 Connection Established\r\n' +
        'Proxy-agent: Jet Proxy\r\n' +
        '\r\n';


// Jet block response
const jetBlockBody = `

                                         _|              _|
                                         _|    _|_|    _|_|_|_|
                                         _|  _|_|_|_|    _|
                                   _|    _|  _|          _|
                                     _|_|      _|_|_|      _|_|


                                    This site is blocked by Jet.
`;


// Jet
const jet = http.createServer();


// proxy an HTTP request.
jet.on('request', (req, res) => {
  const _url = url.parse(req.url);

  const hostname = _url.hostname;

  if (blockChecker(hostname)) {
    requestLogger(req, 'block');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(jetBlockBody);
    res.end();
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
  const _url = url.parse(`https://${req.url}`);
  const hostname = _url.hostname;

  if (blockChecker(hostname)) {
    // How to give the blocked site a response?
    requestLogger(req, 'block');
    socket.write(jetHeader);
    socket.write('Content-Type: text/plain\r\n');
    socket.end(jetBlockBody);
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
        socket.write(jetHeader);
        jetSocket.write(head);
        jetSocket.pipe(socket);
        socket.pipe(jetSocket);
      }
    });
  } else {
    requestLogger(req);

    const jetSocket = net.connect(port, hostname, () => {
      socket.write(jetHeader);
      jetSocket.write(head);
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
