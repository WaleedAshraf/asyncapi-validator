const ValidationError = require('./ValidationError')
const MessageValidator = require('./MessageValidator')
const Parser = require('./Parser')

function ValidatorFactory() {
  /**
   * @param {string} source
   * @param {{ msgIdentifier: string ; ignoreArray?: boolean ; path?: string }} options
   * @returns {Promise<MessageValidator>}
   */
  this.fromSource = async (source, options) => {
    const {_json: schema} = await Parser.parse(source, options)
    if (!options || !options.msgIdentifier) {
      throw new ValidationError('"msgIdentifier" is required')
    }
    const channels = constructsChannels(schema, options.msgIdentifier)
    return new MessageValidator(schema, options, channels)
  }
}

/**
 * @param {{ channels: { [x: string]: { [x in 'publish' | 'subscribe' | undefined]: { message: any; }; }; }; }} schema
 * @param {string} msgIdentifier
 */
const constructsChannels = (schema, msgIdentifier) => {
  const channels = {}

  Object.keys(schema.channels).forEach(c => {
    const publish = getMessagesForOperation(schema.channels[c], 'publish', msgIdentifier)
    const subscribe = getMessagesForOperation(schema.channels[c], 'subscribe', msgIdentifier)

    channels[c] = {publish, subscribe}
  })
  return channels
}

/**
 * @param {{ [x in 'publish' | 'subscribe' | undefined]: { message: any; }; }} channel
 * @param {'publish' | 'subscribe'} operation
 * @param {string} msgIdentifier
 * @returns {Object} messages
 */
const getMessagesForOperation = (channel, operation, msgIdentifier) => {
  const messages = {}
  if (channel[operation]) {
    if (channel[operation].message.oneOf) {
      channel[operation].message.oneOf.forEach(m => {
        if (!m[msgIdentifier]) {
          throw new ValidationError(`msgIdentifier "${msgIdentifier}" does not exist`, null, JSON.stringify(m))
        }
        messages[m[msgIdentifier]] = m
      })
    } else {
      const tempMsg = channel[operation].message
      if (!tempMsg[msgIdentifier]) {
        throw new ValidationError(`msgIdentifier "${msgIdentifier}" does not exist`, null, JSON.stringify(tempMsg))
      }
      messages[tempMsg[msgIdentifier]] = tempMsg
    }
  }
  return messages
}

module.exports = new ValidatorFactory()
