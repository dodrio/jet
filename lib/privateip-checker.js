'use strict'

const { isIPv4 } = require('net')
const { cidrSubnet } = require('ip')

/**
 * RFC1918:
 *
 * The Internet Assigned Numbers Authority (IANA) has reserved the following
 * three blocks of the IP address space for private internets:
 *
 *   10.0.0.0/8
 *   172.16.0.0/12
 *   192.168.0.0/16
 */

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

function privateipChecker (request, next) {
  const { hostname } = request.urlObj

  if (isIPv4(hostname)) {
    const ip = hostname

    if (isPrivateIP(ip)) {
      request.urlObj.direct = true
      request.urlObj.lock = true
    }
  }

  next()
}

module.exports = privateipChecker
