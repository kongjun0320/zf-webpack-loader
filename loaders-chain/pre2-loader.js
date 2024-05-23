function loader(sourceCode) {
  console.log('pre2');
  return sourceCode + ' //pre2';
}

loader.pitch = function () {
  console.log('pre2 pitch');
};

module.exports = loader;
