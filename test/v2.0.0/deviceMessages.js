const AsyncApiValidator = require('../../index')

describe('deviceMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/deviceMessages.yaml',
      {msgIdentifier: 'name', path: './test/schemas/v2.0.0/'})
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
