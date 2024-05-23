function loader(sourceCode) {
  console.log('pre1');
  return sourceCode + ' //pre1';
}

loader.pitch = function () {
  console.log('pre1 pitch');
};

module.exports = loader;
