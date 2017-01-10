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

function agentHttp (req, res, next) {
  const {
    hostname,
    port,
    path,
    direct
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

  if (direct) {
    logger.request(req, 'direct')
  } else {
    logger.request(req, 'tunnel')
    options.agent = new Socks.Agent({ proxy }, false, false)
  }

  const _req = http.request(options, (_res) => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res)
  })

  _req.on('error', (err) => {
    return next(err)
  })

  _req.end()
}

function agentHttps (req, socket, head, next) {
  const {
    hostname,
    port,
    direct
  } = req._url

  if (direct) {
    logger.request(req, 'direct')

    const _socket = net.connect(port, hostname, () => {
      // tell the client that the connection is established
      socket.write(jetHeader(req.httpVersion))
      _socket.write(head)
      // creating pipes in both ends
      _socket.pipe(socket)
      socket.pipe(_socket)
    })

    _socket.on('error', (err) => {
      return next(err)
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
    }, (err, _socket, info) => {
      if (err) {
        return next(err)
      } else {
        // tell the client that the connection is established
        socket.write(jetHeader(req.httpVersion))
        _socket.write(head)
        // creating pipes in both ends
        _socket.pipe(socket)
        socket.pipe(_socket)
      }
    })
  }
}

module.exports = {
  http: agentHttp,
  https: agentHttps
}
