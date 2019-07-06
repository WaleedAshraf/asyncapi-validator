'use strict'

class JsonParser {
  /**
   * @param {string} jsonString
   * @returns {JSON}
   */
  parse(jsonString) {
    return JSON.parse(jsonString)
  }
}

module.exports = new JsonParser()
