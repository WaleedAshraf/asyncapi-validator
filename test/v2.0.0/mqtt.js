const AsyncApiValidator = require('../../index')

describe('mqtt', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/mqtt.yaml', {msgIdentifier: 'name'})
  })

  it('should validate alerts message', () => {
    const validate = validator.validate('devices/alerts', [{
      message: 'temperature too high',
      name: 'temperature_high',
      state: 'set',
      timestamp: 0
    }], 'devices/{deviceId}/alerts', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should validate command_responses message', () => {
    const validate = validator.validate('devices/command_responses', [{
      id: '7f5bc456-21f2-4e9e-a38f-80baf762b1c5',
      message: 'message describing the command progress',
      status: 'in_progress',
      timestamp: 0
    }], 'devices/{deviceId}/command_responses', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should validate commands message', () => {
    const validate = validator.validate('devices/commands', {
      deviceId: 'd44d8a14-5fbb-4e4a-96a6-ed0c71c11fa8',
      id: '7f5bc456-21f2-4e9e-a38f-80baf762b1c5',
      name: 'dim_light',
      parameter: true,
      timestamp: 0
    }, 'devices/{deviceId}/commands', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate config_requests message', () => {
    const validate = validator.validate('devices/config_requests', [{
      timestamp: 0
    }], 'devices/{deviceId}/config_requests', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should validate configs message', () => {
    const validate = validator.validate('devices/configs', {
      configuration: {
        maximum_temperature: 60
      },
      deviceId: 'd44d8a14-5fbb-4e4a-96a6-ed0c71c11fa8',
      version: 2
    }, 'devices/{deviceId}/configs', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate errors message', () => {
    const validate = validator.validate('devices/errors', {
      error: 'command field \'id\' is NOT an UUID',
      messageId: 31248,
      payload: '{\'id\':\'not UUID\',\'status\':\'in_progress\'}',
      topic: 'devices/763c073a-e0ff-41a9-bd51-3386975ea4e3/commands'
    }, 'devices/{deviceId}/errors', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate installations message', () => {
    const validate = validator.validate('devices/installations', {
      buildStamp: 'string',
      description: 'package.gwa-core-v1.1',
      deviceId: 'd44d8a14-5fbb-4e4a-96a6-ed0c71c11fa8',
      fileName: 'gwa-core.tgz',
      id: '763c073a-e0ff-41a9-bd51-3386975ea4e3',
      location: 'http://foo.bar/buzz.xyz',
      signature: '2fd4e1c67a2d28fced849ee1bb76e7391b93eb12',
      signatureType: 'sha-256',
      size: 1048576,
      timestamp: 0,
      type: 'gwa-core-package'
    }, 'devices/{deviceId}/installations', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate measurements message', () => {
    const validate = validator.validate('devices/measurements', [{
      name: 'temperature',
      timestamp: 0,
      value: 36.6
    }], 'devices/{deviceId}/measurements', 'publish')
    expect(validate).toStrictEqual(true)
  })
})
