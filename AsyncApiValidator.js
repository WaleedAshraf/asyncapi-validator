const {fail} = require('assert')
const path = require('path')

class AsyncApiValidator {
  constructor(schema) {
    this._schema = schema || fail('schema is mandatory')
  }

  validate(type, payload) {
    console.log(JSON.stringify(this._schema, null, 4))
    console.log(type, payload)
  }
}

module.exports = AsyncApiValidator