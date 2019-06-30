# asyncapi-validator
message validator through asyncapi

`npm i asyncapi-validator`


```javascript
var Validator = require('asyncapi-validator')
var v = new Validator('./api.yaml')
v.validate('Key', {1:1})
```

Defination:
```javascript
/**
 * @param {String} path - local path or url of AsyncAPI schema (yaml or JSON)
 * @param {String} options - optional
 * @param {Object} callback - optional
 * @return {Validator} Validator instance
 */
constructor Validator(<path>, <options>, <callback>)
```

Methods:
```javascript
var v = new Validator('./api.yaml')

v.path // ./api.yaml
v.schema // JSON formated AsyncAPI schema
v.asyncapi // AsyncApi schema defination
v.validator // ojbect with all validation resolved

```

Example:
```javascript
/**
 * @param {String} path - local path or url of AsyncAPI schema (yaml or JSON)
 * @param {String} key - key to validate payload against
 * @param {Object} payload - payload of message
 */
v.validate('UserCreated',
  {
    userId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
    createdAt: 'bd58d14f-fd3e-449c-b60c-a56548190d69',
  }
)

```
