function loader(sourceCode) {
  console.log('normal2');
  return sourceCode + ' //normal2';
}

loader.pitch = function () {
  console.log('normal2 pitch');
};

module.exports = loader;
