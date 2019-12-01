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
 * @param {String} path - local path or URL of schema
 * @param {Object} options - options for validation
 * @returns {Promise}
 */
fromSource(path, options)


/**
 * @param {String} key - message key
 * @param {Object} payload - payload of the message
 * @param {string} channel - name of the channel/topic
 * @param {string} operation - publish | subscribe (required with channel validation)
 * @returns {boolean}
 */
validate(key, payload, channel, operation)
```

## Options
| value | type | | description |
|-----|----|----|---|
| ignoreArray | boolean | optional | If true, then if schema is defined as an array and payload is an object, then payload will be placed inside an array before validation. |
| msgIdentifier | string | required with channel validation | Name of parameter whose value will be used as `"key"` in `.validate()` method. Normally it is `"name"` as described in [message-object](https://asyncapi.io/docs/specifications/2.0.0/#a-name-messageobject-a-message-object). You can also use [Specification Extensions](https://asyncapi.io/docs/specifications/2.0.0/#specificationExtensions)|

_Note: 'channel' validation with 'msgIdentifier' and 'operation' is only supported with AsyncAPI Version >= 2.0.0_

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

## Example with Channel validation
Example Schema
```
asyncapi: 2.0.0

info:
  title: User Events
  version: 1.0.0

channels:
  user-events:
    description: user related events
    publish:
      message:
        name: UserDeletedMessage
        x-custome-key: UserDeleted
        payload:
          type: object
          properties:
            userEmail:
              type: string
            userId:
              type: string
```
```javascript
const AsyncApiValidator = require('asyncapi-validator')
let va = await AsyncApiValidator.fromSource('./api.yaml', {msgIdentifier: 'x-custom-key'})

// validate 'UserDeleted' on channel 'user-events' with operation 'publish'
va.validate('UserDeleted', {
  userId: '123456789',
  userEmail: 'alex@mail.com',
}, 'user-events', 'publish')
```
In above example, `"msgIdentifier"` is `"x-custom-key"`. That's why, `"UserDeleted"` has been use as `"key"` in `"va.validate()"`

## Errors
Error thrown from asyncapi-validator will have these properties.

| key     | type   | value                   | description                                                                                                     |
|---------|--------|-------------------------|-----------------------------------------------------------------------------------------------------------------|
| name    | string | AsyncAPIValidationError | AsyncAPIValidationError                                                                                         |
| key     | string |                         | "key" of payload against which schema is validated                                                              |
| message | string |                         | [errorsText from AJV](https://github.com/epoberezkin/ajv#errorstextarrayobject-errors--object-options---string) |
| errors  | array  |                         | [Array of errors from AJV](https://github.com/epoberezkin/ajv#validation-errors)                                |

### Error Example
```
{
  AsyncAPIValidationError: data.type should be equal to one of the allowed values at MessageValidator.validate (.....
  name: 'AsyncAPIValidationError',
  key: 'hello',
  errors:
    [
      { keyword: 'enum',
        dataPath: '.type',
        schemaPath: '#/properties/type/enum',
        params: [Object],
        message: 'should be equal to one of the allowed values'
      }
    ]
}
```
