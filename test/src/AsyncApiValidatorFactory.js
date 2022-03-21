const fs = require('fs')
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
      await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/deviceMessages.yaml', {msgIdentifier: 'hello', path: './test/schemas/v2.0.0/'})
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

  it('should accept a javascript Object as schema', async () => {
    const schema = JSON.parse(fs.readFileSync('./test/schemas/jsonSchema.json'))
    await assert.doesNotReject(AsyncApiValidator.fromSource(schema, {msgIdentifier: 'name'}))
  })
})
