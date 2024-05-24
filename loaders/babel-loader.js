const babel = require('@babel/core');

function loader(sourceCode, inputSourceMap, inputAst) {
  // 正在处理的文件的绝对路径
  const filename = this.resourcePath;
  // 获取配置文件中的 options
  // const userOptions = this.getOptions();
  const options = {
    filename,
    inputSourceMap, // 指定输入代码的 sourceMap
    sourceMaps: true, // 生成 sourceMap
    sourceFileName: filename, // 指定编译后的文件所属的文件名
    ast: true, // 生成 AST
  };
  const config = babel.loadPartialConfig(options);
  if (config) {
    // const result = babel.transformSync(sourceCode, config.options);
    // //  result.code: 转译后的代码 result.map: sourceMap 映射文件 result.ast: 抽象语法树
    // this.callback(null, result.code, result.map, result.ast);
    babel.transformAsync(sourceCode, config.options, (err, result) => {
      if (err) {
        this.callback(err);
      } else {
        this.callback(null, result.code, result.map, result.ast);
      }
    });
    // return result.code;
  }
  return sourceCode;
}

module.exports = loader;
