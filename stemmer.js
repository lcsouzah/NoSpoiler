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

module.exports = stem;