'use strict'

const path = require('path')
const os = require('os')

const configDir = path.join(os.homedir(), '.config/jet')
const rulesDir = path.join(configDir, 'rules')

module.exports = {
  rulesDir,
  rulesIP: path.join(rulesDir, 'IP'),
  rulesIPSrc: 'http://www.ipdeny.com/ipblocks/data/aggregated/cn-aggregated.zone',
  socks: {
    addr: process.env.JET_SOCKS_ADDR || '127.0.0.1',
    port: +process.env.JET_SOCKS_PORT || 1080,
    type: +process.env.JET_SOCKS_TYPE || 5
  }
}
