
  (() => {
    var __webpack_modules__ = {
      
          './src/module.js': (module) => {
            const name = 'cgx';
module.exports = {
  name
};
      }
        
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
      const module = __webpack_require__("./src/module.js");
const end = function () {
  return 'end';
};
end();
console.log('entry2 module: ', module);
    })();
  })();
  