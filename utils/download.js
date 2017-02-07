'use strict'

const fs = require('fs')
const path = require('path')
const http = require('http')
const mkdirp = require('mkdirp')
const ProgressBar = require('progress')
const logger = require('./logger')

function download (src, dest) {
  const destDir = path.dirname(dest)
  mkdirp.sync(destDir)

  const req = http.get(src)
  req.on('response', (res) => {
    let body = ''

    const len = Number.parseInt(res.headers['content-length'], 10)

    const bar = new ProgressBar('  [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 40,
      total: len
    })

    const file = fs.createWriteStream(dest)

    res.on('data', (chunk) => {
      bar.tick(chunk.length)
      body += chunk
    })

    res.on('end', () => {
      file.end(body)
    })
  })

  req.on('error', (err) => {
    logger.erro(`${dest} failed due to ${err.message}`)
  })
}

module.exports = download
