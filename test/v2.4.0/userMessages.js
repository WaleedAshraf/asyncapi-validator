const AsyncApiValidator = require('../../index')

describe('userMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v2.4.0/userMessages.yaml')
  })

  it.only('should validate UserDeleted message', () => {
    const validate = validator.validateByMessageId('UserDeleted', {
      role: 'admin',
      userName: 'user@gmail.com'
    })
    expect(validate).toStrictEqual(true)
  })
})
