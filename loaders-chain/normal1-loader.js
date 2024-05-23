function loader(sourceCode) {
  console.log('normal1');
  return sourceCode + ' //normal1';
}

loader.pitch = function () {
  console.log('normal1 pitch');
};

module.exports = loader;
