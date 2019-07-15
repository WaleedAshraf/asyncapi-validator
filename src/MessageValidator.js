'use strict'

const {fail} = require('assert')
const Ajv = require('ajv')

class AsyncApiValidator {
  /**
   * @param {any} schema
   * @param {any} asyncapiSchema
   */
  constructor(schema, asyncapiSchema) {
    this._asyncapiSchema = asyncapiSchema || fail('asyncapi is mandatory')
    this._schema = schema || fail('schema is mandatory')
    this._messages = this._schema.components.messages
    this._ajv = new Ajv({allErrors: true})
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @returns {boolean}
   */
  validate(key, payload) {
    if (!this._messages[key]) {
      console.error(`key ${key} not found`)
      throw new Error(`key ${key} not found`)
    }

    const validator = this._ajv.compile(this._messages[key].payload)
    const result = validator(payload)

    if (!result) {
      console.error('Invalid: ' + this._ajv.errorsText(validator.errors))
      throw new Error(this._ajv.errorsText(validator.errors))
    }

    return true
  }
}

module.exports = AsyncApiValidator
