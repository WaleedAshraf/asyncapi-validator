const AsyncApiValidator = require('../../index')

describe('deviceMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v3.0.0/streetLightsMultiMsg.yml', {
      msgIdentifier: 'name'
    })
  })

  it('should validate lightMeasured with channel lightTurnOff', () => {
    const validate = validator.validate('turnOnOff', {
      command: 'on',
      sentAt: '2019-08-24T14:15:22Z'
    }, 'lightTurnOff', 'send')
    expect(validate).toStrictEqual(true)
  })

  it('should throw error for channel which is not used in any operation', () => {
    const validate = () => validator.validate('turnOnOff', {
      command: 'on',
      sentAt: '2019-08-24T14:15:22Z'
    }, 'lightTurnOn', 'send')
    expect(validate).toThrowError(new Error('channel "lightTurnOn" not found'))
  })
})
