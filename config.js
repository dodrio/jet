'use strict'

const path = require('path')
const os = require('os')

const configDir = path.join(os.homedir(), '.config/jet')

module.exports = {
  geoip: {
    src: 'http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone',
    dest: path.join(configDir, 'GeoIP')
  },
  socks: {
    addr: process.env.JET_SOCKS_ADDR || '127.0.0.1',
    port: +process.env.JET_SOCKS_PORT || 1080,
    type: +process.env.JET_SOCKS_TYPE || 5
  },
  listen: {
    addr: process.env.JET_LISTEN_ADDR || '127.0.0.1',
    port: +process.env.JET_LISTEN_PORT || 9527
  }
}
