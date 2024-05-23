function loader(sourceCode) {
  console.log('post2');
  return sourceCode + ' //post2';
}

loader.pitch = function () {
  console.log('post2 pitch');
};

module.exports = loader;
