'use strict'

const {fail} = require('assert')
const axios = require('axios')

class HttpLoader {
  constructor(url) {
    this._url = url || fail('url is mandatory')
  }

  async load() {
    const res = await axios.get(this._url)
    return res.data
  }
}

module.exports = HttpLoader