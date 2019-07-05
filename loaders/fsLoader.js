'use strict'

const fs = require('fs')
const {fail} = require('assert')
const util = require('util')
const readFile = util.promisify(fs.readFile)

class FsLoader {
  constructor(path) {
    this._path = path || fail('path is mandatory')
  }

  load() {
    return readFile(this._path, 'utf8')
  }
}

module.exports = FsLoader