# mongoose-cachedBulkInsert
Insert docs into your collection every *n* documents and/or every *n* seconds. (**n** is up to you!)

[![Build Status](https://travis-ci.org/lineus/mongoose-cachedBulkInsert.svg?branch=master)](https://travis-ci.org/lineus/mongoose-cachedBulkInsert)
[![Coverage Status](https://coveralls.io/repos/github/lineus/mongoose-cachedBulkInsert/badge.svg?branch=master)](https://coveralls.io/github/lineus/mongoose-cachedBulkInsert?branch=master)

## Usage

### test.js
```js
#!/usr/bin/env node
'use strict';

const mongoose = require('mongoose');
const { Schema, connection} = mongoose;
const cachedBulkInsert = require('mongoose-cachedbulkinsert');
const DB = 'test';
const URI = `mongodb://localhost:27017/${DB}`;
const OPTS = { useNewUrlParser: true, useUnifiedTopology: true };

const schema = new Schema({
  name: String
});

let array = [];

const pluginOptions = {
  array,
  wait: 5000,
  cycles: 3,
  intervalRes: (res) => {
    if (res && res.insertedCount) {
      console.log(`intervalBasedInsert: ${res.insertedCount}`);
    }
  }
};

schema.plugin(cachedBulkInsert, pluginOptions);

const Test = mongoose.model('test', schema);

async function run() {
  await mongoose.connect(URI, OPTS);
  await connection.dropDatabase();

  for (let i = 0; i < 100; i++) {
    await Test.cachedInsert({ name: `test${i}` })
      .then(res => {
        if (res && res.insertedCount) {
          console.log(`lengthBasedInsert: ${res.insertedCount}`);
        }
      });
  }

  for (let i = 0; i < 19; i++) {
    await Test.cachedInsert({ name: `test2${i}` });
  }

  await forMS(6000);

  await connection.close();
}

run();

function forMS(n) {
  return new Promise(res => {
    setTimeout(res, n);
  });
}
```
### Output
```
$ ./test.js
lengthBasedInsert: 20
lengthBasedInsert: 20
lengthBasedInsert: 20
lengthBasedInsert: 20
lengthBasedInsert: 20
intervalBasedInsert: 19
$
```