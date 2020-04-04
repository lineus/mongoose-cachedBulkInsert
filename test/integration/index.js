'use strict';

const assert = require('assert')
const plugin = require('../../')
const mongoose = require('mongoose')
const {Schema} = mongoose;

describe('Integrate Boy, I say INTEGRATE!', () => {
  it('s all good', () => {
    assert.doesNotThrow(() => {
      const schema = new Schema({});
      schema.plugin(plugin)
    })
  })
})