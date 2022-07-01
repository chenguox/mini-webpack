# learn-loader-plugin

学习 webpack 自定义 loader 和 plugin

**安装 webpack 和 webpack-cli**

**npm install webpack webpack-cli -D**

**初始化 package.json 文件**

> **npm init -y**





**webpack 官方提供了一个解析库 loader-utils , 通过这个库我们在我们自定义的loader中拿到我们的参数**

**安装 ： npm install loader-utils -D**

**在自己定义的loader中引入 loader-utils ，并使用**

```
// webpack 提供了 loader-utils 库可以获取传过来的参数
// const { getOptions } = require('loader-utils')
```


```
// 获取参数
const options = getOptions(this)
```

[webpack](https://so.csdn.net/so/search?q=webpack&spm=1001.2101.3001.7020) 5 已经可以通过this.query 直接获取loader的options配置，所以不需要利用loader-utils工具获取：

```
// 获取参数

console.log(this.query);
```
