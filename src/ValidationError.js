'use strict'

module.exports = function AsyncAPIValidationError(message, errors, key) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.key = key
  this.message = message
  this.errors = errors
}

require('util').inherits(module.exports, Error)
