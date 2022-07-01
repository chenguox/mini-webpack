// Waterfall: 当返回值不为 undefined 时，会将这次返回的结果作为下次事件的第一个参数
const { SyncWaterfallHook } = require('tapable')

class LearnTapable {
  constructor() {
    this.hooks = {
      syncWaterfallHook: new SyncWaterfallHook(['name', 'age'])
    }

    this.hooks.syncWaterfallHook.tap('event1', (name, age) => {
      console.log('event1', name, age)
      return 'event1~'
    })

    this.hooks.syncWaterfallHook.tap('event1', (res) => {
      console.log('event2', res)
    })
  }

  emit() {
    this.hooks.syncWaterfallHook.call("小明", 18)
  }
}

const lt = new LearnTapable()
lt.emit()