'use strict'

const asyncapiSchemas = require('asyncapi')

const MessageValidator = require('./MessageValidator')
const SchemaValidator = require('./SchemaValidator')
const Parser = require('./Parser')

function ValidatorFactory() {
  /**
   * @param {string} source
   * @returns {Promise<MessageValidator>}
   */
  this.fromSource = async (source, options = {}) => {
    const schema = await Parser.parse(source)
    const asyncapiVersion = schema.asyncapi
    const asyncapiSchema = asyncapiSchemas[asyncapiVersion]

    SchemaValidator.validate(schema, asyncapiSchema)

    return new MessageValidator(schema, options)
  }
}

module.exports = new ValidatorFactory()
