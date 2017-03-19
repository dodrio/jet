'use strict'

const fs = require('fs')
const dnscache = require('dnscache')({
  enable: true,
  ttl: 300,
  cachesize: 1000
})
const { isIPv4 } = require('net')
const { cidrSubnet } = require('ip')
const config = require('../config')
const logger = require('../utils/logger')

let cidrs

function readRulesIP () {
  return fs.readFileSync(config.geoip.dest, 'utf8').split('\n')
    .filter(function (rx) {  // filter blank cidr
      return rx.length
    })
}

function update () {
  logger.info('Reading GeoIP info.')
  cidrs = new Set([...readRulesIP()])
}

// detect whether IP blongs to China
function isCNIP (ip) {
  for (const cidr of cidrs) {
    if (cidrSubnet(cidr).contains(ip)) {
      return true
    }
  }

  return false
}

function isLoopbackIP (ip) {
  return ip === '127.0.0.1'
}

function isPrivateIP (ip) {
  const cidrs = [
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16'
  ]

  for (const cidr of cidrs) {
    if (cidrSubnet(cidr).contains(ip)) {
      return true
    }
  }

  return false
}

function ipChecker (request, next) {
  const { lock, hostname } = request.urlObj

  if (!lock) {
    let ip
    if (isIPv4(hostname)) {
      ip = hostname

      if (isLoopbackIP(ip) || isPrivateIP(ip) || isCNIP(ip)) {
        request.urlObj.direct = true
      }

      next()
    } else {
      dnscache.lookup(hostname, (err, address) => {
        if (err) return console.log(err)

        ip = address

        if (isLoopbackIP(ip) || isPrivateIP(ip) || isCNIP(ip)) {
          request.urlObj.direct = true
        }

        next()
      })
    }
  } else {
    next()
  }
}

fs.watch(config.geoip.dest, () => {
  update()
})
update()

module.exports = ipChecker
