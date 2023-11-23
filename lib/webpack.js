const Compiler = require('./compiler')

function webpack(options) {
  // 1. 合并配置项
  const mergeOptions = _mergeOptions(options);
  // 2. 创建 compiler 对象（源码：createCompiler，会做更多的事, 注册和触发钩子）
  const compiler = new Compiler(mergeOptions);
  // 3. 注册插件，让插件去影响打包结果
  if (Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      if (typeof plugin === "function") {
        plugin.call(compiler, compiler); // 当插件为函数时
      } else {
        plugin.apply(compiler); // 如果插件是一个对象，执行 apply 方法，传入 compiler 对象
      }
    }
  }
  return compiler;
}

/**
 * 对命令行和配置文件的参数进行合并（shell + webpack.config.js）
 * @param {*} options 配置文件参数
 */
function _mergeOptions(options) {
  const shellOptions = process.argv.slice(2).reduce((option, argv) => {
    // 例如：argv -> --mode=production
    const [key, value] = argv.split("=");
    if (key && value) {
      const parseKey = key.slice(2);
      option[parseKey] = value;
    }
    return option;
  }, {});

  return { ...options, ...shellOptions };
}

module.exports = webpack;
