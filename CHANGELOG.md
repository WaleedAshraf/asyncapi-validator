Change Log
==========

Version 4.1.0 *(2024-02-12)*
----------------------------
### New / Improvements:
* Support AsyncAPI schema up to v2.6.0
* Updated [AJV](https://github.com/ajv-validator/) dependency to v8.11.0
* Updated `validateByMessageId()` `validate` method, added support to validate custom field like `x-ack` via `messageField`
* Added `webpack` configuration with bundling to standalone lib - for importing to `J2V8` or `Javet` like libraries
***
### Contributors: 
* [Marek Urban](https://github.com/marek-urban) - [marek.u@unimus.net](mailto:marek.u@unimus.net)

Version 4.0.0 *(2022-05-22)*
----------------------------
### Breaking:
* "should" replaced with "must" in the error messages, as per [in AJV](https://github.com/ajv-validator/ajv/blob/master/docs/v6-to-v8-migration.md#new-features)

### New / Improvements:
* Support AsyncAPI schema v2.4.0
* Added `validateByMessageId()` method, which only requires `key` and `value`. To use this method, your AsyncAPI schema should be >= 2.4.0. `messageId` should be defined in schema as per [AsyncAPI 2.4.0 schema definition](https://www.asyncapi.com/docs/specifications/v2.4.0#messageObject).
* `msgIdentifier` option is only required if you use `.validate()` method.
* You can use both `validateByMessageId()` and `validate()` methods if your AsyncAPI schema version is >= 2.4.0
* Start using `ajv-formats` for custom formats.

Version 3.2.0 *(2022-03-22)*
----------------------------
* Option to provide `path` parameter for relative file ref.

Version 3.1.1 *(2021-09-30)*
----------------------------
* Add TS types
* Fix JSDocs for `fromSource()`

Version 3.1.0 *(2021-08-22)*
----------------------------
* Add support for deserialized objects as source

Version 3.0.0 *(2021-03-20)*
----------------------------
### Breaking:
* Remove support for AsyncAPI Schema v1.2.0
* Remove `._schema` property from instance. Use `.schema` instead.

### New / Improvements:
* `channel`, `operation` and `options.msgIdentifier` are required for validation.
* Add support for OpenAPI formats
* Using @asyncapi/openapi-schema-parser and @asyncapi/parser

Version 2.5.0 *(2020-10-03)*
----------------------------
* Provide `.schema` property on instance, to access ref resolved JSON schema.
* Add deprecation message for AsyncAPI v1.

Version 2.4.5 *(2020-07-16)*
----------------------------
* remove travis integration
* use github actions for testing and coverage report

Version 2.4.4 *(2020-05-29)*
----------------------------
* remove dist folder

Version 2.4.3 *(2020-05-09)*
----------------------------
* bump dependencies
* remove watchify

Version 2.4.2 *(2019-12-20)*
----------------------------
* Fixed validation for schema without components

Version 2.4.1 *(2019-12-03)*
----------------------------
* Updated asyncapi to version 2.6.1 with fix for additionalProps

Version 2.4.0 *(2019-12-01)*
----------------------------
* Support version 2 of AsyncAPI
* Added support for `Channel` and `Operation` validation
* Added support for custom message identifier.

Version 2.3.2 *(2019-09-01)*
----------------------------
* Fixed tests lint

Version 2.3.1 *(2019-09-01)*
----------------------------
* Updated dependencies

Version 2.3.0 *(2019-07-24)*
----------------------------
* Custom error messages
* Updated readme

Version 2.2.1 *(2019-07-18)*
----------------------------
* Added support for options
* Added support for if payload is object and schema is array

Version 2.2.0 *(2019-07-15)*
----------------------------
* Removed parsers/loaders
* Added dist for browsers

Version 2.1.0 *(2019-07-07)*
----------------------------
* Added tests
* Added codecov for coverage report

Version 2.0.1 *(2019-07-06)*
----------------------------
* Better dir structure

Version 2.0.0 *(2019-07-06)*
----------------------------
* Added eslint, travis, better linting
