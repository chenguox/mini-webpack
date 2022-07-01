const { SyncHook } = require('tapable')

class LearnTapable {
  constructor() {
    // 创建 Hook
    this.hooks = {
      syncHook: new SyncHook(['name', 'age'])
    }

    // 使用 tap 注册 event1 事件
    this.hooks.syncHook.tap('event1', (name, age) => {
      console.log('event1', name, age);
    })

    // 使用 tap 注册 event2 事件
    this.hooks.syncHook.tap('event2', (name, age) => {
      console.log('event2', name, age);
    })
  }

  emit() {
    this.hooks.syncHook.call('小明', 18)
  }
}

// 同步的 SyncHook, 会依次触发事件 event1 和 event2
const lt = new LearnTapable();
lt.emit();