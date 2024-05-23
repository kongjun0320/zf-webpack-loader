function loader(sourceCode) {
  console.log('post1');
  return sourceCode + ' //post1';
}

loader.pitch = function () {
  console.log('post1 pitch');
};

module.exports = loader;
