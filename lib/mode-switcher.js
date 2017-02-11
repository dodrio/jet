'use strict'

const logger = require('../utils/logger')

const MODE_AUTO = 'auto'
const MODE_DIRECT = 'direct'
const MODE_TUNNEL = 'tunnel'
const MODES = [MODE_AUTO, MODE_DIRECT, MODE_TUNNEL]

let mode = MODE_AUTO

process.stdin.setEncoding('utf8')
process.stdin.on('data', (_mode) => {
  _mode = _mode.trim()
  if (MODES.includes(_mode)) {
    mode = _mode
    logger.info(`Switch to ${mode} mode`)
  } else {
    logger.erro('Switch to unsupported mode')
    logger.info(`Supported mode: ${MODES.join(', ')}`)
  }
})

function modeSwitcher (request, next) {
  if (mode === MODE_AUTO) {
    request.urlObj.lock = false
  } else if (mode === MODE_DIRECT) {
    request.urlObj.direct = true
    request.urlObj.lock = true
  } else if (mode === MODE_TUNNEL) {
    request.urlObj.direct = false
    request.urlObj.lock = true
  }

  next()
}

module.exports = modeSwitcher
