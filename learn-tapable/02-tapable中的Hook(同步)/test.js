const {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
} = require("tapable");

const hooks = {
  // 创建 SyncHooks, 同步的 SyncHook, 会依次触发事件
  syncHook: new SyncHook(["name", "age"]),
  // 当事件有返回值时，就不会执行后续的事件触发了
  syncBailHook: new SyncBailHook(["name", "age"]),
  // 当返回值不为 undefined 时，会将这次返回的结果作为下次事件的第一个参数
  syncWaterfallHook: new SyncWaterfallHook(["name", "age"]),
  // 当返回值为 true, 就会反复执行该事件，直到返回 undefined 或者不返回内容，就退出事件
  syncLoopHook: new SyncLoopHook(["name", "age"]),
};

console.log("====SyncHooks====");
// 注册
hooks.syncHook.tap("event1", (name, age) => {
  console.log("event1", name, age);
});

hooks.syncHook.tap("event2", (name, age) => {
  console.log("event2", name, age);
});

// 触发
hooks.syncHook.call("小明", 18);

console.log("====syncBailHook====");
// 注册
hooks.syncBailHook.tap("event1", (name, age) => {
  console.log("event1", name, age);
  return "event1~";
});

hooks.syncBailHook.tap("event2", (name, age) => {
  console.log("event2", name, age);
});

// 触发
hooks.syncBailHook.call("小明", 18);

console.log("====SyncWaterfallHook====");
// 注册
hooks.syncWaterfallHook.tap("event1", (name, age) => {
  console.log("event1", name, age);
  return "event1~";
});

hooks.syncWaterfallHook.tap("event1", (res) => {
  console.log("event2", res);
});

// 触发
hooks.syncWaterfallHook.call("小明", 18);

console.log("====SyncWaterfallHook====");
let counter = 0;
hooks.syncLoopHook.tap("event1", (name, age) => {
  if (counter++ < 3) {
    console.log("event1", name, age, counter);
    return true;
  }
  // 返回 undefined
});
hooks.syncLoopHook.tap("event2", (name, age) => {
  console.log("event2", name, age);
});
hooks.syncLoopHook.call("cgx", 18);
