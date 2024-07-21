const fs = require('fs')
const mocks = require('../mocks')
const AsyncApiValidator = require('../../index')
const assert = require('assert')

describe('AsyncApiValidator', () => {
  describe('schema v2.0.0', () => {
    it('should throw error if file not found', async () => {
      const validator = AsyncApiValidator.fromSource('something')
      await expect(validator).rejects.toThrowError('ENOENT: no such file or directory, open \'something\'')
    })

    it('should throw error if unable to parse file', async () => {
      const validator = AsyncApiValidator.fromSource(mocks.htmlFile)
      await expect(validator).rejects.toThrowError(/Error thrown during AsyncAPI document parsing/)
    })

    it('should throw error if schema body is broken', async () => {
      const validator = AsyncApiValidator.fromSource('./test/schemas/broken.yml')
      await expect(validator).rejects.toThrowError(/Object must have required property "channels"/)
    })

    it('should throw error if schema is not valid with asyncapi', async () => {
      try {
        await AsyncApiValidator.fromSource('./test/schemas/invalid.yml')
      } catch (e) {
        expect(e.message).toBe('Property "channel" is not expected to be here ')
        expect(e.errors).toContainEqual({
          code: 'asyncapi-document-resolved',
          message: 'Property "channel" is not expected to be here',
          path: ['channel'],
          severity: 0,
          source: 'test/schemas/invalid.yml',
          range: {
            start: {line: 17, character: 13},
            end: {line: 17, character: 17}
          }
        })
      }
    })

    it('should throw error - msgIdentifier is required', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/slack.yml')
      const validate = () => validator.validate('hello', {
        type: null
      }, 'device-installation-events')
      expect(validate).toThrowError(new Error('"msgIdentifier" is required'))
    })

    it('should throw error - operation is not valid', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/slack.yml', {msgIdentifier: 'summary'})
      const validate = () => validator.validate('hello', {
        type: null
      }, 'device-installation-events')
      expect(validate).toThrowError(new Error('operation "undefined" is not valid'))
    })

    it('should throw error - If schema is array and payload is object', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name'})
      const validate = () => validator.validate('devices/measurements', {
        name: 'temperature',
        timestamp: '2019-01-21T11:04:05Z',
        value: 36.6
      }, 'devices/{deviceId}/measurements', 'publish')
      expect(validate).toThrowError(new Error('data must be array'))
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

    it('should accept a javascript Object as schema', async () => {
      const schema = JSON.parse(fs.readFileSync('./test/schemas/jsonSchema.json'))
      await assert.doesNotReject(AsyncApiValidator.fromSource(schema, {msgIdentifier: 'name'}))
    })
  })

  describe('schema v2.4.0', () => {
    it('should throw error - If schema is array and payload is object', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.4.0/mqtt.yaml')
      const validate = () => validator.validateByMessageId('devices/measurements', {
        name: 'temperature',
        timestamp: '2019-01-21T11:04:05Z',
        value: 36.6
      })
      expect(validate).toThrowError(new Error('data must be array'))
    })

    it('should not throw error - If schema is array and payload is object with ignoreArray option true', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.4.0/mqtt.yaml', {ignoreArray: true})
      const validate = validator.validateByMessageId('devices/measurements', {
        name: 'temperature',
        timestamp: '2019-01-21T11:04:05Z',
        value: 36.6
      })
      expect(validate).toStrictEqual(true)
    })

    it('should not throw error - If schema is array and payload is array with ignoreArray option true', async () => {
      const validator = await AsyncApiValidator.fromSource('./test/schemas/v2.4.0/mqtt.yaml', {ignoreArray: true})
      const validate = validator.validateByMessageId('devices/measurements', [{
        name: 'temperature',
        timestamp: '2019-01-21T11:04:05Z',
        value: 36.6
      }])
      expect(validate).toStrictEqual(true)
    })
  })
})
