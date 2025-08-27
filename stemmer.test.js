const assert = require('assert');

function stem(word) {
  word = word.toLowerCase();
  if (word.endsWith('s') && word.length > 1) {
    word = word.slice(0, -1);
  }
  for (const suffix of ['ing', 'er', 'ed']) {
    if (word.endsWith(suffix)) {
      word = word.slice(0, -suffix.length);
    }
  }
  return word;
}

const keywords = ['spoiler'].map(stem);
['spoilers', 'spoiling'].forEach((sample) => {
  const tokens = sample.toLowerCase().split(/\W+/).map(stem);
  assert(tokens.some((t) => keywords.includes(t)), `${sample} should match spoiler`);
});

console.log('Stemmer test passed: spoiler matches spoilers and spoiling');