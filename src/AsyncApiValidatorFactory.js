'use strict'

const path = require('path')
const utils = require('./utils')
const asyncapiSchemas = require('asyncapi')

// Validator
const AsyncApiValidator = require('./AsyncApiValidator')

// Loaders
const HttpLoader = require('./loaders/httpLoader')
const FsLoader = require('./loaders/fsLoader')

// Parsers
const jsonParser = require('./parsers/jsonParser')
const yamlParser = require('./parsers/yamlParser')

function AsyncApiValidatorFactory() {
  /**
   * @param {string} extension
   * @returns {jsonParser | yamlParser}
   */
  this._getParserFromExtension = (extension) => {
    if (utils.isJson(extension))
      return jsonParser
    else if (utils.isYaml(extension))
      return yamlParser
    throw new Error(`extension not supported: ${extension}`)
  }

  /**
   * @param {string} source
   * @returns {HttpLoader | FsLoader}
   */
  this._getLoaderFromSource = (source) => {
    if (source.startsWith('http'))
      return new HttpLoader(source)

    return new FsLoader(source)
  }

  /**
   * @param {string} source
   * @returns {Promise<AsyncApiValidator>}
   */
  this.fromSource = async (source) => {
    const extension = path.extname(source)
    const parser = this._getParserFromExtension(extension)
    const loader = this._getLoaderFromSource(source)

    const rawSchema = await loader.load()
    const schema = parser.parse(rawSchema)

    const asyncapiVersion = schema.asyncapi
    const asyncapiSchema = asyncapiSchemas[asyncapiVersion]

    return new AsyncApiValidator(schema, asyncapiSchema)
  }
}

module.exports = new AsyncApiValidatorFactory()
