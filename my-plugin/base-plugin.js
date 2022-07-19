// Plugin 的本质就是一个类
class BasePlugin {
  constructor(options) {
    console.log("BasePlugin被创建了");
    console.log(options)
    // 添加到对象中
    this.options = options
  }

  // 注入 compiler
  apply(compiler) {

  }
}

module.exports = BasePlugin