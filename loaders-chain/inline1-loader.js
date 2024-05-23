function loader(sourceCode) {
  console.log('inline1', this.age);
  return sourceCode + ' //inline1';
}

loader.pitch = function () {
  console.log('inline1 pitch');
  // return 'let a = 1;';
};

module.exports = loader;
