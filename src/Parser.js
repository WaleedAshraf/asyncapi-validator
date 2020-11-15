const fs = require('fs')
const asyncapiParser = require('@asyncapi/parser')
const openapiSchemaParser = require('@asyncapi/openapi-schema-parser')
const {promisify} = require('util')
const ValidationError = require('./ValidationError')
const readFile = promisify(fs.readFile)

class Parser {
  /**
   * @param {string} source
   * @returns {Promise} ref resolved schema object
   */
  async parse(source) {
    try {
      asyncapiParser.registerSchemaParser(openapiSchemaParser)
      if (source.indexOf('https://') === 0 || source.indexOf('http://') === 0) {
        return await asyncapiParser.parseFromUrl(source)
      }
      const file = await readFile(source, 'utf8')
      return await asyncapiParser.parse(file)
    } catch (err) {
      throw new ValidationError(this._formatError(err), undefined, err.validationErrors)
    }
  }

  _formatError(err) {
    const title = err.title || err.message
    let details = 'Error Details: '
    details += err.detail ? err.detail : ''
    if (err.validationErrors && err.validationErrors.length) {
      err.validationErrors.forEach(element => {
        details += element.title ? element.title : ''
      })
    }
    return `${title} ${details}`
  }
}

module.exports = new Parser()
