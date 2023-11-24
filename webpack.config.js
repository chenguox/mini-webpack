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
}