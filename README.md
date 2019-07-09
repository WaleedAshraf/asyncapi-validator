[![Build Status](https://travis-ci.org/WaleedAshraf/asyncapi-validator.svg?branch=master)](https://travis-ci.org/WaleedAshraf/asyncapi-validator) [![codecov](https://codecov.io/gh/WaleedAshraf/asyncapi-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/WaleedAshraf/asyncapi-validator)

# asyncapi-validator

message validator through asyncapi schema

`npm i asyncapi-validator`

## Features
- Validate your AsyncApi Schema against AsyncApi Schema defination
- Validate your messages against your AsyncApi Schema defination
- Use 'bundle.min.js' to run validator in browser
- Load your AsyncApi Schema from local file or any URL
- Supports AsyncApi in JSON and YAML format
- Supports all versions of AsyncAPI
- more coming . . .



## Methods
```javascript
/**
 * @param {String} path - local path or URL of AsyncAPI schema
 * @returns {Promise}
 */
fromSource(path)


/**
 * @param {String} key
 * @param {Object} payload
 */
validate(key, payload)
```

## Examples
```javascript
const AsyncApiValidator = require('asyncapi-validator')
let va = await AsyncApiValidator.fromSource('./api.yaml')

// validate 'UserDeleted' key with payload
va.validate('UserDeleted', {
  userId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
  deletedBy: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
  deletedAt: '2017-01-09T08:27:22.222Z',
})

// validate 'Key' key with payload
va.validate('Key', {1:1})
```
