import assert from 'assert';
import stem from './stemmer.js';

['spoiler', 'spoilers', 'spoiling'].forEach((word) => {
  assert.strictEqual(stem(word), 'spoil', `${word} should stem to spoil`);
});

console.log('Stemmer test passed');