const AsyncApiValidator = require('../../index')

describe('deviceMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v3.0.0/streetLightsMini.yml', {
      msgIdentifier: 'x-unique-id'
    })
  })

  it('should validate lightMeasured message', () => {
    const validate = validator.validate('lightMeasured', {
      lumens: 0,
      sentAt: '2019-08-24T14:15:22Z'
    }, 'lightingMeasured', 'send')
    expect(validate).toStrictEqual(true)
  })
})
