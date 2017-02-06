'use strict'

const fs = require('fs')
const dns = require('dns')
const { isIPv4 } = require('net')
const { cidrSubnet } = require('ip')
const config = require('../config')
const logger = require('../utils/logger')

let cidrs

function readRulesIP () {
  return fs.readFileSync(config.rulesIP, 'utf8').split('\n')
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

function geoipChecker (request, next) {
  const { lock, hostname } = request.urlObj

  if (!lock) {
    let ip
    if (isIPv4(hostname)) {
      ip = hostname

      if (isCNIP(ip)) {
        request.urlObj.direct = true
      }

      next()
    } else {
      dns.lookup(hostname, (err, address) => {
        if (err) return console.log(err)

        ip = address

        if (isCNIP(ip)) {
          request.urlObj.direct = true
        }

        next()
      })
    }
  }
}

fs.watch(config.rulesIP, () => {
  update()
})
update()

module.exports = geoipChecker
