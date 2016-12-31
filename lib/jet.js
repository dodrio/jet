'use strict'

const http = require('http')
const url = require('url')
const geoipChecker = require('./geoipChecker')
const agent = require('./agent')

// create jet server
const jet = http.createServer()

// proxy an HTTP request.
jet.on('request', (req, res) => {
  const hrefObj = url.parse(req.url)
  req._url = hrefObj

  geoipChecker(req, () => {
    agent.http(req, res)
  })
})

// proxy an HTTPS request.
jet.on('connect', (req, socket, head) => {
  const hrefObj = url.parse(`https://${req.url}`)
  req._url = hrefObj

  geoipChecker(req, () => {
    agent.https(req, socket, head)
  })
})

module.exports = jet
