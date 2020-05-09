/**
 * @param {String} message - Error message
 * @param {String} key - Key of message against which payload is validated
 * @param {Array} errors - Optional details about the message
 */
class AsyncAPIValidationError extends Error {
  constructor(message, key, errors) {
    super(message)
    this.name = this.constructor.name
    this.key = key
    this.message = message
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AsyncAPIValidationError
