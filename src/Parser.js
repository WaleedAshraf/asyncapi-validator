const jsrp = require('@apidevtools/json-schema-ref-parser')

class Parser {
  /**
   * @param {string} source
   * @returns {Promise} ref resolved schema object
   */
  async parse(source) {
    try {
      const options = {
        parse: {
          yaml: {
            allowEmpty: false
          },
          text: false,
          binary: false
        },
        dereference: {
          circular: 'ignore'
        }
      }
      const schema = await jsrp.dereference(source, options)
      return schema
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = new Parser()
