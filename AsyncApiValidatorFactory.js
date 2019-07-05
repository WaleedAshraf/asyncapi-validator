const path = require('path')
const utils = require('./utils')
const {fail} = require('assert')

// Validator
const AsyncApiValidator = require('./AsyncApiValidator')

// Loaders
const HttpLoader = require('./loaders/HttpLoader')
const FsLoader = require('./loaders/FsLoader')

// Parsers
const jsonParser = require('./parsers/jsonParser')
const yamlParser = require('./parsers/yamlParser')
const byPassParser = require('./parsers/byPassParser')

class AsyncApiValidatorFactory {
  _getParserFromExtension(extension) {
    if(utils.isJson(extension)) {
      return jsonParser
    }

    if(utils.isYaml(extension)) {
      return yamlParser
    }
    
    return byPassParser
  }

  _getLoaderFromSource(source) {
    if (source.startsWith('http')) {
      return new HttpLoader(source)
    }
    
    return new FsLoader(source)
  }

  fromSource(source) {
    const extension = path.extname(source)
    const loader = this._getLoaderFromSource(source)
    const parser = this._getParserFromExtension(extension)

    return this.fromLoader(loader, parser)  
  }

  async fromLoader(
    loader = fail('loader is mandatory'), 
    parser = byPassParser
  ) {
    const rawSchema = await loader.load()
    const schema = parser.parse(rawSchema)

    return new AsyncApiValidator(schema)
  }
}

module.exports = AsyncApiValidatorFactory
