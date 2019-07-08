'use strict'

const yaml = require('yamljs')

class YamlParser {
  /**
   * @param {string} yamlString
   * @returns {JSON}
   */
  parse(yamlString) {
    return yaml.parse(yamlString)
  }
}

module.exports = new YamlParser()
