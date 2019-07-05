const {fail} = require('assert')
const path = require('path')
const Ajv = require('ajv')

class AsyncApiValidator {

  /**
   * @param {any} schema
   * @param {any} asyncapi
   * @param {Object} resolvedSchema
   */
  constructor(schema, asyncapi, resolvedSchema) {
    this._schema = schema || fail('schema is mandatory')
    this._asyncapi = asyncapi || fail('asyncapi is mandatory')
    this.resolvedSchema = resolvedSchema || fail('asyncapi is mandatory')
    this.ajv = null
  }

  /**
   * @param {string} key
   * @param {Object} payload
   */
  validate(key, payload) {
    if (!this.ajv)
      this.ajv = new Ajv({allErrors: true})
    const validator = this.ajv.compile(this.resolvedSchema.components.messages[key].payload)
    const result = validator(payload)
    if (result) {
      console.log('Valid!')
    } else {
      console.log('Invalid: ' + this.ajv.errorsText(validator.errors))
      throw new Error(this.ajv.errorsText(validator.errors))
    }
  }

  validateSchema() {
    // validate user defined AsyncApi schema against AsyncApi schema defination
    const ajv =  new Ajv({schemaId: 'auto', allErrors: true})
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
    const validate = ajv.compile(this._asyncapi)
    const valid = validate(this._schema)
    if (!valid) {
      console.log('Invalid: ' + ajv.errorsText(validate.errors))
      throw new Error(ajv.errorsText(validate.errors))
    } else {
      console.log('Valid!')
    }
  }
}

module.exports = AsyncApiValidator