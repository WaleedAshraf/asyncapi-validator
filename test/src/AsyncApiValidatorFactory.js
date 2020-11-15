const mocks = require('../mocks')
const AsyncApiValidator = require('../../index')
const assert = require('assert')

describe('factory', () => {
  it('should throw error if file not found', async () => {
    const validator = AsyncApiValidator.fromSource('something')
    await expect(validator).rejects.toThrowError('ENOENT: no such file or directory, open \'something\'')
  })

  it('should throw error if unable to parse file', async () => {
    const validator = AsyncApiValidator.fromSource(mocks.htmlFile)
    await expect(validator).rejects.toThrowError('The provided YAML is not valid.')
  })

  it('should throw error if schema body is broken', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/broken.yml')
    await expect(validator).rejects.toThrowError('There were errors validating the AsyncAPI document.')
  })

  it('should throw error if schema is not valid with asyncapi', async () => {
    try {
      await AsyncApiValidator.fromSource('./test/schemas/invalid.yml')
    } catch (e) {
      expect(e.message).toBe('There were errors validating the AsyncAPI document. Error Details: / should NOT have additional properties')
      expect(e.errors).toStrictEqual([{location: {jsonPointer: '/'}, title: '/ should NOT have additional properties'}])
    }
  })

  it('should throw error - operation is not valid', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/slack.yml', {msgIdentifier: 'summary'})
    const validate = () => validator.validate('hello', {
      type: null
    }, 'device-installation-events')
    expect(validate).toThrowError(new Error('operation "undefined" is not valid'))
  })

  it('should throw error - msgIdentifier is required', async () => {
    const validator = AsyncApiValidator.fromSource('./test/schemas/v2.0.0/slack.yml')
    await expect(validator).rejects.toThrowError('"msgIdentifier" is required')
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
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name'})
    const validate = () => validator.validate('devices/measurements', {
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }, 'devices/{deviceId}/measurements', 'publish')
    expect(validate).toThrowError(new Error('data should be array'))
  })

  it('should not throw error - If schema is array and payload is array', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name'})
    const validate = validator.validate('devices/measurements', [{
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }], 'devices/{deviceId}/measurements', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should not throw error - If schema is array and payload is object with ignoreArray option true', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name', ignoreArray: true})
    const validate = validator.validate('devices/measurements', {
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }, 'devices/{deviceId}/measurements', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should not throw error - If schema is array and payload is array with ignoreArray option true', async () => {
    const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name', ignoreArray: true})
    const validate = validator.validate('devices/measurements', [{
      name: 'temperature',
      timestamp: '2019-01-21T11:04:05Z',
      value: 36.6
    }], 'devices/{deviceId}/measurements', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should parse JSON schema', async () => {
    await assert.doesNotReject(AsyncApiValidator.fromSource('./test/schemas/jsonSchema.json', {msgIdentifier: 'name'}))
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
            temperature: 2147483647,
            vibration: -9223372036854776000,
            floatType: 3.402823669209385e+38,
            doubleType: 1.7976931348623158e+308,
            byteType: 'U3dhZ2dlciByb2Nrcw=='
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
