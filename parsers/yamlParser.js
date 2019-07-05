'use strict'

const yaml = require('yamljs')

class YamlParser {
  parse(yamlString) {
    return yaml.parse(yamlString)
  }
}

module.exports = new YamlParser()