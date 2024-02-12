# asyncapi-validator
_**Because this package is a fork of [asyncapi-validator](https://github.com/WaleedAshraf/asyncapi-validator), 
it is not publicly deployed and available on the global NPM repository. 
In our case, our need was to use this modified bundled version `dist/bundle.js`
as a sub-lib into our `Java` environment under the `V8` engine like `J2V8`, therefore it's not planned
to make this modification as a part of an official release.**_

_However, this might change in a future
by making pull-request to [asyncapi-validator](https://github.com/WaleedAshraf/asyncapi-validator), if 
all changes are suitable for both parties._
***

Message validator through AsyncAPI schema with support for Socket.IO `x-ack` message response.

_Note: This package only support AsyncAPI Schema v2.0.0 and above._

## Features
- Validate your messages against your AsyncApi Document
- Validate your AsyncApi Document against AsyncApi Schema definition
- Load your AsyncApi Schema from local file or any URL
- Parse AsyncApi Schema from String or Object directly
- Supports AsyncApi in JSON and YAML format
- Supports AsyncAPI v2.0.0 and above
- Supports Socket.Io format with an `x-ack` message response

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
 * @param {string | Object} source - URL or file PATH or an actual JSON / YAML object or string
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
 * @param {string} messageField - default is 'payload', for socket.io ACK response this can be 'x-ack'
 * @returns {boolean}
 */
.validateByMessageId(key, payload, messageField = 'payload')
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
 * @param {string} messageField - default is 'payload', for socket.io ACK response this can be 'x-ack'
 * @returns {boolean}
 */
.validate(key, payload, channel, operation, messageField = 'payload')
```

### .schema
`.schema` property can be used to access AsyncAPI schema in JSON format and with all the refs resolved.

## Example usage with .validateByMessageId() method for Socket.IO Schema
Schema
```yaml
asyncapi: 2.6.0

info:
  title: AsyncAPI Socket.IO example
  version: 1.0.0

channels:
  user-events:
    description: user related events
    publish:
      message:
        name: create
        messageId: test_create
        payload:
          $ref: '#/components/schemas/CreateRequest'
        x-ack:
          $ref: '#/components/schemas/CreateResponse'
components:
  schemas:
    CreateRequest:
      $id: 'CreateRequest'
      type: object
      additionalProperties: false
      properties:
        data:
          type: array
          additionalItems: false
          items:
            type: string
      required:
        - data
    CreateResponse:
      $id: 'CreateResponse'
      type: object
      additionalProperties: false
      properties:
        successful:
          type: boolean
        data:
          type: array
          additionalItems: false
          items:
            type: string
      required:
        - successful
        - data
```
```js
const AsyncApiValidator = require('./src/ValidatorFactory.js')
let va = await AsyncApiValidator.fromSource('./api.yaml')

// validate x-ack response
va.validateByMessageId('CreateRequest', {
  data: ['someVal'],
})

// validate x-ack response
va.validateByMessageId('CreateResponse', {
  successful: true,
  data: ['someVal']
}, 'x-ack')

// validate or use .validate() method
va.validate('CreateResponse', {
  successful: true,
  data: ['someVal']
}, 'user-events', 'publish', 'x-ack')
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
const AsyncApiValidator = require('./src/ValidatorFactory.js')
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
  AsyncAPIValidationError: 'data.type must be equal to one of the allowed values at MessageValidator.validate (.....',
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

