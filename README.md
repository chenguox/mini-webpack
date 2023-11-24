# learn-loader-plugin

## 描述

该项目实现了一个简单的 webpack，并编写了 loader 和 plugin 完成项目的打包。



## 准备工作

创建仓库

```shell
mkdir mini-webpack && npm init -y
```

安装 babel 相关依赖 ，用于将源代码解析为 AST，进行模块依赖收集和代码改写。

```shell
npm install @babel/parser @babel/traverse @babel/types @babel/generator -D 
```

安装 tapable（注册/触发事件流）和 fs-extra 文件操作依赖 ，tapable 用来提供 Hooks 机制来接入插件进行工作

```shell
npm install tapable fs-extra -D
```

创建 src 目录，并在该目录下新建两个入口文件和一个公共模块文件

```shell
mkdir src && cd src && touch entry1.js && touch entry2.js && touch module.js
```

给 entry1、entry2 和 module.js 文件写入以下内容：

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

创建配置文件（webpack.config.js）, 写入以下配置：

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

编写 webpack 的核心入口文件，来实现打包逻辑。

```js
// cd webpack-demo
mkdir lib && cd lib
touch webpack.js // webpack 入口文件
touch compiler.js // webpack 核心编译器
touch compilation.js // webpack 核心编译对象
touch utils.js // 工具函数
```







个人学习自定义 loader 和 plugin 项目

**Loader**

mybabel-loader

md-loader

感兴趣可以查看个人公众号的文章：**手把手教你 webpack 开发自己的 loader**

https://mp.weixin.qq.com/s/inCCh-BNqQSjFxQO6XBVaw

**Plugin**

base-plugin

generate-md-plugin
