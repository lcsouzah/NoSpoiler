const assert = require('assert');
const stem = require('./stemmer');

['spoiler', 'spoilers', 'spoiling'].forEach((word) => {
  assert.strictEqual(stem(word), 'spoil', `${word} should stem to spoil`);
});

console.log('Stemmer test passed');