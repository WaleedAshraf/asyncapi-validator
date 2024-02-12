const MessageValidator = require('./MessageValidator')
const Parser = require('./Parser')
const messageId = 'messageId'

function ValidatorFactory() {
  /**
   * Load schema from provided source
   * @param {string | Object} source URL or file path or an actual JSON / YAML object or string
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
 * @param {{ channels: { [x: string]: { [x in 'publish' | 'subscribe' | undefined]: { message: any; }; }; }; }} schema
 * @param {string} msgIdentifier
 * @returns {{channels: Object, messagesWithId: Object}}
 */
const constructsChannels = (schema, msgIdentifier) => {
  const channels = {}
  let messagesWithId = {}

  Object.keys(schema.channels).forEach(c => {
    const {msgsForOp: publish, msgsForId: msgsForIdPub} = getMessagesForOperation(schema.channels[c], 'publish', msgIdentifier)
    const {msgsForOp: subscribe, msgsForId: msgsForIdSub} = getMessagesForOperation(schema.channels[c], 'subscribe', msgIdentifier)
    channels[c] = {publish, subscribe}
    messagesWithId = {
      ...messagesWithId,
      ...msgsForIdPub,
      ...msgsForIdSub
    }
  })
  return {channels, messagesWithId}
}

/**
 * @param {{ [x in 'publish' | 'subscribe' | undefined]: { message: any; }; }} channel
 * @param {'publish' | 'subscribe'} operation
 * @param {string} msgIdentifier
 * @returns {{msgsForOp: Object, msgsForId: Object}}
 */
const getMessagesForOperation = (channel, operation, msgIdentifier) => {
  const msgsForOp = {}
  const msgsForId = {}
  if (channel[operation]) {
    if (channel[operation].message.oneOf) {
      channel[operation].message.oneOf.forEach(m => {
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

module.exports = new ValidatorFactory()
