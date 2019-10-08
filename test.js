var text = 'This is my text decription';

var record = {
  "recordId": 0,
  "data": {
      "descriptions": [
          {
              "value": "description",
              "description": ""
          }
      ]
  },
  "errors": [],
  "warnings": []
}


record.data.descriptions[0].description = text;

console.log(JSON.stringify(record));

