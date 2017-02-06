'use strict'

const ProxyServer = require('./proxy-server')
const geoipChecker = require('./geoip-checker')
const requestLogger = require('./request-logger')

// create jet server
const jet = new ProxyServer([
  geoipChecker,
  requestLogger
])

module.exports = jet
