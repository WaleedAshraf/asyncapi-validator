const AsyncApiValidator = require('../../index')

describe('deviceMessages', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v3.0.0/pingPong.yml', {
      msgIdentifier: 'name'
    })
  })

  it('should throw error - message not found not found', () => {
    const validate = () => validator.validate('Pong', {
      type: null
    }, 'ping', 'receive')
    expect(validate).toThrowError(new Error('message with key "Pong" on channel "ping" and operation "receive" not found'))
  })

  it('should validate pong', () => {
    const validate = validator.validate('Pong', {
      event: 'pong'
    }, 'pong', 'receive')
    expect(validate).toStrictEqual(true)
  })
})
