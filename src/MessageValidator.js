const Ajv = require('ajv')
const ValidationError = require('./ValidationError')

class MessageValidator {
  /**
   * @param {object} schema - user defined AsyncApi Schema
   * @param {object} options - options for validations
   * @param {object} channels - simplified channels object from schema
   */
  constructor(schema, options, channels) {
    this.schema = schema
    this._messages = this.schema.components ? this.schema.components.messages : []
    this._channels = channels
    this._ajv = new Ajv({allErrors: true, unknownFormats: ['int32', 'int64', 'float', 'double', 'byte']})
    this._options = options
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @param {Object} channel
   * @param {Object} operation
   * @returns {boolean}
   */
  validate(key, payload, channel, operation) {
    this._validateArgs(key, channel, operation)
    const payloadSchema = this._channels[channel][operation][key].payload
    payload = this._shouldHandleArray(payloadSchema, payload) ? [payload] : payload
    const validator = this._ajv.compile(payloadSchema)

    const result = validator(payload)

    if (!result) throw new ValidationError(this._ajv.errorsText(validator.errors), key, validator.errors)

    return true
  }

  _validateArgs(key, channel, operation) {
    if (!operation || !(operation === 'publish' || operation === 'subscribe')) {
      throw new ValidationError(`operation "${operation}" is not valid`)
    }

    if (!this._channels[channel]) {
      throw new ValidationError(`channel "${channel}" not found`)
    }

    if (!this._channels[channel][operation][key]) {
      throw new ValidationError(`message with key "${key}" on channel "${channel}" and operation "${operation}" not found`)
    }
  }

  _shouldHandleArray(payloadSchema, payload) {
    const shouldIgnoreArray = this._options.ignoreArray === true
    const schemaIsArray = payloadSchema.type === 'array'
    const payloadIsNotArray = !Array.isArray(payload)

    if (shouldIgnoreArray && schemaIsArray && payloadIsNotArray) return true
    return false
  }
}

module.exports = MessageValidator
