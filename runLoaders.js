const path = require('path');
const fs = require('fs');
const { runLoaders } = require('loader-runner');

const entryFile = path.resolve(__dirname, 'src/entry.js');

const request = `inline1-loader!inline2-loader!${entryFile}`;

const rules = [
  {
    test: /.js$/,
    use: ['normal1-loader', 'normal2-loader'],
  },
  {
    test: /.js$/,
    enforce: 'pre',
    use: ['pre1-loader', 'pre2-loader'],
  },
  {
    test: /.js$/,
    enforce: 'post',
    use: ['post1-loader', 'post2-loader'],
  },
];

// loader 的叠加顺序：后置、内联、正常、前置
const parts = request.replace(/^-?!+/, '').split('!');
// 获取数组中的最后一个元素，作为我们处理的模块
const resource = parts.pop();
// 剩下的就是内联 loaders
const inlineLoaders = parts;
const preLoaders = [],
  normalLoaders = [],
  postLoaders = [];

for (let i = 0; i < rules.length; i++) {
  const rule = rules[i];
  if (rule.test.test(resource)) {
    if (rule.enforce === 'pre') {
      preLoaders.push(...rule.use);
    } else if (rule.enforce === 'post') {
      postLoaders.push(...rule.use);
    } else {
      normalLoaders.push(...rule.use);
    }
  }
}

// const loaders = [
//   ...postLoaders,
//   ...inlineLoaders,
//   ...normalLoaders,
//   ...preLoaders,
// ];

let loaders = [];
// 不要前后置和普通
if (request.startsWith('!!')) {
  loaders = [...inlineLoaders];
  // 不要前置和普通
} else if (request.startsWith('-!')) {
  loaders = [...postLoaders, ...inlineLoaders];
  // 不要普通
} else if (request.startsWith('!')) {
  loaders = [...postLoaders, ...inlineLoaders, ...preLoaders];
} else {
  loaders = [...postLoaders, ...inlineLoaders, ...normalLoaders, ...preLoaders];
}

function resolveLoader(loader) {
  return path.resolve(__dirname, 'loaders-chain', loader);
}

const resolvedLoaders = loaders.map(resolveLoader);

runLoaders(
  {
    resource,
    loaders: resolvedLoaders,
    context: { age: 17 },
    readResource: fs.readFile.bind(fs),
  },
  (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    // console.log('==================== ');
    // console.log(result);
    console.log('==================== ');
    console.log(result.result[0]);
    console.log('==================== ');
    console.log(result.resourceBuffer.toString());
  }
);
