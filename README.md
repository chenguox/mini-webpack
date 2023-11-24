# Mini-Webpack

## 项目简述

该项目实现了一个简单的 webpack，并编写了 loader 和 plugin 完成项目的打包。



## 工作流程

webpack 构建的核心任务是完成**内容转化**和**资源合并**。主要包含以下3个阶段：

1. **初始化阶段**

* 初始化参数：从配置文件和命令行参数中读取并与默认参数进行合并，组合成最终使用的参数。
* 创建编译对象：用上一步得到的参数创建 Compiler 对象。
* 初始化编译环境：注册用户配置的插件和webpack内置插件等。

2. **构建阶段**

* 开始编译：执行 Compiler 对象的 run 方法，创建 Compilation 对象。
* 确定编译入口： 对配置文件的 entry 参数进行判断，确认使用默认入口，还是配置的单/多入口。
* 编译模块：开始构建，从 entry 文件开始，调用 loader 对模块进行转译处理。然后调用 JS 解释器将内容转化为 AST 对象，从 AST 中获取依赖的模块和对内容进行修改。将新的 AST 对象生成新代码。深度递归分析依赖模块，依次处理全部文件。
* 完成模块编译：在上一步处理好所有模块后，得到模块编译产物和依赖关系图。

3. **生成阶段**

* 输出资源（seal)：根据入口和模块之间的依赖关系，组装成多个包含多个模块的 Chunk，再把每个 Chunk 转换成一个 Asset 加入到输出列表，这步是可以修改输出内容的最后机会。
* 写入文件系统（emitAssets）：确定好输出内容后，根据配置的 output 将内容写入文件系统。



## 准备工作

1、先创建仓库 mini-webpack，并对项目初始化。

```shell
mkdir mini-webpack && npm init -y
```

2、安装 babel 相关依赖 ，用于将源代码解析为 **AST**，进行模块**依赖收集**和**代码改写**。

```shell
npm install @babel/parser @babel/traverse @babel/types @babel/generator -D 
```

3、安装 tapable（注册/触发事件流）和 fs-extra 文件操作依赖 ，tapable 用来提供 **Hooks 机制**来接入**插件**进行工作。

```shell
npm install tapable fs-extra -D
```

4、创建 src 目录，并在该目录下新建两个入口文件和一个公共模块文件，用于最后的打包测试

```shell
mkdir src && cd src && touch entry1.js && touch entry2.js && touch module.js
```

5、给 entry1、entry2 和 module.js 文件写入以下内容：

```js
// src/entry1.js
const module = require('./module');
const start = () => 'start';
start();
console.log('entry1 module: ', module);

// src/entry2.js
const module = require('./module');
const end = () => 'end';
end();
console.log('entry2 module: ', module);

// src/module.js
const name = 'cegz';
module.exports = {
  name,
};
```

6、创建配置文件（webpack.config.js）, 写入以下配置：

```js
// ./webpack.config.js
const path = require('path');
const CustomWebpackPlugin = require('./plugins/custom-webpack-plugin.js');

module.exports = {
  entry: {
    entry1: path.resolve(__dirname, './src/entry1.js'),
    entry2: path.resolve(__dirname, './src/entry2.js'),
  },
  context: process.cwd(),
  output: {
    path: path.resolve(__dirname, './build'),
    filename: '[name].js',
  },
  plugins: [new CustomWebpackPlugin()],
  resolve: {
    extensions: ['.js', '.ts'],
  },
  module: {
    rules: [
      {
        test: /\.js/,
        use: [
          path.resolve(__dirname, './loaders/transformArrowFnLoader.js'), // 转换箭头函数
        ],
      },
    ],
  },
};
```

7、编写 webpack 的核心入口文件，来实现打包逻辑。

```js
mkdir lib && cd lib
touch webpack.js // webpack 入口文件
touch compiler.js // webpack 核心编译器
touch compilation.js // webpack 核心编译对象
touch utils.js // 工具函数
```



## 打包流程

### 一、初始化阶段

1、 从配置文件和命令行参数中读取并与默认参数进行合并，组合成最终使用的参数。

```js
const config = require('./webpack.config')
const compiler = webpack(config)

function webpack(options) {
  // 1. 合并配置项
  const mergeOptions = _mergeOptions(options);
  ...
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
```

2. 用上一步得到的参数创建 compiler 对象

```js
function webpack(options) {
  // 1. 合并配置项
  const mergeOptions = _mergeOptions(options);
  // 2. 创建 compiler 对象（源码：createCompiler，会做更多的事, 注册和触发钩子）
  const compiler = new Compiler(mergeOptions);
  ...
  return compiler;
}

class Compiler {
  constructor(options) {}

  // 编译工作的起点 compiler.run
  run(callback) {...}

  // 将 assets 上的代码内容写入到本地磁盘之中
  emitAssets(compilation, callback) {...}
}
```

3. 注册用户配置的插件

```js
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
```



### 二、构建阶段

1. 执行 Comipler 对象的 run 方法，创建 Compilation 对象

```js
const config = require('./webpack.config')

const compiler = webpack(config)

// 调用 run 方法 进行打包
compiler.run((err, stats) => {
  if (err) {
    console.log(err, 'err')
  }
  // console.log('构建完成！', stats.toJSON());
})

class Compiler {
  constructor(options) {
    this.options = options;
    this.context = this.options.context || process.cwd().replace(/\\/g, "/");
    this.hooks = {
      // 开始编译时的钩子
      run: new SyncHook(),
      // 模块解析完成，在向磁盘写入输出文件时执行
      emit: new SyncHook(),
      // 在输出文件写入后执行
      done: new SyncHook(),
    };
  }

  // 编译工作的起点 compiler.run
  run(callback) {
    // 1. 发起构建通知，触发 hoos.run 通知相关插件
    this.hooks.run.call();
    // 2. 创建 compilation 编译对象
    const compilation = new Compilation(this);
  }
}

class Compilation {
  constructor(compiler) {
    this.compiler = compiler;
    this.context = compiler.context;
    this.options = compiler.options;
    this.moduleCode = null;
    this.modules = new Set();
    this.entries = new Map();
    this.chunks = new Set();
    this.assets = {};
  }
  
  build(){...}
  
  seal(){...}
}
```

2.  对配置文件的 entry 参数进行判断，确认使用默认入口，还是配置的单/多入口。

```js
class Compiler {
  constructor(options) {
		...
  }

  // 编译工作的起点 compiler.run
  run(callback) {
    // 1. 发起构建通知，触发 hoos.run 通知相关插件
    this.hooks.run.call();
    // 2. 创建 compilation 编译对象
    const compilation = new Compilation(this);
    // 3. 编译模块
    compilation.build();
  }
}

class Compilation {
  constructor(compiler) {
    ...
  }
  
  build(){
    // 1. 读取配置入口
    const entry = this.getEntry();
    ...
  }
  
  seal(){...}
  
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
      // path 提供了 path.win32 与 path.posix 两个属性来分别解决 windows 与 posix 类型的路径.
      entry[key] = './' + path.relative(this.context, entry[key]).split(path.sep).join('/');
    });

    return entry;
  }
}
```

3. 开始构建，从 entry 文件开始，调用 loader 对模块进行转译处理。然后调用 JS 解释器将内容转化为 AST 对象，从 AST 中获取依赖的模块和对内容进行修改。将新的 AST 对象生成新代码。深度递归分析依赖模块，依次处理全部文件。

```js
class Compilation {
  constructor(compiler) {
    ...
  }
  
  build() {
    // 1. 读取配置入口
    const entry = this.getEntry();
    // 2. 构建入口模块，根据配置 entryName 为 entry1 和 entry2
    Object.keys(entry).forEach((entryName) => {
      const entryPath = entry[entryName];
      const entryData = this.buildModule(entryName, entryPath);
      this.entries.set(entryName, entryData);
    });
  }
  
  buildModule(moduleName, modulePath) {
    // 1. 读取文件原始代码
    const originSourceCode = fs.readFileSync(modulePath, "utf-8");
    this.moduleCode = originSourceCode; // 在 compilation 对象存放一份，方便别的获取
    // 2. 调用 loader 来转换（更改）文件内容
    this.runLoaders(modulePath);
    // 3. 调用 webpack 进行模块编译，为模块创建 module 对象
    const module = this.handleWebpackCompiler(moduleName, modulePath)
    return module
  }
    
  handleWebpackCompiler(moduleName, modulePath) {
    // 1. 创建 module 对象
    const moduleId = "./" + path.relative(this.context, modulePath).split(path.sep).join('/');;
    const module = {
      id: moduleId, // 将当前模块相对于项目启动根目录计算出 相对路径 作为模块ID
      dependencies: new Set(), // 存储该模块所依赖的子模块
      entryPoint: [moduleName], // 该模块所属的入口文件（记录那个模块引入过）
    };

    // 2. 对模块内容解析为 AST, 收集依赖模块，并改写模块导入语法为 __webpack_require__
    const ast = parser.parse(this.moduleCode, {
      sourceType: "module",
    });

    // 遍历 ast, 识别 require 语法
    traverse(ast, {
      CallExpression: (nodePath) => {
        const node = nodePath.node;
        if (node.callee.name === "require") {
          const requirePath = node.arguments[0].value; // ./module
          // 寻找模块绝对路径
          const moduleDirName = path.dirname(modulePath); // ./src
          const absolutePath = tryExtensions(
            path.join(moduleDirName, requirePath), // src/module
            this.options.resolve.extensions, // 配置的匹配文件后缀
            requirePath,  // ./module
            moduleDirName // ./src
          );
          // 为新识别到的模块创建 moduleId
          const moduleId =
            "./" + path.relative(this.context, absolutePath).split(path.sep).join('/');
          // 将 require 变成 __webpack_require__ 语句
          node.callee = t.identifier("__webpack_require__");
          // 修改模块路径（参考 this.context 的相对路径）
          node.arguments = [t.stringLiteral(moduleId)];

          if (
            !Array.from(this.modules).find((module) => module.id === moduleId)
          ) {
            // 在模块的依赖集合中记录子依赖
            module.dependencies.add(moduleId);
          } else {
            // 已存在模块集合中，虽然不添加进入模块编译，但是仍要在这个模块上记录被依赖的入口模块
            // 多入口可以识别是某个入口下的模块
            this.modules.forEach((module) => {
              if (module.id === moduleId) {
                module.entryPoint.push(moduleName);
              }
            });
          }
        }
      },
    });

    // 3. 将 ast 生成新代码
    const { code } = generator(ast);
    module._source = code;

    // 4. 深度递归构造依赖模块
    module.dependencies.forEach((dependency) => {
      const depModule = this.buildModule(moduleName, dependency);
      // 将编译后的任何依赖模块对象加入到 modules 对象中
      this.modules.add(depModule);
    });

    return module;
  }
}
```

### 三、生成阶段

1、 根据入口和模块之间的依赖关系，组装成多个包含多个模块的 Chunk，再把每个 Chunk 转换成一个 Asset 加入到输出列表，这步是可以修改输出内容的最后机会。

```js
class Compiler {
  constructor(options) {
	  ...
  }

  // 编译工作的起点 compiler.run
  run(callback) {
    // 1. 发起构建通知，触发 hoos.run 通知相关插件
    this.hooks.run.call();
    // 2. 创建 compilation 编译对象
    const compilation = new Compilation(this);
    // 3. 编译模块
    compilation.build();
    // 4. 生成产物
    compilation.seal();
  }
}

class Compilation {
  constructor(compiler) {...}
	
  seal() {
    // 1. 根据 entries 创建 chunks
    this.entries.forEach((entryData, entryName) => {
      // 根据当前入口文件和模块的相互依赖关系，组装成为一个个包含当前入口所有依赖模块的 chunk
      this.createChunk(entryName, entryData)
    });

    // 2. 根据 chunk 创建 assets
    this.createAssets()
  }
                         
  createChunk(entryName, entryData) {
    const chunk = {
      name: entryName, // 每一个入口文件作为一个 chunk
      entryModule: entryData, // build 后的数据信息
      modules: Array.from(this.modules).filter((i) => {
        return i.entryPoint.includes(entryName)
      }), // 当前入口所依赖的模块
    }

    // add chunk
    this.chunks.add(chunk)
  }
                         
  createAssets() {
    const output = this.options.output
    // 根据 chunks 生成 assets
    this.chunks.forEach((chunk) => {
      const parseFileName = output.filename.replace(`[name]`, chunk.name)
      // 为每一个 chunk 文件代码拼接 runtime 运行时语法
      this.assets[parseFileName] = getSourceCode(chunk)
    })
  }  
}
```

2. 确定好输出内容后，根据配置的 output 将内容写入文件系统。

```js
class Compiler {
  constructor(options) {
	  ...
  }

  // 编译工作的起点 compiler.run
  run(callback) {
    // 1. 发起构建通知，触发 hoos.run 通知相关插件
    this.hooks.run.call();
    // 2. 创建 compilation 编译对象
    const compilation = new Compilation(this);
    // 3. 编译模块
    compilation.build();
    // 4. 生成产物
    compilation.seal();
    // 5. 输出产物
    this.emitAssets(compilation, callback);
  }
  
  // 将 assets 上的代码内容写入到本地磁盘之中
  emitAssets(compilation, callback) {
    const { entries, modules, chunks, assets } = compilation;
    const output = this.options.output;

    // 调用 Plugin emit 钩子
    this.hooks.emit.call();

    // 若 output.path 不存在，进行创建
    if (!fs.existsSync(output.path)) {
      fs.mkdirSync(output.path);
    }

    // 将 assets 中的内容写入文件系统中
    Object.keys(assets).forEach((fileName) => {
      const filePath = path.join(output.path, fileName);
      fs.writeFileSync(filePath, assets[fileName]);
    });

    // 结束之后触发钩子
    this.hooks.done.call();

    callback(null, {
      toJSON: () => {
        return {
          entries,
          modules,
          chunks,
          assets,
        };
      },
    });
  }
}
```



## Loader 编写

loader 本身是一个函数，接收文件模块内容作为参数，经过改造处理返回新的文件内容。

1、将箭头函数转为普通函数

```js
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;
const t = require("@babel/types");

function transformArrowLoader(sourceCode) {

  const ast = parser.parse(sourceCode, {
    sourceType: "module",
  });
  traverse(ast, {
    ArrowFunctionExpression(path, state) {
      const node = path.node;
      const body = path.get("body");
      const bodyNode = body.node;
      if (bodyNode.type !== "BlockStatement") {
        const statements = [];
        statements.push(t.returnStatement(bodyNode));
        node.body = t.blockStatement(statements);
      }
      node.type = "FunctionExpression";
    },
  });
  const { code } = generator(ast);

  return code;
}

module.exports = transformArrowLoader;
```

2、将 md 文件转为 html 形式

```js
const { marked } = require("marked")
const hljs = require('highlight.js')

module.exports = function (content) {
  console.log(content)
  // 给 code 代码添加类名
  marked.setOptions({
    highlight: function (code, lang) {
      return hljs.highlight(lang, code).value
    }
  })
  
  // 使用 marked 库将我们的 md 内容转成 html 形式
  const htmlContent = marked(content)
  // 将 html 转成字符串
  const innderContent = '`' + htmlContent + '`'
  const moduleCode = `var code=${innderContent}; export default code`

  return moduleCode
}
```

3、将 es6 代码转为 es5 代码

```js
// webpack 提供了 schema-utils 库可以对参数进行校验
const { validate } = require('schema-utils')
// 导入我们配置好的校验规则
const rule = require('../my-schema/mybabel-schema.json')
// 导入 babel 的核心
const babel = require('@babel/core')

module.exports = function (content) {
  // webpack5 可以通过 this.query 获取参数
  const options = this.query

  // 对获取的参数进行验证
  validate(rule, options, {
    name: 'mybabel-loader'
  })

  // 设置为异步的loader,来执行回调
  const callback = this.async()

  // 将 es6 代码转为 es5代码，做异步的事
  babel.transform(content, options, (err, result) => {
    if (err) {
      callback(err)
    } else {
      callback(null, result.code)
    }
  })

  return content;
};
```

```js
// schema 验证参数
{
  "type": "object", 
  "properties": {
    "presets": {
      "type": "array"
    }
  }, 
  "additionalProperties": true
}

// webpack 配置
module: {
  rules: [
    {
      // 匹配后缀为 js 的文件，使用 cgx-loader 进行处理
      test: /\.js$/i,
      use: {
        loader: "mybabel-loader",
        // 没有配置 resolveLoader 需要写明路径
        // "./my-loader/mybabel-loader.js"
        options: {
          // 传递参数
          presets: ['@babel/preset-env'],
        }
      },
    }
  ],
},
```



## Plugin 编写

插件其实就是通过 compiler 可以去订阅 webpack 工作期间不同阶段的 hooks，以此来影响打包结果或者做一些定制操作。

1. 清空文件夹和复制资源

```js
const fs = require("fs-extra");
const path = require("path");

class CustomWebpackPlugin {
  apply(compiler) {
    const outputPath = compiler.options.output.path;
    const hooks = compiler.hooks;

    // 清除 build 目录
    hooks.emit.tap("custom-webpack-plugin", (compilation) => {
      fs.emptyDirSync(outputPath);
    });

    // 复制静态资源
    const otherFilesPath = path.resolve(__dirname, "../public");
    hooks.done.tap("custom-webpack-plugin", (compilation) => {
      fs.copySync(otherFilesPath, path.resolve(outputPath, "public"));
    });
  }
}

module.exports = CustomWebpackPlugin;
```

2.  该插件用于打包完成后，发送通知邮件

```js
const emailTo = require("./utils/send-email");
/**
 * 该插件用于打包完成后，发送通知邮件
 */
class SendEmailPlugin {
  constructor(options) {
    console.log("创建了 SendEmailPlugin 对象~");
    this.options = options;
  }

  apply(compiler) {
    // 因为在打包结束后进行的手续操作，选择 afterDone 钩子函数，
    compiler.hooks.afterDone.tap("SendEmailPlugin", (stats) => {
      // 发送通知邮件
      const { fromEmail, password, toEmail, host } = this.options;
      if (!fromEmail || !password || !toEmail || !host) {
        console.log("邮件配置参数错误！");
      } else if (stats) {
        const subject = stats.hasErrors()
          ? "[ERROR]webpack打包失败"
          : "[SUCCESS]webpack打包成功";
        const html =
          stats.toString() +
          `<br><div>${
            "打包时间：" +
            new Date(stats.startTime).toLocaleString() +
            "-" +
            new Date(stats.endTime).toLocaleString()
          }</div>`;
        emailTo(
          host,
          fromEmail,
          password,
          toEmail,
          subject,
          html,
          function (data) {
            console.log(data);
          }
        );
      }
    });
  }
}

module.exports = SendEmailPlugin;
```

3. 该插件用于打包目录时生成一个 filelist.md 文件，文件的内容是将所有的构建生成文件展示在一个列表中。

```js
class GenerateMdPlugin {
  constructor() {
    console.log("创建了 GenerateMdPlugin 对象~");
  }

  apply(compiler) {
    // 选择 emit 钩子来注册 hook 事件：因为该生命周期是资源文件输入到目标目录时
    compiler.hooks.emit.tapAsync(
      "GenerateMdPlugin",
      (compilation, callback) => {
        var filelist = "In this build: \n";

        // 通过 compilation 实例遍历访问所有编译过的资源文件
        for (const filename in compilation.assets) {
          filelist = filelist + "-" + filename + "\n";
        }

        // 将 filelist 的内容作为一个新的文件资源，插入到 webpack 构建中
        compilation.assets["filelist.md"] = {
          source() {
            return filelist;
          },
          size() {
            return filelist.length;
          },
        };
        callback();
      }
    );
  }
}

module.exports = GenerateMdPlugin;
```



## Tapable 库

### 同步

#### SyncHook

同步的 SyncHook, 会依次触发事件 event1 和 event2

```js
const { SyncHook } = require('tapable')

class LearnTapable {
  constructor() {
    // 创建 Hook
    this.hooks = {
      syncHook: new SyncHook(['name', 'age'])
    }

    // 使用 tap 注册 event1 事件
    this.hooks.syncHook.tap('event1', (name, age) => {
      console.log('event1', name, age);
    })

    // 使用 tap 注册 event2 事件
    this.hooks.syncHook.tap('event2', (name, age) => {
      console.log('event2', name, age);
    })
  }

  emit() {
    this.hooks.syncHook.call('小明', 18)
  }
}

const lt = new LearnTapable();
lt.emit();
// event1 小明 18
// event2 小明 18
```

#### SyncBailHook

当有返回值时，就不会执行后续的事件触发了

```js
// Bail: 当有返回值时，就不会执行后续的事件触发了
const { SyncBailHook } = require('tapable')

class LearnTapable {
  constructor() {
    this.hooks = {
      syncBailHook: new SyncBailHook(['name', 'age'])
    }

    // 监听事件
    this.hooks.syncBailHook.tap('event1', (name, age) => {
      console.log('event1', name, age);
      return 'event1~'
    })

    // 监听事件
    this.hooks.syncBailHook.tap('event2', (name, age) => {
      console.log('event2', name, age);
    })
  }

  // 触发事件
  emit() {
    this.hooks.syncBailHook.call('小明', 18)
  }
}

// event1 有返回值，所以不会执行 event2
const lt = new LearnTapable()
lt.emit()
// event1 小明 18
```

#### SyncWaterfallHook

当返回值不为 undefined 时，会将这次返回的结果作为下次事件的第一个参数。

```js
const { SyncWaterfallHook } = require('tapable')

class LearnTapable {
  constructor() {
    this.hooks = {
      syncWaterfallHook: new SyncWaterfallHook(['name', 'age'])
    }

    this.hooks.syncWaterfallHook.tap('event1', (name, age) => {
      console.log('event1', name, age)
      return 'event1~'
    })

    this.hooks.syncWaterfallHook.tap('event1', (res) => {
      console.log('event2', res)
    })
  }

  emit() {
    this.hooks.syncWaterfallHook.call("小明", 18)
  }
}

const lt = new LearnTapable()
lt.emit()
// event1 小明 18
// event2 event1~
```

#### SyncLoopHook

当返回值为 true, 就会反复执行该事件，直到返回 undefined 或者不返回内容，就退出事件

```js
const { SyncLoopHook } = require('tapable')

let counter = 0;

class LearnTapable {
  constructor() {
    // 1、在构造器中创建我们的 Hook
    this.hooks = {
      syncLoopHook: new SyncLoopHook(['name', 'age'])
    }

    // 2、注册 Hook 的监听事件，可以注册多个事件，使用 tap
    this.hooks.syncLoopHook.tap('event1', (name, age) => {
      if (counter++ < 3) {
        console.log('event1', name, age, counter)
        return true
      }
      // 返回 undefined
    })

    this.hooks.syncLoopHook.tap('event2', (name, age) => {
      console.log('event2', name, age)
    })
  }

  // 3、触发事件，即调用监听事件，使用 call
  emit() {
    this.hooks.syncLoopHook.call('cgx', 18)
  }
}

const lt = new LearnTapable()
lt.emit()
// event1 cgx 18 1
// event1 cgx 18 2
// event1 cgx 18 3
// event2 cgx 18
```

### 异步

#### AsyncParallelHook

并行，会同时执行事件处理回调。

```js
const { AsyncParallelHook } = require('tapable')

class LearnTapable {
  constructor() {
    this.hooks = {
      // 1、创建一个异步的串行 hook
      asyncParallelHook: new AsyncParallelHook(['name', 'age'])
    }

    // 2、注册 hook 的监听事件
    this.hooks.asyncParallelHook.tapPromise('event1', (name, age) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('event1', name, age)
          resolve()
        }, 2000);
      })
    })

    this.hooks.asyncParallelHook.tapPromise('event1', (name, age) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          console.log('event2', name, age)
          resolve()
        }, 2000);
      })
    })
  }

  emit() {
    // 3、触发事件，即调用监听事件
    this.hooks.asyncParallelHook.promise('cgx', 18).then(() => {
      console.log('事件监听完成')
    })
  }
}

const lt = new LearnTapable()
lt.emit()
// 我们可以看到 并行
// 2秒后打印
// event1 james 33
// event2 james 33
// 事件监听完成
// 总共花费了2秒这就是并行
```

#### AsyncSeriesHook

串行，会等待上一个是异步的 hook。

```js
const { AsyncSeriesHook } = require('tapable')

class LearnTapable {
  constructor() {
    // 1、创建一个异步的串行 hook
    this.hooks = {
      asyncSeriesHook: new AsyncSeriesHook(['name', 'age'])
    }

    // 2、注册 hook 的监听事件
    this.hooks.asyncSeriesHook.tapAsync('event1', (name, age, callback) => {
      setTimeout(() => {
        console.log('event1', name, age)
        callback()
      }, 2000);
    })
    this.hooks.asyncSeriesHook.tapAsync('event2', (name, age, callback) => {
      setTimeout(() => {
        console.log('event1', name, age)
        callback()
      }, 2000);
    })
  }

  // 3、触发事件，即调用监听事件
  emit() {
    this.hooks.asyncSeriesHook.callAsync('cgx', 18, () => {
      console.log('第一次事件执行完成')
    })
  }
}

const lt = new LearnTapable()
lt.emit()
// 可以看到
// 2秒后打印 
// event1 kobe 30
// 再过2秒后打印
// event2 kobe 30
// 总共花费了4秒这就是串行
```



## 最后文末

在终端执行以下命令，就可以看到我们打包的产物啦~

```shell
node build.js
```

![](https://codercgx-1308086317.cos.ap-nanjing.myqcloud.com/code/202311241418913.png)

```js
// entry1.js
(() => {
  var __webpack_modules__ = {
    "./src/module.js": (module) => {
      const name = "cgx";
      module.exports = {
        name,
      };
    },
  };
  var __webpack_module_cache__ = {};

  function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
      return cachedModule.exports;
    }
    var module = (__webpack_module_cache__[moduleId] = {
      exports: {},
    });

    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

    return module.exports;
  }

  (() => {
    const module = __webpack_require__("./src/module.js");
    const start = function () {
      return "start";
    };
    start();
    console.log("entry1 module: ", module);
  })();
})();

```



相信学完，你对 webpack 的打包思路有了清晰的认识。

感谢阅读~
