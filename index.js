'use strict';

const http = require('http');
const url = require('url');
const net = require('net');

const Socks = require('socks');

// Read china ip into an array.
const lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('tunnel.list')
});

const tunnelList = [];

lineReader.on('line', (line) => {
  tunnelList.push(line);
});

lineReader.on('close', ()=> {
  console.log('Jet: tunnel rule is imported...');
});

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

function tunnelp(hostname) {

  return true;

  for (let i = 0; true; i++) {
    const pattern = tunnelList[i];
    if (pattern === undefined) {
      return false;
    }

    if (pattern === hostname) {
      return true;
    }
  }
}



// Jet
const jet = http.createServer();

// proxy an HTTP request.
jet.on('request', (req, res) => {
  console.log(`● ${req.url}`);

  const hostname = req.headers['host'];
  const port = 80;
  const path = url.parse(req.url).path;
  const method = req.method;
  const headers = req.headers;

  const options = {
    hostname,
    port,
    path,
    method,
    headers,
  };

  options.agent = new Socks.Agent({ proxy },false, false);

  const jetRequest = http.request(options, (proxy_response) => {
    proxy_response.pipe(res);
    res.writeHead(proxy_response.statusCode, proxy_response.headers);
  });

  jetRequest.on('error', (err) => {
    console.log(err.message);
  });

  req.pipe(jetRequest);
});

// proxy an HTTPS requset.
jet.on('connect', (req, cltSocket, head) => {
  const options = url.parse(`https://${req.url}`);

  if (tunnelp(options.hostname)) {
    console.log(`T - ${options.href}`);

    Socks.createConnection({
      proxy,
      target: {
        host: options.hostname,
        port: options.port,
      },
      command: 'connect',
    }, (err, srvSocket, info) => {
      if (err) {
        console.log('Got a error ' + err.message);
      } else {
        cltSocket.write(jetHeader);
        srvSocket.write(head);
        srvSocket.pipe(cltSocket);
        cltSocket.pipe(srvSocket);
      }
    });
  } else {
    console.log(`P - ${options.href}`);
    const srvSocket = net.connect(options.port, options.hostname, () => {
      cltSocket.write(jetHeader);
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
    });
  }
});

// launch jet.
const address = '127.0.0.1';
const port = 9527;
jet.listen(port, address, () => {
  console.log(`Jet: listening on ${address}:${port}...`);
});
