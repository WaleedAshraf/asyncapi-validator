![Unit Tests](https://github.com/WaleedAshraf/asyncapi-validator/workflows/Unit%20Tests/badge.svg?branch=master) [![codecov](https://codecov.io/gh/WaleedAshraf/asyncapi-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/WaleedAshraf/asyncapi-validator) ![CodeQL](https://github.com/WaleedAshraf/asyncapi-validator/workflows/CodeQL/badge.svg?branch=master)

# asyncapi-validator

message validator through asyncapi schema

_Note: This package only support AsyncAPI Schema v2.0.0 or above. Since v3.0.0, support for AsyncAPI Schema v1.0.2 has been removed.

`npm i asyncapi-validator`

## Features
- Validate your AsyncApi Document against AsyncApi Schema definition
- Validate your messages against your AsyncApi Document
- Load your AsyncApi Schema from local file or any URL
- Supports AsyncApi in JSON and YAML format
- Supports AsyncAPI v2.0.0 and above
- more coming . . .

## Class Methods

### AsyncApiValidator.fromSource()
```js
/** 
 * Load and Parse the schema from source.
 * @param {string} path - local PATH or URL of schema
 * @param {Object} options - options for validation
 * @returns {Promise}
 */
AsyncApiValidator.fromSource(path, options)
```

#### Options
| value | type | | description |
|-----|----|----|---|
| ignoreArray | boolean | optional | If `true`, then if schema is defined as an array and payload is an object, then payload will be placed inside an array before validation. |
| msgIdentifier | string | required | Name of parameter whose value will be used as `"key"` in `.validate()` method. Recommendation is to use `"name"` as described in [message-object](https://asyncapi.io/docs/specifications/2.0.0/#a-name-messageobject-a-message-object). You can also use [Specification Extensions](https://asyncapi.io/docs/specifications/2.0.0/#specificationExtensions)|

## Instance Methods

### .validate()
```js
/**
 * Method to validate the Payload against schema definition.
 * @param {string} key - required - message key
 * @param {Object} payload - required - payload of the message
 * @param {string} channel - required - name of the channel/topic
 * @param {string} operation - required - publish | subscribe
 * @returns {boolean}
 */
.validate(key, payload, channel, operation)
```

### .schema
`.schema` property can be used to access AsyncAPI schema in JSON format and with all the refs resolved.

## Example usage
Schema
```yaml
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
        x-custom-key: UserDeleted
        payload:
          type: object
          properties:
            userEmail:
              type: string
            userId:
              type: string
```
```js
const AsyncApiValidator = require('asyncapi-validator')
let va = await AsyncApiValidator.fromSource('./api.yaml', {msgIdentifier: 'x-custom-key'})

// validate 'UserDeleted' on channel 'user-events' with operation 'publish'
va.validate('UserDeleted', {
  userId: '123456789',
  userEmail: 'alex@mail.com',
}, 'user-events', 'publish')
```
In above example, `"msgIdentifier"` is `"x-custom-key"`. That is why, `"UserDeleted"` is used as `"key"` in `"va.validate()"` method.

## Errors
Error thrown from asyncapi-validator will have these properties.

| key     | type   | value                   | description                                                                                                     |
|---------|--------|-------------------------|-----------------------------------------------------------------------------------------------------------------|
| name    | string | AsyncAPIValidationError | AsyncAPIValidationError                                                                                         |
| key     | string |                         | "key" of payload against which schema is validated                                                              |
| message | string |                         | [errorsText from AJV](https://github.com/epoberezkin/ajv#errorstextarrayobject-errors--object-options---string) |
| errors  | array  |                         | [Array of errors from AJV](https://github.com/epoberezkin/ajv#validation-errors)                                |

### Error Example
```js
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

## How it works
asyncapi-validator validates the payload of the messages of a certain message, as described in your schema document. To validate against
a certain message, it needs to find the message are you pointing to in schema document. For that, you need to pass it `channel`, `operation`, and `key` of the message.

```js
validate(key, payload, channel, operation)
```

- One `channel` should be defined only once in your whole schema document.
- The `key` should be unique for an `operation` on a `channel`.

That means,
- Messages going to different operations on one channel, can have same `key`.
- Messages going to different channels, can have same `key`
