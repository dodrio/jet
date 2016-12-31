'use strict'

const fs = require('fs')
const path = require('path')
const dns = require('dns')
const debug = require('debug')('geoipChecker')
const { cidrSubnet } = require('ip')
const logger = require('./logger')

let cidrs
const geoipFile = path.join(__dirname, '../rules/GeoIP-CN')

/**
   set DNS server manually
*/
const dnsServers = process.env.JET_DNS_SERVERS

if (dnsServers) {
  const _servers = dnsServers.split(',').map((i) => {
    return i.trim()
  })

  dns.setServers(_servers)
}

function readGeoIPList () {
  return fs.readFileSync(geoipFile, 'utf8').split('\n')
    .filter(function (rx) {  // filter blank cidr
      return rx.length
    })
}

function update () {
  logger.info('Reading GeoIP Rules...')
  cidrs = new Set([...readGeoIPList()])
  debug(cidrs)
}

function isip (str) {
  return /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$/.test(str)
}

// detect whether IP blongs to China
function checkCNIP (ip, req) {
  req._url.CNIP = false

  for (let cidr of cidrs) {
    if (cidrSubnet(cidr).contains(ip)) {
      req._url.CNIP = true
    }
  }
}

function checker (req, cb) {
  const { hostname } = req._url

  if (isip(hostname)) {
    const ip = hostname

    checkCNIP(ip, req)

    cb()
  } else {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        return logger.info(`Failed to resolve: ${hostname}`)
      }

      // use the first address only
      const ip = addresses[0]
      checkCNIP(ip, req)
    })

    cb()
  }
}

logger.info(`Current DNS: ${dns.getServers()}`)
fs.watch(geoipFile, () => {
  update()
})
update()

module.exports = checker
