const asyncapiParser = require('@asyncapi/parser')
const openapiSchemaParser = require('@asyncapi/openapi-schema-parser')
const {promisify} = require('util')
const readFile = promisify(require('fs').readFile)
const ValidationError = require('./ValidationError')

class Parser {
  /**
   * @param {string} source URL or file path or an actual JSON / YAML object or string
   * @param {{ msgIdentifier?: string; ignoreArray?: boolean; path?: any; }} options
   * @returns {Promise} ref resolved schema object
   */
  async parse(source, options) {
    const defaultConfig = options && options.path ? {path: options.path} : {}
    try {
      asyncapiParser.registerSchemaParser(openapiSchemaParser)
      if (typeof source === 'string') {
        if (source.startsWith('https://') || source.startsWith('http://')) {
          return await asyncapiParser.parseFromUrl(source)
        }
        return await asyncapiParser.parse(source, {path: ''})
      }
      if (source instanceof Object) {
        // Source could be an object (instead of JSON / YAML string.)
        return await asyncapiParser.parse(source)
      }
      const file = await readFile(source, 'utf8')
      return await asyncapiParser.parse(file, defaultConfig)
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
