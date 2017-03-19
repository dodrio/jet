'use strict'

const ProxyServer = require('./proxy-server')
const modeSwitcher = require('./mode-switcher')
const ipChecker = require('./ip-checker')
const requestLogger = require('./request-logger')

// create jet server
const jet = new ProxyServer([
  modeSwitcher,
  ipChecker,
  requestLogger
])

module.exports = jet
