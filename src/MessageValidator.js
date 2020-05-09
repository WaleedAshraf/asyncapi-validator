'use strict'

const { fail } = require('assert')
const Ajv = require('ajv')
const ValidationError = require('./ValidationError')

class MessageValidator {
  /**
   * @param {object} schema - user defined AsyncApi Schema
   * @param {object} options - options for validations
   * @param {object} channels - simplified channels object from schema
   */
  constructor(schema, options, channels) {
    this._schema = schema || fail('schema is mandatory')
    this._messages = this._schema.components ? this._schema.components.messages : []
    this._channels = channels
    this._ajv = new Ajv({ allErrors: true })
    this._options = options
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @param {Object} channel
   * @param {Object} operation
   * @returns {boolean}
   */
  validate(key, payload, channel = null, operation = null) {
    const shouldIgnoreArray = this._options.ignoreArray === true
    let payloadSchema = null

    if (channel) {
      if (!operation || !(operation === 'publish' || operation === 'subscribe')) {
        throw new ValidationError(`operation "${operation}" is not valid`)
      }

      if (!this._options.msgIdentifier) {
        throw new ValidationError('"msgIdentifier" is required with channel validation')
      }

      if (!this._channels[channel]) {
        throw new ValidationError(`channel "${channel}" not found`)
      }

      if (!this._channels[channel][operation][key]) {
        throw new ValidationError(`message with key "${key}" on channel "${channel}" and operation "${operation}" not found`)
      }

      payloadSchema = this._channels[channel][operation][key].payload
    } else {
      if (!this._messages[key]) {
        throw new Error(`key ${key} not found`)
      }

      payloadSchema = this._messages[key].payload
    }

    const validator = this._ajv.compile(payloadSchema)
    const schemaIsArray = payloadSchema.type === 'array'
    const payloadIsNotArray = !Array.isArray(payload)

    if (shouldIgnoreArray && schemaIsArray && payloadIsNotArray) {
      payload = [payload]
    }

    const result = validator(payload)

    if (!result) {
      throw new ValidationError(this._ajv.errorsText(validator.errors), key, validator.errors)
    }

    return true
  }
}

module.exports = MessageValidator
