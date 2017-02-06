'use strict'

const http = require('http')
const url = require('url')
const net = require('net')
const Socks = require('socks')
const util = require('util')
const series = require('run-series')
const config = require('../config')

// Proxy Setting
const proxy = {
  ipaddress: config.socks.addr,
  port: config.socks.port,
  type: config.socks.type
}

// Jet Header
function headerEstablished (httpVersion) {
  return `HTTP/${httpVersion} 200 Connection Established\r\n` +
    'Proxy-agent: Jet Proxy\r\n' +
    '\r\n'
}

function headerError (httpVersion) {
  return `HTTP/${httpVersion} 500 Connection Error\r\n` +
    'Proxy-agent: Jet Proxy\r\n' +
    '\r\n'
}

function requestWrapper (request, next) {
  const _url = request.url
  let _urlObj

  if (_url.startsWith('http://') || _url.startsWith('https://')) {
    _urlObj = url.parse(request.url)
  } else {
    _urlObj = url.parse(`https://${request.url}`)
  }

  request.urlObj = _urlObj
  request.urlObj.direct = false
  request.urlObj.lock = false

  next()
}

function requestListener (request, response) {
  const { direct, hostname, port, path } = request.urlObj

  const method = request.method
  const headers = request.headers
  const agent = new Socks.Agent({ proxy }, false, false)

  const options = {
    hostname,
    port,
    path,
    method,
    headers
  }

  if (!direct) {
    options.agent = agent
  }

  const proxyRequest = http.request(options)

  proxyRequest.on('response', proxyResponse => {
    response.writeHead(proxyResponse.statusCode, proxyResponse.headers)
    proxyResponse.pipe(response)
  })

  proxyRequest.on('error', () => {
    response.writeHead(500)
    response.end('Connection error\n')
  })

  request.pipe(proxyRequest)
}

function connectListener (request, socket, head) {
  const { direct, hostname: host, port } = request.urlObj

  if (direct) {
    const options = { host, port }

    const proxySocket = net.connect(options)
    proxySocket.on('connect', () => {
      // tell the client that the connection is established
      socket.write(headerEstablished(request.httpVersion))
      proxySocket.write(head)

      proxySocket.pipe(socket)
      socket.pipe(proxySocket)
    })

    proxySocket.on('error', () => {
      socket.write(headerError(request.httpVersion))
    })
  } else {
    const options = {
      proxy,
      target: { host, port }
    }

    Socks.createConnection(options, (err, proxySocket) => {
      if (err) {
        return socket.write(headerError(request.httpVersion))
      }

      // tell the client that the connection is established
      socket.write(headerEstablished(request.httpVersion))
      proxySocket.write(head)

      // creating pipes in both ends
      proxySocket.pipe(socket)
      socket.pipe(proxySocket)
    })
  }
}

class ProxyServer extends http.Server {
  constructor (middlewares) {
    super()

    if (middlewares && !util.isArray(middlewares)) {
      throw new Error('middlewares must be an array')
    }

    middlewares.splice(0, 0, requestWrapper)

    this.on('request', _requestListener)
    this.on('connect', _connectListener)

    function _requestListener (request, response) {
      let fns = []

      for (const middleware of middlewares) {
        fns.push(function (next) {
          middleware(request, next)
        })
      }

      fns.push(function (next) {
        requestListener(request, response)
      })

      series(fns)
    }

    function _connectListener (request, socket, head) {
      let fns = []

      for (const middleware of middlewares) {
        fns.push(function (next) {
          middleware(request, next)
        })
      }

      fns.push(function (next) {
        connectListener(request, socket, head)
      })

      series(fns)
    }
  }
}

module.exports = ProxyServer
