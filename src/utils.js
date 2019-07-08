const YAML_EXTENSIONS = ['.yml', '.yaml']

module.exports = {
  /**
   * @param {string} extension
   * @returns {boolean}
   */
  isJson(extension) {
    return extension === '.json'
  },

  /**
   * @param {string} extension
   * @returns {boolean}
   */
  isYaml(extension) {
    return YAML_EXTENSIONS.includes(extension)
  }
}
