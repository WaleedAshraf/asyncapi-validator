# asyncapi-validator
message validator through asyncapi

npm i asyncapi-validator

Example:

```javascript
var Validator = require('asyncapi-validator')

// new Validator(<path>)
// path could be local file or url of AsyncApi schema.
var v = new Validator('./api.yaml')

// v.validate(<key>, <payload>)
v.validate('UserCreated',
  {
    userId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
    createdAt: 'bd58d14f-fd3e-449c-b60c-a56548190d69',
  }
)

```
