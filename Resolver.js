'use strict'

const RefResolver = require('json-ref-resolver')

class Resolver {
  /**
   * @param {Object} schema
   */
  constructor(schema) {
    this._refSchema= schema
    this._resolvedSchema = null
  }

  /**
   * @returns {Promise}
   */
  async resolve() {
    const resolver = new RefResolver.Resolver()
    const res = await resolver.resolve(this._refSchema)
    return res.result
  }
}

module.exports = Resolver