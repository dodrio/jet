'use strict'

require('colors')

function info (log = '') {
  console.log(`[INFO] ${log}`.blue)
}

function erro (log = '') {
  console.log(`[ERRO] ${log}`.red)
}

module.exports = {
  info,
  erro
}
