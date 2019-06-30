'use strict'

const Ajv = require('ajv')
const yaml = require('yamljs')
const axios = require('axios')
const fs = require('fs')
const asyncapi = require('asyncapi')

const extRegex = '\.[^.\\/:*?"<>|\r\n]+$'
const httpRegex = '^(http|https):\/\/'

class Validate {
  constructor(path, options, callback) {

    if (!path)
      throw new Error('path not defined')
    this.path = path
    this.options = options
    this.callback = callback
    this.schema = null
    this.asyncapi = null
    this.validator = {}
    this.Ajv = Ajv
    this.getSchema()
    this.loadAsyncApi()
    this.validateSchema()
    this.creatValidator()
  }

  loadAsyncApi() {
    this.asyncapi = asyncapi[this.schema.asyncapi]
  }

  validateSchema() {
    const ajv = new this.Ajv({schemaId: 'auto'})
    const valid = ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
    if (!valid) console.log(ajv.errors);
  }

  validate(key, payload) {
    const ajv = new this.Ajv({allErrors: true})
    const validate = ajv.compile(this.validator[key])
    const valid = validate(payload)
    if (valid) console.log('Valid!')
    else console.log('Invalid: ' + ajv.errorsText(validate.errors))
  }

  getSchema() {
    const [ext] = this.path.match(extRegex)
    let schema = null
    if (this.path.match(httpRegex)) {
      this.getFile(this.path).then((res) => {
        if (ext === '.json') {
          schema = res
        } else if (ext === '.yaml' || ext === '.yml') {
          schema = yaml.parse(res)
        }
        this.schema = schema
      })
    } else {
      if (ext === '.json') {
        fs.readFile(this.path, 'utf8', (err, data) => {
          if (err) throw err
          this.schema = JSON.parse(data)
        })
      } else if (ext === '.yaml' || ext === '.yml') {
        this.schema = yaml.load(this.path)
      }
    }
  }

  async getFile(url) {
    try {
      const {data} = await axios.get(url)
      return data
    } catch (err) {
      console.log(err)
      throw err
    }
  }


  creatValidator() {
    for (let key in this.schema.components.messages) {
      this.validator[key] = this.resolveRef(this.schema.components.messages[key].payload, this.schema)
    }
  }

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
}

module.exports = Validate
