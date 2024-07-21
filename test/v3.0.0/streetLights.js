const AsyncApiValidator = require('../../index')

describe('deviceMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v3.0.0/streetLights.yml', {
      msgIdentifier: 'name'
    })
  })

  it('should throw error - channel not found', () => {
    const validate = () => validator.validate('hello', {
      type: null
    }, 'lightSent', 'receive')
    expect(validate).toThrowError(new Error('channel "lightSent" not found'))
  })

  it('should throw error - key not found on channel with operation', () => {
    const validate = () => validator.validate('hello', {
      type: null
    }, 'lightingMeasured', 'receive')
    expect(validate).toThrowError(new Error('message with key "hello" on channel "lightingMeasured" and operation "receive" not found'))
  })

  it('should throw error - data should have required property', () => {
    const validate = () => validator.validate('lightMeasured', {
      type: 'null'
    }, 'lightingMeasured', 'receive')
    expect(validate).toThrowError(new Error('data must have required property \'lumens\''))
  })

  it('should not throw error with validate()', () => {
    const validate = validator.validate('lightMeasured', {
      lumens: 0,
      sentAt: '2019-08-24T14:15:22Z'
    }, 'lightingMeasured', 'receive')
    expect(validate).toStrictEqual(true)
  })
})
