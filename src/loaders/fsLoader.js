'use strict'

const {readFile} = require('fs')
const {fail} = require('assert')

class FsLoader {
  /**
   * @param {String} path
   */
  constructor(path) {
    this._path = path || fail('path is mandatory')
  }

  /**
   * @returns {Promise}
   */
  async load() {
    return new Promise((resolve, reject) => {
      readFile(this._path, 'utf8', (error, result) => {
        if (error) reject(error)
        resolve(result)
      })
    })
  }
}

module.exports = FsLoader
