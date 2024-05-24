const fs = require('fs');

/**
 * loader 就是一个绝对路径
 * /Users/junkong/AiCherish/study-webpack/09-loader-02/loaders/babel-loader.js
 */
function createLoaderObject(loader) {
  let normal = require(loader);
  let pitch = normal.pitch;
  // 在 webpack 里一切皆模块，这些文件可能是 js，也可能是二进制的图片，字符
  // raw: true 时，读成 Buffer，如果为 false，那就读成字符串
  let raw = normal.raw || true; // 决定是字符串还是 Buffer
  return {
    path: loader,
    normal,
    pitch,
    normalExecuted: false, // 此 loader 的 normal 函数是否已经执行过了
    pitchExecuted: false, // 此 loader 的 pitch 函数是否已经执行过了
    data: {}, // 每个 loader 会配一个自己的 data 对象，可以用来保存一些自定义数据
    raw,
  };
}

function iterateNormalLoaders(
  processOptions,
  loaderContext,
  args,
  pitchingCallback
) {
  // 越界了
  if (loaderContext.loaderIndex < 0) {
    return pitchingCallback(null, args);
  }

  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.normalExecuted) {
    loaderContext.loaderIndex--;
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      args,
      pitchingCallback
    );
  }
  let fn = currentLoader.normal;
  currentLoader.normalExecuted = true;
  //
  convertArgs(args, currentLoader.raw);
  runSyncOrAsync(fn, loaderContext, args, (err, ...returnArgs) => {
    return iterateNormalLoaders(
      processOptions,
      loaderContext,
      returnArgs,
      pitchingCallback
    );
  });
}

function convertArgs(args, raw) {
  if (raw && !Buffer.isBuffer(args[0])) {
    args[0] = Buffer.from(args[0]);
  } else if (!raw && Buffer.isBuffer(args[0])) {
    args[0] = args[0].toString();
  }
}

function processResource(processOptions, loaderContext, callback) {
  processOptions.readResource(loaderContext.resourcePath, (err, buffer) => {
    if (err) {
      return callback(err);
    }
    processOptions.resourceBuffer = buffer;
    loaderContext.loaderIndex--;
    iterateNormalLoaders(processOptions, loaderContext, [buffer], callback);
  });
}

function iteratePitchingLoaders(
  processOptions,
  loaderContext,
  pitchingCallback
) {
  // 越界了
  if (loaderContext.loaderIndex >= loaderContext.loaders.length) {
    return processResource(processOptions, loaderContext, pitchingCallback);
  }
  let currentLoader = loaderContext.loaders[loaderContext.loaderIndex];
  if (currentLoader.pitchExecuted) {
    loaderContext.loaderIndex++;
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }
  let fn = currentLoader.pitch;
  // 表示已经执行过此 loader 的 pitch 函数了
  currentLoader.pitchExecuted = true;
  if (!fn) {
    return iteratePitchingLoaders(
      processOptions,
      loaderContext,
      pitchingCallback
    );
  }

  runSyncOrAsync(
    fn,
    loaderContext,
    [
      loaderContext.remainingRequest,
      loaderContext.previousRequest,
      loaderContext.data,
    ],
    (err, ...args) => {
      // 如果 pitch 方法有返回值
      if (args.length > 0 && args.some((item) => item)) {
        return iterateNormalLoaders(
          processOptions,
          loaderContext,
          args,
          pitchingCallback
        );
      } else {
        return iteratePitchingLoaders(
          processOptions,
          loaderContext,
          pitchingCallback
        );
      }
    }
  );
}

function runSyncOrAsync(fn, loaderContext, args, runCallback) {
  // 此变量标识当前的函数的执行是同步还是异步，默认是异步
  let isSync = true;

  loaderContext.callback = (err, ...args) => {
    runCallback(err, ...args);
  };

  loaderContext.async = () => {
    isSync = false;
    return loaderContext.callback;
  };

  let result = fn.apply(loaderContext, args);

  if (isSync) {
    runCallback(null, result);
  }
}

function runLoaders(options, finalCallback) {
  const {
    resource,
    loaders = [],
    context = {},
    readResource = fs.readFile.bind(fs),
  } = options;

  let loaderContext = context;
  let loaderObjects = loaders.map(createLoaderObject);
  loaderContext.resourcePath = resource;
  loaderContext.readResource = readResource;
  loaderContext.loaders = loaderObjects;
  loaderContext.loaderIndex = 0; // 当前正在执行的 loader 索引
  loaderContext.callback = null; // 调用此方法表示结束当前的 loader，把结果传给下一个 loader
  loaderContext.async = null; // 表示把 loader 的执行从同步变成异步

  Object.defineProperty(loaderContext, 'request', {
    get() {
      return loaderContext.loaders
        .map((loader) => loader.path)
        .concat(resource)
        .join('!');
    },
  });
  // 从当前的 loader 下一个开始，一直到结束，加上要加载的资源
  Object.defineProperty(loaderContext, 'remainingRequest', {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex + 1)
        .map((loader) => loader.path)
        .concat(resource)
        .join('!');
    },
  });

  Object.defineProperty(loaderContext, 'currentRequest', {
    get() {
      return loaderContext.loaders
        .slice(loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .concat(resource)
        .join('!');
    },
  });

  Object.defineProperty(loaderContext, 'previousRequest', {
    get() {
      return loaderContext.loaders
        .slice(0, loaderContext.loaderIndex)
        .map((loader) => loader.path)
        .join('!');
    },
  });

  Object.defineProperty(loaderContext, 'data', {
    get() {
      return loaderContext.loaders[loaderContext.loaderIndex].data;
    },
  });

  // 处理的选项
  let processOptions = {
    resourceBuffer: null, // 读取到的源文件的 Buffer 内容，要加载的文件的原始内容，转换前的内容
    readResource,
  };

  iteratePitchingLoaders(processOptions, loaderContext, (err, result) => {
    finalCallback(err, {
      result,
      resourceBuffer: processOptions.resourceBuffer,
    });
  });
}

exports.runLoaders = runLoaders;
