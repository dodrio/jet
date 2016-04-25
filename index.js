'use strict';

const http = require('http');
const url = require('url');
const Socks = require('socks');

const proxy = {
  ipaddress: '127.0.0.1',
  port: 1080,
  type: 5,
};

const jet = http.createServer((req, res) => {
  console.log(req.url);
  const options = url.parse(req.url);

  const socksAgent = new Socks.Agent({ proxy },false, false);
  options.agent = socksAgent;
  http.get(options, (_res) => {
    _res.pipe(res);
  }).on('error', (err) => {
    console.log(err.message);
  });
});

jet.on('connect', (req, cltSocket, head) => {
  const _url = `https://${req.url}`;
  console.log(_url);

  const srvUrl = url.parse(_url);
  Socks.createConnection({
    proxy,
    target: {
      host: srvUrl.hostname,
      port: srvUrl.port,
    },
    command: 'connect',
  }, (err, srvSocket, info) => {
    if (err) {
      console.log('Got a error ' + err.message);
    } else {
      cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                      'Proxy-agent: Jet Proxy\r\n' +
                      '\r\n');
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    }
  });
});

const address = '127.0.0.1';
const port = 9527;
jet.listen(port, address, () => {
  console.log(`Jet is listening on ${address}:${port}...`);
});
