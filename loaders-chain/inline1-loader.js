function loader(sourceCode) {
  console.log('inline1', this.age);
  // 如果调用了 async 函数，必须手工调用它返回的 callback 方法才可以继续执行
  // const callback = this.async();
  // callback(null, sourceCode + ' //inline1');

  return sourceCode + ' //inline1';
}

loader.pitch = function () {
  console.log('inline1 pitch');
  // return 'let a = 1;';
};

module.exports = loader;
