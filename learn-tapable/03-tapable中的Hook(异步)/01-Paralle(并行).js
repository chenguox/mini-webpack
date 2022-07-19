const { AsyncParallelHook } = require('tapable')

// Parallel： 并行，会同时执行事件处理回调结束，才会执行下一次事件处理回调
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