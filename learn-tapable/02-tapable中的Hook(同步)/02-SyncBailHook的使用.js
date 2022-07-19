// Bail: 当有返回值时，就不会执行后续的事件触发了
const { SyncBailHook } = require('tapable')

class LearnTapable {
  constructor() {
    this.hooks = {
      syncBailHook: new SyncBailHook(['name', 'age'])
    }

    // 监听事件
    this.hooks.syncBailHook.tap('event1', (name, age) => {
      console.log('event1', name, age);
      return 'event1~'
    })

    // 监听事件
    this.hooks.syncBailHook.tap('event2', (name, age) => {
      console.log('event2', name, age);
    })
  }

  // 触发事件
  emit() {
    this.hooks.syncBailHook.call('小明', 18)
  }
}

// event1 有返回值，所以不会执行 event2
const lt = new LearnTapable()
lt.emit()
// event1 小明 18