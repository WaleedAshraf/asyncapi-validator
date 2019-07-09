'use strict'

const yaml = require('yaml-js')

class YamlParser {
  /**
   * @param {string} yamlString
   * @returns {JSON}
   */
  parse(yamlString) {
    try {
      const parsedYaml = yaml.load(yamlString)
      return parsedYaml
    } catch (e) {
      console.log('error parsing yaml', e.stack)
      throw new Error('Unable to parse.')
    }
  }
}

module.exports = new YamlParser()
