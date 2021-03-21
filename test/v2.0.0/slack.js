const AsyncApiValidator = require('../../index')

describe.only('slack', () => {
  let validator
  beforeEach(async () => {
    validator = await AsyncApiValidator.fromSource('./test/schemas/v2.0.0/slack.yml', {msgIdentifier: 'name'})
  })

  it('should validate outgoingMessage message', () => {
    const validate = validator.validate('outgoingMessage', {
      id: 0,
      type: 'message',
      channel: 'string',
      text: 'string'
    }, '/', 'publish')
    expect(validate).toStrictEqual(true)
  })

  it('should validate botChanged message', () => {
    const validate = validator.validate('botChanged', {
      type: 'bot_added',
      bot: {
        id: 'string',
        app_id: 'string',
        name: 'string',
        icons: {
          property1: 'string',
          property2: 'string'
        }
      }
    }, '/', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate channelDeleted message', () => {
    const validate = validator.validate('channelDeleted', {
      type: 'channel_deleted',
      channel: 'string'
    }, '/', 'subscribe')
    expect(validate).toStrictEqual(true)
  })

  it('should validate message', () => {
    const validate = validator.validate('message', {
      type: 'message',
      user: 'string',
      channel: 'string',
      text: 'string',
      ts: 'string',
      attachments: [
        {
          fallback: 'string',
          color: 'string',
          pretext: 'string',
          author_name: 'string',
          author_link: 'http://example.com',
          author_icon: 'http://example.com',
          title: 'string',
          title_link: 'http://example.com',
          text: 'string',
          fields: [
            {
              title: 'string',
              value: 'string',
              short: true
            }
          ],
          image_url: 'http://example.com',
          thumb_url: 'http://example.com',
          footer: 'string',
          footer_icon: 'http://example.com',
          ts: 0
        }
      ],
      edited: {
        user: 'string',
        ts: 'string'
      }
    }, '/', 'subscribe')
    expect(validate).toStrictEqual(true)
  })
})
