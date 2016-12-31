require('colors')

function request (req, type) {
  if (type === 'tunnel') {
    console.log(`> ${req.connection.remoteAddress} TUNNEL ${req._url.href}`.yellow)
  } else if (type === 'direct') {
    console.log(`> ${req.connection.remoteAddress} DIRECT ${req._url.href}`.green)
  }
}

function info (log = '') {
  console.log(`[INFO] ${log}`.cyan)
}

function erro (log = '') {
  console.log(`[ERRO] ${log}`.yellow)
}

module.exports = {
  request,
  info,
  erro
}
