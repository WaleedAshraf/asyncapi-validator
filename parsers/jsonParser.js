'use strict'

class JsonParser {
  parse(jsonString) {
    return JSON.parse(jsonString)
  }
}

module.exports = new JsonParser()