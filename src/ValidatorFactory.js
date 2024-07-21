const MessageValidator = require('./MessageValidator')
const Parser = require('./Parser')
const messageId = 'messageId'

function ValidatorFactory() {
  /**
   * Load schema from provided source
   * @param {string | Object} source
   * @param {{ msgIdentifier?: string; ignoreArray?: boolean; path?: any; }} [options] - options for validations
   * @returns {Promise<MessageValidator>}
   */
  this.fromSource = async (source, options = {}) => {
    const {_json: schema} = await Parser.parse(source, options)
    const {channels, messagesWithId} = constructsChannels(schema, options.msgIdentifier)
    return new MessageValidator(schema, options, channels, messagesWithId)
  }
}

/**
 * Constructs channels and messages with identifiers from the given schema.
 * @param {object} schema - The schema object.
 * @param {string} [msgIdentifier=''] - The message identifier.
 * @returns {object} - An object containing the constructed channels and messages with identifiers.
 */
const constructsChannels = (schema, msgIdentifier = '') => {
  const channels = {}
  const messagesWithOperations = {}
  let messagesWithId = {}

  if (schema.operations) {
    Object.keys(schema.operations).forEach(operation => {
      const channel = schema.operations[operation].channel['x-parser-unique-object-id']
      messagesWithOperations[channel] = messagesWithOperations[channel] ? messagesWithOperations[channel].push(operation) : [operation]
    })
  }

  Object.keys(schema.channels).forEach(c => {
    // For AsyncAPI 2.x.x
    const operations = ['publish', 'subscribe']
    operations.forEach(operation => {
      const {msgsForOp, msgsForId} = getMessagesForOperation(schema.channels[c], operation, msgIdentifier)
      if (Object.keys(msgsForOp).length) {
        channels[c] = {
          ...channels[c],
          [operation]: msgsForOp
        }
      }
      messagesWithId = {
        ...messagesWithId,
        ...msgsForId
      }
    })

    // For AsyncAPI 3.x.x
    if (messagesWithOperations[c] && messagesWithOperations[c].length) {
      messagesWithOperations[c].forEach(operation => {
        const {action, messages} = getMessagesByOperations(schema.operations, operation, msgIdentifier)
        channels[c] = {
          ...channels[c],
          [action]: messages
        }
      })
    }
  })
  return {channels, messagesWithId}
}

/**
 * @param { any } channel
 * @param {string} operation - The operation for which to create a validator.
 *                             - 'publish' for publishing messages
 *                             - 'subscribe' for subscribing to topics
 * @param {string} msgIdentifier
 * @returns
 */
const getMessagesForOperation = (channel, operation, msgIdentifier) => {
  const msgsForOp = {}
  const msgsForId = {}
  if (channel[operation]) {
    if (channel[operation].message.oneOf) {
      channel[operation].message.oneOf.forEach((m) => {
        if (m[msgIdentifier]) msgsForOp[m[msgIdentifier]] = m
        if (m[messageId]) msgsForId[m[messageId]] = m
      })
    } else {
      const tempMsg = channel[operation].message
      if (tempMsg[msgIdentifier]) msgsForOp[tempMsg[msgIdentifier]] = tempMsg
      if (tempMsg[messageId]) msgsForId[tempMsg[messageId]] = tempMsg
    }
  }
  return {msgsForOp, msgsForId}
}

const getMessagesByOperations = (operations, operation, msgIdentifier) => {
  const messages = {}
  const action = operations[operation].action
  operations[operation].messages.forEach(message => {
    messages[message[msgIdentifier]] = message
  })

  return {action, messages}
}

module.exports = new ValidatorFactory()
