'use strict';

const { name } = require('./package.json');

module.exports = cachedBulkInsert;

/**
 * allows mongodb insert operations to be defered based on the number
 * of documents cached and/or based on an interval (every n milliseconds).
 *
 * @param {Object} schema - The Mongoose Schema Object.
 * @param {Object} [options] - Options that you want to override.
 * @param {String} [options.name="cachedInsert"] - The name of the Static fn.
 * @param {Number} [options.count=20] - The # of docs to cache before inserting.
 * @param {Array} [options.array=[]] - The Array to hold docs while cached.
 * @param {Number} [options.wait=60000] - The # of ms between interval inserts.
 * @param {Number} [options.cycles=Infinity] - The # of empty intervals before giving up.
 * @param {Function} [options.intervalRes=noOp] - Fn to run on interval insert success.
 * @param {Function} [options.intervalRej=noOp] - Fn to run on interval insert failure.
 */
function cachedBulkInsert(schema, options = {}) {
  if (!schema) {
    throw new Error(`MissingSchema: ${name} requires a schema input`);
  }

  const fnName = options.name || 'cachedInsert';
  const cacheCount = options.count || 20;
  let docsToInsert = options.array || [];
  const wait = options.wait || 60000;
  const cycles = options.cycles || Infinity;
  const intervalRes = options.intervalRes || noOp;
  const intervalRej = options.intervalRej || noOp;
  let emptyIntervals = 0;
  let interval;

  schema.statics[fnName] = async function (document) {
    docsToInsert.push({
      insertOne: {
        document
      }
    });

    if (docsToInsert.length >= cacheCount) {
      const inserting = [...docsToInsert];
      docsToInsert = [];
      return this.bulkWrite(inserting);
    }

    if (!interval) {
      interval = setInterval(async () => {
        const inserting = [...docsToInsert];
        docsToInsert = [];
        let len = inserting.length;
        if (len > 0) {
          await this.bulkWrite(inserting)
            .then(intervalRes)
            .catch(intervalRej);
        } else {
          if (++emptyIntervals > cycles) {
            clearInterval(interval);
          }
        }
      }, wait);
    }
  };
}

/* istanbul ignore next */
function noOp() {

}
