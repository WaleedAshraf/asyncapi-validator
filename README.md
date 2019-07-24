[![Build Status](https://travis-ci.org/WaleedAshraf/asyncapi-validator.svg?branch=master)](https://travis-ci.org/WaleedAshraf/asyncapi-validator) [![codecov](https://codecov.io/gh/WaleedAshraf/asyncapi-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/WaleedAshraf/asyncapi-validator)

# asyncapi-validator

message validator through asyncapi schema

`npm i asyncapi-validator`

## Features
- Validate your AsyncApi Schema against AsyncApi Schema definition
- Validate your messages against your AsyncApi Schema definition
- Use 'bundle.min.js' to run validator in browser
- Load your AsyncApi Schema from local file or any URL
- Supports AsyncApi in JSON and YAML format
- Supports all versions of AsyncAPI
- more coming . . .



## Methods
```javascript
/**
 * @param {String} path - local path or URL of AsyncAPI schema
 * @param {Object} options - options for validation
 * @returns {Promise}
 */
fromSource(path, options)


/**
 * @param {String} key
 * @param {Object} payload
 */
validate(key, payload)
```

## Options
| value       | type    | description                                                                                                                             |   |
|-------------|---------|-----------------------------------------------------------------------------------------------------------------------------------------|---|
| ignoreArray | boolean | If true, then if schema is defined as an array and payload is an object, then payload will be placed inside an array before validation. |   |

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

## Errors
| key     | type   | value                   | description                                                                                                     |
|---------|--------|-------------------------|-----------------------------------------------------------------------------------------------------------------|
| name    | string | AsyncAPIValidationError | AsyncAPIValidationError                                                                                         |
| key     | string |                         | "key" of payload against which schema is validated                                                              |
| message | string |                         | [errorsText from AJV](https://github.com/epoberezkin/ajv#errorstextarrayobject-errors--object-options---string) |
| errors  | array  |                         | [Array of errors from AJV](https://github.com/epoberezkin/ajv#validation-errors)                                |
