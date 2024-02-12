const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const ValidationError = require('./ValidationError')

class MessageValidator {
  /**
   * @param {object} schema - user defined AsyncApi Schema
   * @param {{ msgIdentifier?: string; ignoreArray?: boolean; path?: any; }} options - options for validations
   * @param {object} channels - simplified channels object from schema
   */
  constructor(schema, options, channels, messagesWithId) {
    this.schema = schema
    this._messages = this.schema.components ? this.schema.components.messages : []
    this._messagesWithId = messagesWithId
    this._channels = channels
    this._ajv = new Ajv({allErrors: true, strict: false, unicodeRegExp: false})
    addFormats(this._ajv)
    this._options = options
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @param {Object} channel
   * @param {Object} operation
   * @param {string} messageField default is 'payload', for socket.io ACK response this can be 'x-ack'
   * @returns {boolean}
   */
  validate(key, payload, channel, operation, messageField = 'payload') {
    this._validateArgs(key, channel, operation)
    const payloadSchema = this._channels[channel][operation][key][messageField]
    payload = this._shouldHandleArray(payloadSchema, payload) ? [payload] : payload
    const validator = this._ajv.compile(payloadSchema)

    const result = validator(payload)

    if (!result) throw new ValidationError(this._ajv.errorsText(validator.errors), key, validator.errors)

    return true
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @param {string} messageField default is 'payload', for socket.io ACK response this can be 'x-ack'
   * @returns {boolean}
   */
  validateByMessageId(key, payload, messageField = 'payload') {
    this._validateArgs(key, null, null, 'validateByMessageId')
    const payloadSchema = this._messagesWithId[key][messageField]
    payload = this._shouldHandleArray(payloadSchema, payload) ? [payload] : payload
    const validator = this._ajv.compile(payloadSchema)

    const result = validator(payload)

    if (!result) throw new ValidationError(this._ajv.errorsText(validator.errors), key, validator.errors)

    return true
  }

  /**
   * @param {string} key
   * @param {string | number} channel
   * @param {string} operation
   * @param {string} method
   */
  _validateArgs(key, channel, operation, method = null) {
    if (method === 'validateByMessageId') {
      const [major, minor] = this.schema.asyncapi.split('.')
      if (parseInt(major) < 2 || (parseInt(major) === 2 && parseInt(minor) < 4)) {
        throw new ValidationError(`AsyncAPI schema version should be >= 2.4.0. Your version is "${this.schema.asyncapi}"`)
      }

      if (!this._messagesWithId[key]) {
        throw new ValidationError(`message with messageId "${key}" not found`)
      }
    } else {
      if (!this._options.msgIdentifier) {
        throw new ValidationError('"msgIdentifier" is required')
      }

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
  }

  /**
   * @param {{ type: string; }} payloadSchema
   * @param {any} payload
   */
  _shouldHandleArray(payloadSchema, payload) {
    const shouldIgnoreArray = this._options.ignoreArray === true
    const schemaIsArray = payloadSchema.type === 'array'
    const payloadIsNotArray = !Array.isArray(payload)

    return !!(shouldIgnoreArray && schemaIsArray && payloadIsNotArray)
  }
}

module.exports = MessageValidator
