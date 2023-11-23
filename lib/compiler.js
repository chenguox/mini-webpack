const fs = require('fs')
const path = require('path')
const { SyncHook } = require('tapable') // 串联 compiler 打包流程的订阅与通知钩子
const Compilation = require('./compilation') // 编译构造函数


class Compiler {
  constructor(options) {
    this.options = options
    this.context = this.options.context || process.cwd().replace(/\\/g, '/');
    console.log('context====:', this.context)
    this.hooks = {
      // 开始编译时的钩子
      run: new SyncHook(),
      // 模块解析完成，在向磁盘写入输出文件时执行
      emit: new SyncHook(),
      // 在输出文件写入后执行
      done: new SyncHook()
    }
  }

  // 编译工作的起点 compiler.run
  run(callback) {
    // 1. 发起构建通知，触发 hoos.run 通知相关插件
    this.hooks.run.call()
    // 2. 创建 compilation 编译对象
    const compilation = new Compilation(this)
    // 3. 编译模块
    compilation.build()
  }

  emitAssets(compilation, callback) {

  }
}