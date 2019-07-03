# asyncapi-validator
message validator through asyncapi

`npm i asyncapi-validator`


```javascript
let Validator = require('asyncapi-validator')
let validator = await Validator.loadFromFile('./api.yaml')
validator.validate('Key', {1:1})
```

Methods:
```javascript
loadFromFile('./api.yaml')
loadFromUrl('https://example.com/api.yml')
```

Example:
```javascript
v.validate('UserCreated',
  {
    userId: 'bd58d14f-fd3e-449c-b60c-a56548190d68',
    createdAt: 'bd58d14f-fd3e-449c-b60c-a56548190d69',
  }
)
```
