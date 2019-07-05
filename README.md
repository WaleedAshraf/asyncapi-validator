# asyncapi-validator
message validator through asyncapi

`npm i asyncapi-validator`


```javascript
let Validator = require('asyncapi-validator')
let va = await Validator.fromSource('./api.yaml')
va.validate('Key', {1:1})
```

Methods:
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
validate(ley, payload)
```

Examples:
```javascript
const AsyncApiValidator = require('./index.js')
let va = await AsyncApiValidator.fromSource('./api.yaml')
va.validate('UserDeleted', {
  userId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
  deletedBy: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
  deletedAt: '2017-01-09T08:27:22.222Z',
})
```
