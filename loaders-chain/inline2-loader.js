function loader(sourceCode) {
  console.log('inline2');
  return sourceCode + ' //inline2';
}

loader.pitch = function () {
  console.log('inline2 pitch');
};

module.exports = loader;
