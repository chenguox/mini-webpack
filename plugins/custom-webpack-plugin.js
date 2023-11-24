// 插件其实就是通过 compiler 可以去订阅 webpack 工作期间不同阶段的 hooks，以此来影响打包结果或者做一些定制操作。
const fs = require("fs-extra");
const path = require("path");

class CustomWebpackPlugin {
  apply(compiler) {
    const outputPath = compiler.options.output.path;
    const hooks = compiler.hooks;

    // 清除 build 目录
    hooks.emit.tap("custom-webpack-plugin", (compilation) => {
      fs.emptyDirSync(outputPath);
    });

    // 复制静态资源
    const otherFilesPath = path.resolve(__dirname, "../public");
    hooks.done.tap("custom-webpack-plugin", (compilation) => {
      fs.copySync(otherFilesPath, path.resolve(outputPath, "public"));
    });
  }
}

module.exports = CustomWebpackPlugin;