const {Parser: AsyncapiParser, fromURL, fromFile} = require('@asyncapi/parser')
const {OpenAPISchemaParser} = require('@asyncapi/openapi-schema-parser')
const ValidationError = require('./ValidationError')

class Parser {
  /**
   * @param {string} source
   * @param {{ msgIdentifier?: string; ignoreArray?: boolean; path?: any; }} options
   * @returns {Promise} ref resolved schema object
   */
  async parse(source, options) {
    const defaultConfig = options && options.path ? {source: options.path} : {}
    const parser = new AsyncapiParser()
    let document, diagnostics
    try {
      parser.registerSchemaParser(OpenAPISchemaParser())
      if (source instanceof Object) {
        // Source could be an object (instead of JSON / YAML string.)
        const result = await parser.parse(source)
        document = result.document
        diagnostics = result.diagnostics
      } else if (source.indexOf('https://') === 0 || source.indexOf('http://') === 0) {
        const result = await fromURL(parser, source).parse(defaultConfig)
        document = result.document
        diagnostics = result.diagnostics
      } else {
        const result = await fromFile(parser, source).parse(defaultConfig)
        document = result.document
        diagnostics = result.diagnostics
      }
      if (diagnostics && diagnostics.length) {
        const errorMessages = this._formatError(diagnostics)
        if (errorMessages) throw new ValidationError(errorMessages, undefined, diagnostics)
      }
      return document
    } catch (err) {
      if (err instanceof ValidationError) throw err
      throw new ValidationError(err.message, undefined, err)
    }
  }

  _formatError(diagnostics) {
    let messages = ''

    diagnostics.forEach(error => {
      if (error.severity === 0) {
        messages += error.message ? `${error.message} ` : ''
      }
    })

    return messages === '' ? null : messages
  }
}

module.exports = new Parser()
