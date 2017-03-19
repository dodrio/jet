'use strict'

const ProxyServer = require('./proxy-server')
const modeSwitcher = require('./mode-switcher')
const privateipChecker = require('./privateip-checker')
const geoipChecker = require('./geoip-checker')
const requestLogger = require('./request-logger')

// create jet server
const jet = new ProxyServer([
  modeSwitcher,
  privateipChecker,
  geoipChecker,
  requestLogger
])

module.exports = jet
