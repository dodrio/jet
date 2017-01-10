'use strict'

const http = require('http')
const requestWrapper = require('./requestWrapper')
const ipChecker = require('./ipChecker')
const agent = require('./agent')
const series = require('run-series')

// create jet server
const jet = http.createServer()

// proxy an HTTP request.
jet.on('request', (req, res) => {
  series([
    function (next) {
      requestWrapper(req, next)
    },
    function (next) {
      ipChecker(req, next)
    },
    function (next) {
      agent.http(req, res, next)
    }
  ], function (err) {
    console.log(err)
  })
})

// proxy an HTTPS request.
jet.on('connect', (req, socket, head) => {
  series([
    function (next) {
      requestWrapper(req, next)
    },
    function (next) {
      ipChecker(req, next)
    },
    function (next) {
      agent.https(req, socket, head, next)
    }
  ], function (err) {
    console.log(err)
  })
})

module.exports = jet
