'use strict';

const assert = require('assert');
const plugin = require('../../');

function mockSchema() {
  return {
    statics: {}
  };
}

describe('Unit Tests', () => {
  let schema;
  beforeEach(() => {
    schema = mockSchema();
  });
  describe('smoketests', () => {
    it('is a function', () => {
      assert.strictEqual(typeof plugin, 'function');
    });

    it('throws an error sans Schema', () => {
      assert.throws(() => {
        plugin();
      }, /MissingSchema: mongoose-cachedbulkinsert requires a schema input/);
    });
  });
  describe('Default Options', () => {
    it('adds a static function named cachedInsert', () => {
      assert.strictEqual(schema.statics.cachedInsert, undefined);
      plugin(schema);
      assert.strictEqual(typeof schema.statics.cachedInsert, 'function');
    });
  });

  describe('Custom Options', () => {
    it('lets you customize the fn name', () => {
      const options = {
        name: 'blargh'
      };
      assert.strictEqual(typeof schema.statics.blargh, 'undefined');
      plugin(schema, options);
      assert.strictEqual(typeof schema.statics.blargh, 'function');
    });
  });
});
