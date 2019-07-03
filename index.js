'use strict'

const Ajv = require('ajv')
const yaml = require('yamljs')
const axios = require('axios')
const fs = require('fs')
const asyncapi = require('asyncapi')
const util = require('util')
const {extname} = require('path')

// Convert fs.readFile into Promise version
const readFile = util.promisify(fs.readFile)

let v = null

class Validate {

  constructor() {
    this.path = null
    this.schema = null
    this.asyncapi = null
    this.validator = {}
    this.schemaAjv = null
    this.validateAjv = null
  }

  loadAsyncApi() {
    this.asyncapi = asyncapi[this.schema.asyncapi]
  }

  // validate user defined AsyncApi schema against AsyncApi schema defination
  validateSchema() {
    if (!this.schemaAjv) {
      this.schemaAjv = new Ajv({schemaId: 'auto', allErrors: true})
      this.schemaAjv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
    }
    const validate = this.schemaAjv.compile(this.asyncapi)
    const valid = validate(this.schema)
    if (!valid) {
      console.log('Invalid: ' + this.schemaAjv.errorsText(validate.errors))
      throw new Error(this.schemaAjv.errorsText(validate.errors))
    }
  }


  /**
   * @param {string} key
   * @param {Object} payload
   * validate "Payload" using the provided "Key" against generated schema
   */
  validate(key, payload) {
    if (!this.validateAjv) {
      this.validateAjv = new Ajv({allErrors: true})
    }
    const validate = this.validateAjv.compile(this.validator[key])
    const valid = validate(payload)
    if (valid) {
      console.log('Valid!')
    } else {
      console.log('Invalid: ' + this.validateAjv.errorsText(validate.errors))
      throw new Error(this.validateAjv.errorsText(validate.errors))
    }
  }

  /**
   * @param {any} url
   */
  async getFile(url) {
    try {
      const {data} = await axios.get(url)
      return data
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  createValidator() {
    for (let key in this.schema.components.messages) {
      this.validator[key] = this.resolveRef(this.schema.components.messages[key].payload, this.schema)
    }
  }

  /**
   * @param {Object} data - data
   * @param {Object} schema - compiled schema
   * resolve all ref recursively
   */
  resolveRef(data, schema) {
    for (let key in data) {
      if (key === '$ref') {
        const refLinkKeys = data.$ref.split('/')
        let refResolved = schema
        if (refLinkKeys[0] === '#') {
          for (let i = 1; i < refLinkKeys.length; i++) {
            refResolved = refResolved[refLinkKeys[i]]
          }
          return this.resolveRef(refResolved, schema)
        }
      } else if (Array.isArray(data[key])) {
        data[key] = data[key]
      } else if (typeof data[key] === 'object') {
        data[key] = this.resolveRef(data[key], schema)
      }
    }
    return data
  }

  init() {
    this.loadAsyncApi()
    this.validateSchema()
    this.createValidator()
    return
  }
}

/**
 * @param {string} path
 */
const getInstance = (path) => {
  if (!v || path !== v.path)
    v = new Validate()
  return v
}

/**
 * @param {string} path
 * load schema from file and parse to JSON
 */
const loadFromFile = async (path) => {
  const apv = getInstance(path)

  apv.path = path
  const ext = extname(path)
  let data = await readFile(path, 'utf8')
  if (ext === '.json') {
    apv.schema = JSON.parse(data)
  } else if (ext === '.yaml' || ext === '.yml') {
    apv.schema = yaml.load(apv.path)
  }
  apv.init()
  return apv
}

/**
 * @param {string} path - path of asyncapi schema
 * load schema from url and parse to JSON
 */
const loadFromUrl = async (path) => {
  const apv = getInstance(path)

  apv.path = path
  const ext = extname(path)
  let data = await apv.getFile(apv.path)
  if (ext === '.json') {
    apv.schema = data
  } else if (ext === '.yaml' || ext === '.yml') {
    apv.schema = yaml.parse(data)
  }
  apv.init()
  return apv
}

module.exports = {loadFromFile, loadFromUrl}
