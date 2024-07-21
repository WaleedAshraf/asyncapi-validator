![Unit Tests](https://github.com/WaleedAshraf/asyncapi-validator/workflows/Unit%20Tests/badge.svg) [![codecov](https://codecov.io/gh/WaleedAshraf/asyncapi-validator/graph/badge.svg?token=QlYEl26MvM)](https://codecov.io/gh/WaleedAshraf/asyncapi-validator) ![CodeQL](https://github.com/WaleedAshraf/asyncapi-validator/workflows/CodeQL/badge.svg)

# asyncapi-validator

Validate messages through AsyncApi

_Note: This package only support AsyncApi Schema v2.0.0 and above._

`npm i asyncapi-validator`

## Features
- Validate your messages against your AsyncApi Document
- Validate your AsyncApi Document against AsyncApi Schema definition
- Load your AsyncApi Schema from local file or any URL
- Supports AsyncApi in JSON and YAML format
- Supports AsyncApi v2.0.0 and above

## Content
- [Class Methods](#class-methods)
  - [AsyncApiValidator.fromSource()](#asyncapivalidatorfromsource)
    - [Options](#options)
- [Instance Methods / Properties](#instance-methods--properties)
  - [.validate()](#validate)
  - [.validateByMessageId()](#validateByMessageId) - _deprecated_
  - [.schema](#schema)
- [Example usage with .validate() method](#example-usage-with-validate-method)
- [Example usage with .validateByMessageId() method](#example-usage-with-validatebymessageid-method)
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
| msgIdentifier | string | required | Name of the parameter whose value will be used as `"key"` in `.validate()` method. Recommendation is to use `"name"` as described in [message-object](https://www.asyncapi.com/docs/reference/specification/v3.0.0#messageObject). You can also use [Specification Extensions](https://www.asyncapi.com/docs/reference/specification/v3.0.0#specificationExtensions). |
| ignoreArray | boolean | optional | If `true`, then if schema is defined as an array and payload is an object, then payload will be placed inside an array before validation. |
| path | string | optional |  Path to the AsyncApi document. |

## Instance Methods and Properties

### .validate()

You should provide `msgIdentifier` in AsyncApiValidator `options`.

```js
/**
 * Method to validate the Payload against schema definition.
 * @param {string} key - required - message key (as per msgIdentifier)
 * @param {Object} payload - required - payload of the message
 * @param {string} channel - required - name of the channel/topic
 * @param {string} operation - required - publish | subscribe | send | receive
 * @returns {boolean}
 */
.validate(key, payload, channel, operation)
```

### .validateByMessageId() - deprecated
_This method is deprecated as `messageId` was removed in AsyncApi v3.0.0. More details here [asyncapi/spec/issues/978](https://github.com/asyncapi/spec/issues/978) ._

Here `messageId` should be as [defined in AsyncApi Schema v2.4.0](https://www.asyncapi.com/docs/specifications/v2.4.0#messageObject). To use this method, your AsyncApi Schema version should be >= v2.4.0 and <3.0.0.

```js
/**
 * Method to validate the Payload against schema definition.
 * @param {string} key - required - messageId
 * @param {Object} payload - required - payload of the message
 * @returns {boolean}
 */
.validateByMessageId(key, payload)
```

### .schema
`.schema` property can be used to access AsyncApi schema in JSON format and with all the refs resolved.

## Example usage with .validate() method
Schema
```yaml
asyncapi: 3.0.0
info:
  title: Streetlights Kafka API
  version: 1.0.0
channels:
  lightingMeasured:
    messages:
      lightMeasured:
        $ref: '#/components/messages/lightMeasured'
operations:
  sendLightMeasurement:
    action: send
    channel:
      $ref: '#/channels/lightingMeasured'
    messages:
      - $ref: '#/channels/lightingMeasured/messages/lightMeasured'
components:
  messages:
    lightMeasured:
      x-unique-id: lightMeasured
      payload:
        $ref: '#/components/schemas/lightMeasuredPayload'
  schemas:
    lightMeasuredPayload:
      type: object
      properties:
        lumens:
          type: integer
          minimum: 0
          description: Light intensity measured in lumens.
```
```js
const AsyncApiValidator = require('asyncapi-validator')
let va = await AsyncApiValidator.fromSource('./api.yaml', {msgIdentifier: 'x-unique-id'})

// validate 'lightMeasured' on channel 'lightingMeasured' with operation 'send'
va.validate('lightMeasured', {
  lumens: 0,
  sentAt: '2019-08-24T14:15:22Z'
}, 'lightingMeasured', 'send')
```
In above example, `"msgIdentifier"` is `"'x-unique-id"`. That is why, `"lightMeasured"` is used as `"key"` in `"va.validate()"` method.

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

