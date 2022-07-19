const { AsyncSeriesHook } = require('tapable')

// Series: 串行，会等待上一个是异步的 hook
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
