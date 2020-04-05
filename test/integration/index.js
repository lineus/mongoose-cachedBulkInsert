'use strict';

const assert = require('assert');
const plugin = require('../../');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);
const {Schema, connection } = mongoose;
const URI = 'mongodb://localhost:27017/cachedBulkInsert';
const OPTS = { useNewUrlParser: true, useUnifiedTopology: true };

describe('Integration Tests', function() {
  this.timeout(5000);
  let Test;
  let array = [];
  let quit = { done: false };
  let wait = 60;
  let cycles = 3;
  let lengthCalled = 0;
  let intervalCalled = 0;
  let lengthFailed = 0;
  let intervalFailed = 0;

  let lengthRes = (res) => {
    if (res && res.result) {
      lengthCalled++;
    }
  };

  let lengthRej = () => {
    lengthFailed++;
  };

  let intervalRes = (res) => {
    if (res && res.result) {
      intervalCalled++;
    }
  };

  // let intervalRej = () => {
  //   intervalFailed++;
  // };

  let options = {
    array,
    quit,
    wait,
    cycles,
    intervalRes,
    // intervalRej
  };

  before(async () => {
    await mongoose.connect(URI, OPTS);
    await connection.dropDatabase();
    const schema = new Schema({
      name: String
    });
    schema.plugin(plugin, options);
    Test = mongoose.model('test', schema);
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    lengthCalled = 0;
    intervalCalled = 0;
    lengthFailed = 0;
    intervalFailed = 0;
  });

  after(() => {
    return connection.close();
  });

  it('works when it works', async () => {
    for (let i = 0; i < 100; i++) {
      await Test.cachedInsert({ name: `test${i}` })
        .then(lengthRes)
        .catch(lengthRej);
    }

    for (let i = 0; i < 19; i++) {
      Test.cachedInsert({ name: `test2${i}` });

    }

    await ms(1000);
    let n = await Test.countDocuments();

    assert.strictEqual(lengthCalled, 5);
    assert.strictEqual(intervalCalled, 1);
    assert.strictEqual(lengthFailed, 0);
    assert.strictEqual(intervalFailed, 0);
    assert.strictEqual(n, 119);
  });

  it('works when it doesnt work', async () => {
    await mongoose.disconnect();

    for (let i = 0; i < 100; i++) {
      await Test.cachedInsert({ name: `test${i}` })
        .then(lengthRes)
        .catch(lengthRej);
    }

    for (let i = 0; i < 19; i++) {
      await Test.cachedInsert({ name: `test2${i}` });
    }

    assert.strictEqual(lengthCalled, 0);
    assert.strictEqual(intervalCalled, 0);
    assert.strictEqual(lengthFailed, 5);
    // assert.strictEqual(intervalFailed, 1); figure out a way to test this
  });
});


function ms(n) {
  return new Promise((res) => {
    setTimeout(res, n);
  });
}
