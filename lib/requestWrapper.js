'use strict'

const url = require('url')

module.exports = function (req, next) {
  let urlObj
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    urlObj = url.parse(req.url)
  } else {
    urlObj = url.parse(`https://${req.url}`)
  }

  // store url related contents
  req._url = urlObj

  req._url.direct = false
  req._url.lock = false

  next()
}
