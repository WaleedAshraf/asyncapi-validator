'use strict'

const {fail} = require('assert')
const Ajv = require('ajv')

class MessageValidator {
  /**
   * @param {object} schema - user defnied AsyncApi Schema
   * @param {object} options - options for validations
   */
  constructor(schema, options) {
    this._schema = schema || fail('schema is mandatory')
    this._messages = this._schema.components.messages
    this._ajv = new Ajv({allErrors: true})
    this._options = options
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @returns {boolean}
   */
  validate(key, payload) {
    let result = null
    const shouldIgnoreArray = this._options.ignoreArray === true

    if (!this._messages[key]) {
      console.error(`key ${key} not found`)
      throw new Error(`key ${key} not found`)
    }

    const validator = this._ajv.compile(this._messages[key].payload)
    const schemaIsArray = this._messages[key].payload.type === 'array'
    const payloadIsNotArray = !Array.isArray(payload)

    if (shouldIgnoreArray && schemaIsArray && payloadIsNotArray) {
      result = validator([payload])
    } else {
      result = validator(payload)
    }

    if (!result) {
      console.error('Invalid: ' + this._ajv.errorsText(validator.errors))
      throw new Error(this._ajv.errorsText(validator.errors))
    }

    return true
  }
}

module.exports = MessageValidator
