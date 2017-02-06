'use strict'

require('colors')

function requestLogger (request, next) {
  const { direct, href } = request.urlObj
  const client = request.connection.remoteAddress

  if (direct) {
    console.log(`> DIRECT ${client} -> ${href}`.green)
  } else {
    console.log(`> TUNNEL ${client} -> ${href}`.yellow)
  }

  next()
}

module.exports = requestLogger
