'use strict'

const {fail} = require('assert')
const axios = require('axios')

class HttpLoader {
  /**
   * @param {string} url
   */
  constructor(url) {
    this._url = url || fail('url is mandatory')
  }

  /**
   * @returns {Promise}
   */
  async load() {
    // @ts-ignore
    const res = await axios.get(this._url)
    return res.data
  }
}

module.exports = HttpLoader
