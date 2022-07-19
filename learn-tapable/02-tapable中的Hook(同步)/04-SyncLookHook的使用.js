const { SyncLoopHook } = require('tapable')

let counter = 0;

class LearnTapable {
  constructor() {
    // 1、在构造器中创建我们的 Hook
    this.hooks = {
      syncLoopHook: new SyncLoopHook(['name', 'age'])
    }

    // 2、注册 Hook 的监听事件，可以注册多个事件，使用 tap
    this.hooks.syncLoopHook.tap('event1', (name, age) => {
      if (counter++ < 3) {
        console.log('event1', name, age, counter)
        return true
      }
      // 返回 undefined
    })

    this.hooks.syncLoopHook.tap('event2', (name, age) => {
      console.log('event2', name, age)
    })
  }

  // 3、触发事件，即调用监听事件，使用 call
  emit() {
    this.hooks.syncLoopHook.call('cgx', 18)
  }
}

// Loop: 当返回值为 true, 就会反复执行该事件，直到返回 undefined 或者不返回内容，就退出事件
const lt = new LearnTapable()
lt.emit()
// event1 cgx 18 1
// event1 cgx 18 2
// event1 cgx 18 3
// event2 cgx 18