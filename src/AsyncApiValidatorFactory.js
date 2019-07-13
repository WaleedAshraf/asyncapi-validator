'use strict'

const asyncapiSchemas = require('asyncapi')
const Ajv = require('ajv')

const AsyncApiValidator = require('./AsyncApiValidator')
const Parser = require('./Parser')

function AsyncApiValidatorFactory() {
  /**
   * @param {string} source
   * @returns {Promise<AsyncApiValidator>}
   */
  this.fromSource = async (source) => {
    const schema = await Parser.parse(source)
    const asyncapiVersion = schema.asyncapi
    const asyncapiSchema = asyncapiSchemas[asyncapiVersion]

    validateSchema(schema, asyncapiSchema) // validate schema against AsyncApi Schema Defination

    return new AsyncApiValidator(schema, asyncapiSchema)
  }
}

const validateSchema = (schema, asyncapiSchema) => {
  // validate user defined AsyncApi schema against AsyncApi schema defination
  const ajv = new Ajv({schemaId: 'auto', allErrors: true})
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))

  const validate = ajv.compile(asyncapiSchema)
  const valid = validate(schema)

  if (!valid) {
    console.error('Invalid: ' + ajv.errorsText(validate.errors))
    throw new Error(ajv.errorsText(validate.errors))
  }
}

module.exports = new AsyncApiValidatorFactory()
