/**
 * 配置的函数是会接收三个参数的
 * @param {*} content 资源文件的内容
 * @param {*} map sourcemap 相关的数据
 * @param {*} meta 一些元数据
 * @returns
 */
module.exports = function (content, map, meta) {
  console.log(content, map, meta, "自定义loader");
  return content;
};
