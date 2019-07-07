'use strict'

const mocks = require('../mocks')
const AsyncApiValidator = require('../../index')

describe('factory', () => {
  it('should throw error if file not found', async () => {
    const validator = AsyncApiValidator.fromSource('something')
    await expect(validator).rejects.toThrowError(new Error(`ENOENT: no such file or directory, open 'something'`))
  })

  it('should throw error if unable to parse file', async () => {
    const validator = AsyncApiValidator.fromSource(mocks.htmlFile)
    await expect(validator).rejects.toThrowError(new Error('Unable to parse.'))
  })

  it('should parse JSON schema', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/jsonSchema.json')
    expect(await validator).toHaveProperty('_schema')
  })

  it('should throw error if schema is broken', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/broken.yml')
    await expect(validator).rejects.toThrowError(new Error('data.components should NOT have additional properties'))
  })

  it('should throw error if key not found', async () => {
    const validator = await AsyncApiValidator.fromSource(mocks.slack)
    const validate = () => validator.validate('lightMeasured', {})
    expect(validate).toThrowError(new Error('key lightMeasured not found'))
  })

  it('should get same validator - singleton', async () => {
    const validator = await AsyncApiValidator.fromSource(mocks.slack)
    validator._asyncapi = null
    const validatorTwo = await AsyncApiValidator.fromSource(mocks.slack)
    expect(validatorTwo._asyncapi).toStrictEqual(validator._asyncapi)
  })

  describe('schema 1.2.0', () => {
    describe('streetlights', () => {
      let validator
      beforeEach(async () => {
        validator = await AsyncApiValidator.fromSource(mocks.streetlights)
      })
      it('should throw error - lumens should be integer', () => {
        const validate = () => validator.validate('lightMeasured', {
          lumens: 'asd'
        })
        expect(validate).toThrowError(new Error('data.lumens should be integer'))
      })

      it('should throw error - sentAt should be date-time format', () => {
        const validate = () => validator.validate('lightMeasured', {
          sentAt: 'asd'
        })
        expect(validate).toThrowError(new Error('data.sentAt should match format "date-time"'))
      })

      it('should throw error - lumens should be integer', () => {
        const validate = () => validator.validate('lightMeasured', {
          lumens: 7.7
        })
        expect(validate).toThrowError(new Error('data.lumens should be integer'))
      })

      it('should validate lightMeasured', () => {
        const validate = validator.validate('lightMeasured', {
          lumens: 7,
          sentAt: '2019-07-07T15:17:47Z'
        })
        expect(validate).toStrictEqual(true)
      })
    })

    describe('slack', () => {
      let validator
      beforeEach(async () => {
        validator = await AsyncApiValidator.fromSource(mocks.slack)
      })

      it('should throw error - type should be string', () => {
        const validate = () => validator.validate('hello', {
          type: null
        })
        expect(validate).toThrowError(new Error('data.type should be string, data.type should be equal to one of the allowed values'))
      })

      it('should throw error - type should be one of the allowed value', () => {
        const validate = () => validator.validate('hello', {
          type: 'okay'
        })
        expect(validate).toThrowError(new Error('data.type should be equal to one of the allowed values'))
      })

      it('should throw error - data should be object', () => {
        const validate = () => validator.validate('hello', [
          'type'
        ])
        expect(validate).toThrowError('data should be object')
      })

      it('should validate message - type', () => {
        const validate = validator.validate('hello', {
          type: 'hello'
        })
        expect(validate).toStrictEqual(true)
      })

      it('should validate message - connectionError', () => {
        const validate = validator.validate('connectionError', {
          type: 'error',
          error: {
            code: 0,
            msg: 'string'
          }
        })
        expect(validate).toStrictEqual(true)
      })

      it('should validate message - connectionError - float number', () => {
        const validate = validator.validate('connectionError', {
          type: 'error',
          error: {
            code: 1.1,
            msg: 'string'
          }
        })
        expect(validate).toStrictEqual(true)
      })

      it('should throw error - connectionError - code number', () => {
        const validate = () => validator.validate('connectionError', {
          type: 'error',
          error: {
            code: 'abc',
            msg: '123'
          }
        })
        expect(validate).toThrowError(new Error('data.error.code should be number'))
      })

      it('should throw error - connectionError - code number, msg string', () => {
        const validate = () => validator.validate('connectionError', {
          type: 'error',
          error: {
            code: 'abc',
            msg: 123
          }
        })
        expect(validate).toThrowError(new Error('data.error.code should be number, data.error.msg should be string'))
      })

      it('should validate message - connectionError - additional properties', () => {
        const validate = validator.validate('connectionError', {
          type: 'error',
          error: {
            code: 1,
            msg: 'error',
            okay: 123
          }
        })
        expect(validate).toStrictEqual(true)
      })

      it('should throw error - botAdded - icons object', () => {
        const validate = () => validator.validate('botAdded', {
          type: 'bot_added',
          bot: {
            id: 'string',
            app_id: 'string',
            name: 'string',
            icons: [
              'property1', 'property2'
            ]
          }
        })
        expect(validate).toThrowError(new Error('data.bot.icons should be object'))
      })

      it('should throw error - botAdded - property2 string', () => {
        const validate = () => validator.validate('botAdded', {
          type: 'bot_added',
          bot: {
            id: 'string',
            app_id: 'string',
            name: 'string',
            icons: {
              property1: 'string',
              property2: 123
            }
          }
        })
        expect(validate).toThrowError(new Error(`data.bot.icons['property2'] should be string`))
      })

      it('should throw error - botAdded - type', () => {
        const validate = () => validator.validate('botAdded', {
          type: 'bot',
          bot: {
            id: 'string',
            app_id: 'string',
            name: 'string',
            icons: {
              property1: 'string',
              property2: 'string'
            }
          }
        })
        expect(validate).toThrowError(new Error(`data.type should be equal to one of the allowed values`))
      })

      it('should validate message - botAdded', () => {
        const validate = validator.validate('botAdded', {
          type: 'bot_added',
          bot: {
            id: 'string',
            app_id: 'string',
            name: 'string',
            additionalProp: 123,
            icons: {
              property1: 'string',
              property2: 'string'
            }
          }
        })
        expect(validate).toStrictEqual(true)
      })
    })
  })
})
