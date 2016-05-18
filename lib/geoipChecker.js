'use strict';

const fs = require('fs');
const path = require('path');
const dns = require('dns');

const debug = require('debug')('geoipChecker');
const ip = require('ip');

let cidrs = [];
const geoipFile = path.join(__dirname, '../rules/GeoIP-CN');


function readGeoIPList() {
  return fs.readFileSync(geoipFile, 'utf8').split('\n')
    .filter(function (rx) { // filter blank cidr
      return rx.length;
    });
}


function update() {
  console.log('Jet: reading GeoIP list...');
  cidrs = readGeoIPList();
  debug(cidrs);
}


function checker(req, cb) {
  const hostname = req.headers.host;

  debug(hostname);
  dns.lookup(hostname, (err, addresses, family) => {
    if (err) {
      return console.log('Jet: failed to get IP');
    }

    if (family !== 4) {
      return console.log('Jet: invalid IP family');
    }

    for (let i in cidrs) {
      debug(addresses);
      if (ip.cidrSubnet(cidrs[i]).contains(addresses)) {
        return cb(true);
      }
    }

    return cb(false);
  });
}

update();
debug(cidrs);

module.exports = checker;
