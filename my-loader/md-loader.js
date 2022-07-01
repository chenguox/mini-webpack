const { marked } = require("marked")

module.exports = function(content){
  // 使用 marked 库将我们的 md 内容转成 html 形式
  const htmlContent = marked(content)
  // 将 html 转成字符串
  const innderContent = '`' + htmlContent + '`'
  const moduleCode = `var code=${innderContent}; export default code`

  return moduleCode
}