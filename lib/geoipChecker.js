'use strict';

const fs = require('fs');
const path = require('path');
const dns = require('dns');
const debug = require('debug')('geoipChecker');
const ip = require('ip');
const logger = require('./logger');

let cidrs;
const geoipFile = path.join(__dirname, '../rules/GeoIP-CN');

/**
   set DNS server manually
*/
const dnsServers = process.env.JET_DNS_SERVERS;

if (dnsServers) {
  const _servers = dnsServers.split(',').map((i) => {
    return i.trim();
  });

  dns.setServers(_servers);
}

function readGeoIPList() {
  return fs.readFileSync(geoipFile, 'utf8').split('\n')
    .filter(function (rx) {  // filter blank cidr
      return rx.length;
    });
}

function update() {
  logger.info('Reading GeoIP Rules...');
  cidrs = new Set([...readGeoIPList()]);
  debug(cidrs);
}

function isip(str) {
  return /^(([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])(\.(?!$)|$)){4}$/.test(str);
}

function direct(address, cb) {
  for (let cidr of cidrs) {
    if (ip.cidrSubnet(cidr).contains(address)) {
      return cb(true);
    }
  }

  return cb(false);
}

function checker(req, cb) {
  const hostname = req.headers.host.split(':')[0];

  if (isip(hostname)) {
    const address = hostname;

    return direct(address, cb);
  } else {
    dns.resolve4(hostname, (err, addresses) => {
      if (err) {
        return logger.info(`Failed to resolve: ${hostname}`);
      }

      // only use the first address
      const address = addresses[0];
      return direct(address, cb);
    });
  }
}

logger.info(`Current DNS: ${dns.getServers()}`);
fs.watch(geoipFile, () => {
  update();
});
update();

module.exports = checker;
