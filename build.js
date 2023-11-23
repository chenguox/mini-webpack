// 测试用例
const webpack = require("./lib/webpack")
const config = require('./webpack.config')

const compiler = webpack(config)

// 调用 run 方法 进行打包
compiler.run((err, stats) => {
  if (err) {
    console.log(err, 'err')
  }
  // console.log('构建完成！', stats.toJSON());
})