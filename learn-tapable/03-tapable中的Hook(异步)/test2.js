const { AsyncParallelHook, AsyncSeriesHook } = require("tapable");

const hooks = {
  // 并行，会同时执行事件处理回调结束，才会执行下一次事件处理回调
  asyncParallelHook: new AsyncParallelHook(["name", "age"]),
  // 串行，会等待上一个是异步的 hook
  asyncSeriesHook: new AsyncSeriesHook(["name", "age"]),
};

console.log("====AsyncParallelHook====");
// 注册
hooks.asyncParallelHook.tapPromise("event1", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("event1", name, age);
      resolve();
    }, 2000);
  });
});

hooks.asyncParallelHook.tapPromise("event1", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("event2", name, age);
      resolve();
    }, 1000);
  });
});

// 触发
hooks.asyncParallelHook.promise("cgx", 18).then(() => {
  console.log("事件监听完成");
});

// console.log("====AsyncSeriesHook====");
// // 注册
// hooks.asyncSeriesHook.tapAsync("event1", (name, age, callback) => {
//   setTimeout(() => {
//     console.log("event1", name, age);
//     callback();
//   }, 2000);
// });
// hooks.asyncSeriesHook.tapAsync("event2", (name, age, callback) => {
//   setTimeout(() => {
//     console.log("event2", name, age);
//     callback();
//   }, 1000);
// });

// // 触发
// hooks.asyncSeriesHook.callAsync("cgx", 18, () => {
//   console.log("事件监听完成");
// });
