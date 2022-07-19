const { createTransport } = require('nodemailer')
/**
 * npm i nodemailer -S
 * @param {*} host 
 * @param {*} fromEmail 
 * @param {*} password 
 * @param {*} toEmail 
 * @param {*} subject 
 * @param {*} html 
 * @param {*} callback 
 */
function emailTo(host, fromEmail, password, toEmail, subject, html, callback) {
  let transporter = createTransport({
    host: host,
    port: 25,
    secure: false,
    auth: {
      user: fromEmail,
      pass: password,
    },
  })
  // const transporter = createTransport({
  //   host: host,
  //   auth: {
  //     user: fromEmail,
  //     pass: password // 如果发送邮箱是QQ邮箱，则为授权码

  //   }
  // });
  var mailOptions = {
    from: fromEmail, // 发送者
    to: toEmail, // 接受者,可以同时发送多个,以逗号隔开
    subject: subject, // 标题
  };
  if (html != undefined) {
    mailOptions.html = html;// html
  }

  var result = {
    httpCode: 200,
    message: '发送成功!',
  }
  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
        return;
      }
      callback(result);
    });
  } catch (err) {
    result.httpCode = 500;
    result.message = err;
    callback(result);
  }
}

module.exports = emailTo