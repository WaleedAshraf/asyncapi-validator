![Unit Tests](https://github.com/WaleedAshraf/asyncapi-validator/workflows/Unit%20Tests/badge.svg?branch=master) [![codecov](https://codecov.io/gh/WaleedAshraf/asyncapi-validator/branch/master/graph/badge.svg)](https://codecov.io/gh/WaleedAshraf/asyncapi-validator) ![CodeQL](https://github.com/WaleedAshraf/asyncapi-validator/workflows/CodeQL/badge.svg?branch=master)

# asyncapi-validator

Message validator through AsyncAPI schema

_Note: This package only support AsyncAPI Schema v2.0.0 and above. Since v3.0.0, support for older versions of AsyncAPI Schema has been removed.

`npm i asyncapi-validator`

## Features
- Validate your messages against your AsyncApi Document
- Validate your AsyncApi Document against AsyncApi Schema definition
- Load your AsyncApi Schema from local file or any URL
- Supports AsyncApi in JSON and YAML format
- Supports AsyncAPI v2.0.0 and above

## Content
- [Class Methods](#class-methods)
  - [AsyncApiValidator.fromSource()](#asyncapivalidatorfromsource)
    - [Options](#options)
- [Instance Methods / Properties](#instance-methods--properties)
  - [.validateByMessageId()](#validateByMessageId)
  - [.validate()](#validate)
  - [.schema](#schema)
- [Example usage with .validateByMessageId() method](#example-usage-with-validatebymessageid-method)
- [Example usage with .validate() method](#example-usage-with-validate-method)
- [Errors](#errors)
  - [Error Example](#error-example)

## Class Methods

### AsyncApiValidator.fromSource()
```js
/** 
 * Load and Parse the schema from source.
 * @param {string | Object} source - local PATH or URL of schema or schema Object
 * @param {Object} options - options for validation
 * @returns {Promise}
 */
AsyncApiValidator.fromSource(source, options)
```

#### Options
| value | type | | description |
|-----|----|----|---|
| ignoreArray | boolean | optional | If `true`, then if schema is defined as an array and payload is an object, then payload will be placed inside an array before validation. |
| msgIdentifier | string | optional (required only if you use .validate() method) | Name of the parameter whose value will be used as `"key"` in `.validate()` method. Recommendation is to use `"name"` as described in [message-object](https://asyncapi.io/docs/specifications/2.0.0/#a-name-messageobject-a-message-object). You can also use [Specification Extensions](https://asyncapi.io/docs/specifications/2.0.0/#specificationExtensions). |
| path | string | optional |  Path to the AsyncAPI document. It will be used to resolve relative references. Defaults to current working dir. As [used in asyncapi-parser](https://github.com/asyncapi/parser-js/blob/master/lib/parser.js#L41) |

## Instance Methods / Properties

### .validateByMessageId()

Here `messageId` should be as [defined in AsyncAPI Schema v2.4.0](https://www.asyncapi.com/docs/specifications/v2.4.0#messageObject). To use this method, your AsyncAPI Schema version should be >= v2.4.0.

```js
/**
 * Method to validate the Payload against schema definition.
 * @param {string} key - required - messageId
 * @param {Object} payload - required - payload of the message
 * @returns {boolean}
 */
.validateByMessageId(key, payload)
```

### .validate()

To use this method for validation, you should provide `msgIdentifier` in AsyncApiValidator `options`.

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

## Example usage with .validateByMessageId() method
Schema
```yaml
asyncapi: 2.4.0

info:
  title: User Events
  version: 1.0.0

channels:
  user-events:
    description: user related events
    publish:
      message:
        messageId: UserRemoved
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
let va = await AsyncApiValidator.fromSource('./api.yaml')

// validate messageId 'UserRemoved'
va.validateByMessageId('UserRemoved', {
  userId: '123456789',
  userEmail: 'alex@mail.com',
})
```

## Example usage with .validate() method
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
| message | string |                         | [errorsText from AJV](https://ajv.js.org/api.html#ajv-errorstext-errors-object-options-object-string) |
| errors  | array  |                         | [Array of errors from AJV](https://ajv.js.org/api.html#validation-errors)                                |

### Error Example
```js
{
  AsyncAPIValidationError: data.type must be equal to one of the allowed values at MessageValidator.validate (.....
  name: 'AsyncAPIValidationError',
  key: 'hello',
  errors:
    [
      { keyword: 'enum',
        dataPath: '.type',
        schemaPath: '#/properties/type/enum',
        params: [Object],
        message: 'must be equal to one of the allowed values'
      }
    ]
}
```

