const YAML_EXTENSIONS = ['.yml', '.yaml']

module.exports = {
  isJson(extension) {
    return extension === '.json'
  },

  isYaml(extension) {
    return YAML_EXTENSIONS.includes(extension)
  }
}
