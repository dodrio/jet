'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const mkdirp = require('mkdirp')
const logger = require('./logger')

function download (src, dest) {
  const destDir = path.dirname(dest)
  mkdirp.sync(destDir)

  const req = http.get(src, (res) => {
    const file = fs.createWriteStream(dest)
    res.pipe(file)

    res.on('end', () => {
      logger.info(`${dest} done.`)
    })
  })

  req.on('error', (err) => {
    logger.erro(`${dest} failed due to ${err.message}`)
  })
}

module.exports = download
