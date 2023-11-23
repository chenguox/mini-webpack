class Compilation {
  constructor(compiler) {
    this.compiler = compiler;
    this.context = compiler.context;
    this.options = compiler.options;
    // 记录当前的模块代码
    this.moduleCode = null;
    // 保存所有依赖模块对象
    this.modules = new Set();
    // 保存所有入口模块对象
    this.entries = new Map();
    // 所有的代码块对象
    this.chunks = new Set();
    // 存放本次产出的文件对象（与 chunks 一一对应）
    this.assets = {};
  }

  build() {
    // 1. 读取配置入口
    const entry = this.getEntry();
    // 2. 构建入口模块，根据配置 entryName 为 entry1 和 entry2
    Object.keys(entry).forEach((entryName) => {
      const entryPath = entry[entryName];
      const entryData = this.buildModule();
    });
  }

  seal() {}

  /**
   * 获取配置的入口地址，从而拿到入口模块信息
   */
  getEntry() {
    let entry = Object.create(null); // 创建一个空对象（干净且高度可定制）
    const { entry: optionsEntry } = this.options;
    if (!optionsEntry) {
      // 没有该值，那么取入口的默认值
      entry["main"] = "src/index.js";
    } else if (typeof optionsEntry === "string") {
      // 单个入口
      entry["main"] = optionsEntry;
    } else {
      // 对象，比如多入口配置
      entry = optionsEntry;
    }
    // 相对于项目启动根目录计算出相对路径
    Object.keys(entry).forEach((key) => {
      entry[key] = "./" + path;
    });
  }

  buildModule(moduleName, modulePath) {
    // 1. 读取文件原始代码
    const originSourceCode = fs.readFileSync(modulePath, "utf-8");
    this.moduleCode = originSourceCode; // 在 compilation 对象存放一份，方便别的获取
    // 2. 调用 loader 来转换（更改）文件内容
    this.runLoaders(modulePath);
  }

  /**
   * 调用 loader 来对内容进行转化
   * @param {*} modulePath
   */
  runLoaders(modulePath) {
    const matchLoaders = [];
    // 1. 找到与模块相匹配的 loader
    const rules = this.options.module.rules;
    rules.forEach((loader) => {
      const testRule = loader.test;
      if (testRule.test(modulePath)) {
        // 这里得根据 loader 的配置不同做个判断
        // 如: { test:/\.js$/g, use:['babel-loader'] },
        // { test:/\.js$/, loader:'babel-loader' }
        loader.loader
          ? matchLoaders.push(loader.loader)
          : matchLoaders.push(...loader.use);
      }
    });

    // 2. 倒序执行 loader
    for (let i = matchLoaders - 1; i >= 0; i++) {
      // loader 本身是一个导出的JS函数
      const loaderFn = require(matchLoaders[i])
      // 调用 loaderFn 处理源代码
      this.moduleCode = loaderFn(this.moduleCode)
    }
  }
}

module.exports = Compilation;
