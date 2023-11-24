const fs = require("fs");
const path = require("path");

/**
 *
 * @param {*} modulePath 模块的绝对路径
 * @param {*} extensions 配置文件里设置的文件后缀
 * @param {*} originModulePath 模块相对路径
 * @param {*} moduleContenxt 模块所在目录名
 */
function tryExtensions(
  modulePath,
  extensions,
  originModulePath,
  moduleContenxt
) {
  // 给后缀数组中最前面添加一个空的，这样拼接是一个空的，如果用户已经传入后缀，那么使用用户填入的，无需再应用 extensions
  if (!extensions.includes("")) {
    extensions.unshift("");
  }

  // 同步检查文件是否存在
  for (let extension of extensions) {
    if (fs.existsSync(modulePath + extension)) {
      // 拼接好后缀后返回完整路径
      return (modulePath + extension).split(path.sep).join("/");
    }
  }

  // 未匹配对应文件
  throw new Error(
    `No module, Error: Can't resolve ${originModulePath} in ${moduleContext}`
  );
}

/**
 *
 * @param {*} chunk
 * @returns
 */
function getSourceCode(chunk) {
  const { entryModule, modules } = chunk;
  return `
  (() => {
    var __webpack_modules__ = {
      ${modules
        .map((module) => {
          return `
          '${module.id + ""}': (module) => {
            ${module._source}
      }
        `;
        })
        .join(",")}
    };
    var __webpack_module_cache__ = {};

    function __webpack_require__(moduleId) {
      var cachedModule = __webpack_module_cache__[moduleId];
      if (cachedModule !== undefined) {
        return cachedModule.exports;
      }
      var module = (__webpack_module_cache__[moduleId] = {
        exports: {},
      });

      __webpack_modules__[moduleId](module, module.exports, __webpack_require__);

      return module.exports;
    }

    (() => {
      ${entryModule._source}
    })();
  })();
  `;
}

module.exports = {
  tryExtensions,
  getSourceCode,
};
