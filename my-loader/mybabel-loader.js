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
