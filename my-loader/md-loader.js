const { marked } = require("marked")
const hljs = require('highlight.js')

module.exports = function (content) {
  console.log(content)
  console.log("======================",process.env)
  // 给 code 代码添加类名
  marked.setOptions({
    highlight: function (code, lang) {
      return hljs.highlight(lang, code).value
    }
  })
  
  // 使用 marked 库将我们的 md 内容转成 html 形式
  const htmlContent = marked(content)
  // 将 html 转成字符串
  const innderContent = '`' + htmlContent + '`'
  const moduleCode = `var code=${innderContent}; export default code`

  return moduleCode
}