'use strict'
console.log('process.env.TRAVIS_BUILD_DIR', process.env.TRAVIS_BUILD_DIR)
const AsyncApiValidatorFactory = require('./src/AsyncApiValidatorFactory')
module.exports = new AsyncApiValidatorFactory()
