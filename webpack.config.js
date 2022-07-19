const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require("path");
// 测试创建的 BasePlugin
const BasePlugin = require('./my-plugin/base-plugin')
// 测试创建的 GenerateMdPlugin
const GenerateMdPlugin = require('./my-plugin/generate-md-plugin')

module.exports = {
  // 打包会默认是 production, 会默认帮我们做一些处理，设置为 development 可以避免一些影响
  mode: "development",
  entry: "./src/main.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "./build"),
  },
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
      },
      {
        test: /\.md$/i,
        use: ['md-loader']
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin(),
    // 测试我们创建的 BasePlugin
    new BasePlugin({
      title: 'base-plugin'
    }),
    new GenerateMdPlugin()
  ],
  // 默认会去 node_module 查找 loader，但是我们自定义的loader在my-loader文件夹，所以需要配置一下
  resolveLoader: {
    modules: ["node_modules", "./my-loader"],
  },
};
