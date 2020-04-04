'use strict';

const assert = require('assert');
const plugin = require('../../');

describe('mongoose-cachedBulkInsert', () => {
  describe('smoketests', () => {
    it('is a function', () => {
      assert.strictEqual(typeof plugin, 'function')
    })
  })
})