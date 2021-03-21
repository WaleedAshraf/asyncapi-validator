const AsyncApiValidator = require('../../index')

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
