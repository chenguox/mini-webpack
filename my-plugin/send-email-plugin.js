const emailTo = require('./utils/send-email')
/**
 * 该插件用于打包完成后，发送通知邮件
 */
class SendEmailPlugin {
  constructor(options) {
    console.log('创建了 SendEmailPlugin 对象~')
    this.options = options
  }

  apply(compiler) {
    // 因为在打包结束后进行的手续操作，选择 afterDone 钩子函数，
    compiler.hooks.afterDone.tap('SendEmailPlugin', stats => {
      // 发送通知邮件
      const { fromEmail, password, toEmail, host } = this.options;
      if (!fromEmail || !password || !toEmail || !host) {
        console.log("邮件配置参数错误！")
      } else if (stats) {
        const subject = stats.hasErrors() ? "[ERROR]webpack打包失败" : "[SUCCESS]webpack打包成功"
        const html = stats.toString() + `<br><div>${"打包时间：" + new Date(stats.startTime).toLocaleString() + "-" + new Date(stats.endTime).toLocaleString()}</div>`;
        emailTo(host, fromEmail, password, toEmail, subject, html, function (data) {
          console.log(data)
        })
      }
    })
  }


}

module.exports = SendEmailPlugin