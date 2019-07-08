const {fail} = require('assert')
const Ajv = require('ajv')
const deref = require('json-schema-deref-sync')

class AsyncApiValidator {
  /**
   * @param {any} schema
   * @param {any} asyncapiSchema
   */
  constructor(schema, asyncapiSchema) {
    this._schema = schema || fail('schema is mandatory')
    this._asyncapiSchema = asyncapiSchema || fail('asyncapi is mandatory')
    this._ajv = new Ajv({allErrors: true})
    validateSchema(schema, asyncapiSchema)
    this._resolvedSchema = deref(schema, null)
    this._messages = this._resolvedSchema.components.messages
  }

  /**
   * @param {string} key
   * @param {Object} payload
   * @returns {boolean}
   */
  validate(key, payload) {
    if (!this._messages[key]) {
      console.log(`key ${key} not found`)
      throw new Error(`key ${key} not found`)
    }

    const validator = this._ajv.compile(this._messages[key].payload)
    const result = validator(payload)

    if (!result) {
      console.log('Invalid: ' + this._ajv.errorsText(validator.errors))
      throw new Error(this._ajv.errorsText(validator.errors))
    }

    return true
  }
}

const validateSchema = (schema, asyncapiSchema) => {
  // validate user defined AsyncApi schema against AsyncApi schema defination
  const ajv = new Ajv({schemaId: 'auto', allErrors: true})
  ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))

  const validate = ajv.compile(asyncapiSchema)
  const valid = validate(schema)

  if (!valid) {
    console.log('Invalid: ' + ajv.errorsText(validate.errors))
    throw new Error(ajv.errorsText(validate.errors))
  }
}

module.exports = AsyncApiValidator
