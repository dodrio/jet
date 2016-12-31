'use strict'

const http = require('http')
const process = require('process')
const net = require('net')
const Socks = require('socks')
const logger = require('./logger')

// Proxy Setting
const proxy = {
  ipaddress: process.env.JET_SOCKS_ADDR || '127.0.0.1',
  port: +process.env.JET_SOCKS_PORT || 1080,
  type: +process.env.JET_SOCKS_TYPE || 5
}

// Jet Header
function jetHeader (httpVersion) {
  return `HTTP/${httpVersion} 200 Connection Established\r\n` +
    'Proxy-agent: Jet Proxy\r\n' +
    '\r\n'
}

function agentHttp (req, res) {
  const {
    hostname,
    port,
    path,
    CNIP
  } = req._url

  const method = req.method
  const headers = req.headers

  const options = {
    hostname,
    port,
    path,
    method,
    headers
  }

  if (CNIP) {
    logger.request(req, 'direct')
  } else {
    logger.request(req, 'tunnel')
    options.agent = new Socks.Agent({ proxy }, false, false)
  }

  const jetRequest = http.request(options, (_res) => {
    _res.pipe(res)
    res.writeHead(_res.statusCode, _res.headers)
  })

  jetRequest.on('error', (err) => {
    logger.erro(err)
  })

  req.pipe(jetRequest)
}

function agentHttps (req, socket, head) {
  const {
    hostname,
    port,
    CNIP
  } = req._url

  if (CNIP) {
    logger.request(req, 'direct')

    const jetSocket = net.connect(port, hostname, () => {
      // tell the client that the connection is established
      socket.write(jetHeader(req.httpVersion))
      jetSocket.write(head)
      // creating pipes in both ends
      jetSocket.pipe(socket)
      socket.pipe(jetSocket)
    })

    jetSocket.on('error', (err) => {
      logger.erro(err)
    })
  } else {
    logger.request(req, 'tunnel')

    Socks.createConnection({
      proxy,
      target: {
        host: hostname,
        port: port
      },
      command: 'connect'
    }, (err, jetSocket, info) => {
      if (err) {
        logger.erro(err)
      } else {
        // tell the client that the connection is established
        socket.write(jetHeader(req.httpVersion))
        jetSocket.write(head)
        // creating pipes in both ends
        jetSocket.pipe(socket)
        socket.pipe(jetSocket)
      }
    })
  }
}

module.exports = {
  http: agentHttp,
  https: agentHttps
}
