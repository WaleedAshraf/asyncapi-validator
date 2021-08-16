const asyncapiParser = require('@asyncapi/parser')
const openapiSchemaParser = require('@asyncapi/openapi-schema-parser')
const {promisify} = require('util')
const readFile = promisify(require('fs').readFile)
const ValidationError = require('./ValidationError')

class Parser {
  /**
   * @param {string} source
   * @returns {Promise} ref resolved schema object
   */
  async parse(source) {
    try {
      asyncapiParser.registerSchemaParser(openapiSchemaParser)
      if (source instanceof Object) {
        // Source could be an object (instead of JSON / YAML string.)
        return await asyncapiParser.parse(source)
      }
      if (source.indexOf('https://') === 0 || source.indexOf('http://') === 0) {
        return await asyncapiParser.parseFromUrl(source)
      }
      const file = await readFile(source, 'utf8')
      return await asyncapiParser.parse(file)
    } catch (err) {
      throw new ValidationError(this._formatError(err), undefined, err.validationErrors)
    }
  }

  /**
   * @param {{ title: any; message: any; detail: any; validationErrors: any[]; }} err
   */
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
