const mocks = require('../mocks')
const AsyncApiValidator = require('../../index')

describe('factory', () => {
  it('should throw error if file not found', async () => {
    const validator = AsyncApiValidator.fromSource('something')
    await expect(validator).rejects.toThrowError('Error: Error opening file')
  })

  it('should throw error if unable to parse file', async () => {
    const validator = AsyncApiValidator.fromSource(mocks.htmlFile)
    await expect(validator).rejects.toThrowError('ParserError: Error parsing')
  })

  it('should parse JSON schema', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/jsonSchema.json')
    expect(await validator).toHaveProperty('_schema') // not good testing
  })

  it('should throw error if schema body is broken', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/broken.yml')
    await expect(validator).rejects.toThrowError('MissingPointerError: Token "schemas" does not exist.')
  })

  it('should throw error if schema is not valid with asyncapi', async () => {
    try {
      await AsyncApiValidator.fromSource('./test/schemas/invalid.yml')
    } catch (e) {
      expect(e.message).toBe('schema validation failed')
      expect(e.errors).toBe('data.components should NOT have additional properties')
    }
  })

  it('should throw error if key not found', async () => {
    const validator = await AsyncApiValidator.fromSource(mocks.slack)
    const validate = () => validator.validate('lightMeasured', {})
    expect(validate).toThrowError(new Error('key lightMeasured not found'))
  })

  it('should throw error - operation is not valid', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/slack.yml')
    const validate = () => validator.validate('hello', {
      type: null
    }, 'device-installation-events')
    expect(validate).toThrowError(new Error('operation "null" is not valid'))
  })

  it('should throw error - msgIdentifier is required', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/slack.yml')
    const validate = () => validator.validate('hello', {
      type: null
    }, 'device-installation-events', 'publish')
    expect(validate).toThrowError(new Error('"msgIdentifier" is required with channel validation'))
  })

  it('should throw error - msgIdentifier does not exist for one-of message', async () => {
    try {
      await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/deviceMessages.yaml', {msgIdentifier: 'hello'})
    } catch (e) {
      expect(e.message).toBe('msgIdentifier "hello" does not exist')
    }
  })

  it('should throw error - msgIdentifier does not exist', async () => {
    try {
      await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/userMessages.yaml', {msgIdentifier: 'hello'})
    } catch (e) {
      expect(e.message).toBe('msgIdentifier "hello" does not exist')
    }
  })

  it('should throw error - If schema is array and payload is object', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/mqtt.yaml')
    const validate = () => validator.validate('measurements', {
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    })
    expect(validate).toThrowError(new Error('data should be array'))
  })

  it('should not throw error - If schema is array and payload is array', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/mqtt.yaml')
    const validate = validator.validate('measurements', [{
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }])
    expect(validate).toStrictEqual(true)
  })

  it('should not throw error - If schema is array and payload is object with ignoreArray option true', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/mqtt.yaml', {ignoreArray: true})
    const validate = validator.validate('measurements', {
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    })
    expect(validate).toStrictEqual(true)
  })

  it('should not throw error - If schema is array and payload is array with ignoreArray option true', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v1.2.0/mqtt.yaml', {ignoreArray: true})
    const validate = validator.validate('measurements', [{
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }])
    expect(validate).toStrictEqual(true)
  })

  describe('schema 1.2.0', () => {
    describe('streetlights asyncapi schema tests', () => {
      let validator
      beforeAll(async () => {
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

      it('should validate proper lightMeasured message', () => {
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
        expect(validate).toThrowError(new Error('data.bot.icons[\'property2\'] should be string'))
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
        expect(validate).toThrowError(new Error('data.type should be equal to one of the allowed values'))
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

  describe('schema 2.0.0', () => {
    describe('deviceMessages', () => {
      let validator
      beforeEach(async () => {
        validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/deviceMessages.yaml', {msgIdentifier: 'name'})
      })

      it('should throw error - channel not found', () => {
        const validate = () => validator.validate('hello', {
          type: null
        }, 'device-events', 'publish')
        expect(validate).toThrowError(new Error('channel "device-events" not found'))
      })

      it('should throw error - key not found on channel with operation', () => {
        const validate = () => validator.validate('hello', {
          type: null
        }, 'device-installation-events', 'publish')
        expect(validate).toThrowError(new Error('message with key "hello" on channel "device-installation-events" and operation "publish" not found'))
      })

      it('should throw error - data should have required property', () => {
        const validate = () => validator.validate('DeviceInstallationResponsePublished', {
          type: 'null'
        }, 'device-installation-events', 'publish')
        // eslint-disable-next-line quotes, max-len
        expect(validate).toThrowError(new Error("data should have required property 'id', data should have required property 'key', data should have required property 'generated', data should have required property 'requestId'"))
      })

      it('should not throw error', () => {
        const validate = validator.validate('DeviceInstallationResponsePublished', {
          id: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
          key: 'string',
          type: 'string',
          generated: '2017-01-09T08:27:22.222Z',
          requestId: 'string',
          data: {
            deviceId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
            id: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
            status: 'success',
            message: 'string',
            received: '2017-01-09T08:27:22.222Z',
            recorded: '2017-01-09T08:27:22.222Z'
          }
        }, 'device-installation-events', 'publish')
        expect(validate).toStrictEqual(true)
      })
    })

    describe('userMessages', () => {
      let validator
      beforeEach(async () => {
        validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/userMessages.yaml', {msgIdentifier: 'x-custom-key'})
      })

      it('should validate UserDeleted message', () => {
        const validate = validator.validate('UserDeleted', {
          role: 'admin',
          userName: 'user@gmail.com'
        }, 'user-events', 'publish')
        expect(validate).toStrictEqual(true)
      })
    })
  })
})
