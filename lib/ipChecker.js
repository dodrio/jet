'use strict'

const fs = require('fs')
const path = require('path')
const dns = require('dns')
const debug = require('debug')('ipChecker')
const { cidrSubnet } = require('ip')
const logger = require('./logger')

let cidrs
const ipFile = path.join(__dirname, '../rules/IP')

/**
 * set DNS server manually
 */
const dnsServers = process.env.JET_DNS_SERVERS

if (dnsServers) {
  const servers = dnsServers.split(',').map((server) => {
    return server.trim()
  })

  dns.setServers(servers)
}

function readIPFile () {
  return fs.readFileSync(ipFile, 'utf8').split('\n')
    .filter(function (rx) {  // filter blank cidr
      return rx.length
    })
}

function update () {
  logger.info('Reading Rules - IP')
  cidrs = new Set([...readIPFile()])
  debug(cidrs)
}

function isip (str) {
  return /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$/.test(str)
}

// detect whether IP blongs to China
function checkIP (req, ip) {
  for (let cidr of cidrs) {
    if (req._url.lock === false &&
        cidrSubnet(cidr).contains(ip)) {
      req._url.direct = true
      req._url.lock = true
      break
    }
  }
}

function checker (req, next) {
  const { hostname } = req._url

  if (isip(hostname)) {
    const ip = hostname

    checkIP(req, ip)

    next(null)
  } else {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        return next(err)
      }

      // use the first address only
      const ip = addresses[0]
      checkIP(req, ip)

      next(null)
    })
  }
}

logger.info(`Current DNS: ${dns.getServers()}`)
fs.watch(ipFile, () => {
  update()
})
update()

module.exports = checker
