const nodemailer = require('nodemailer'),
ll = require('../bin/larlist'),
con = require('../bin/mysql'),
log = require('../bin/logger')
transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USERMAIL,
      pass: process.env.USERPASS
    }
  })

async function send(status,user,larid,mail) {
  var result = await con.q('SELECT * FROM lar_data WHERE id = ?',larid),
  start = result[0].start,
  userName = result[0].userName,
  end = result[0].end,
  allDay = result[0].allDay,
  className = result[0].className,
  title = result[0].title,
  larType,
  qlink = 'http://webapp.iris.co.th:3000/login'
  if (mail == 'hr') { mail = process.env.DB_MAILHR }
  else if (mail == 'user') { mail = await con.q('SELECT mail FROM user_data WHERE dataid = ?',result[0].dataid) , mail = mail[0].mail }
  else if (mail == 'boss') { mail = result[0].mailGroup }
  timec = ll.getDayTime(start,end,allDay)
  if (className == 'label-grey') { larType = 'ลาป่วย' }
	else if (className == 'label-success') { larType = 'ลากิจ' }
	else if (className == 'label-warning') {	larType = 'ลาพักร้อน' }
	else if (className == 'label-yellow') {	larType = 'ลาสลับวันหยุด' }
  else if (className == 'label-info') { larType = title }
    let mailOptions = {
        from: 'iris4notice@gmail.com',
        to: mail,
        subject: status+' '+larType,
        html: '<h3>'+status+''+larType+' โดย '+user+'</h3>\
        <h5>ผู้ลา: '+userName+'</h5>\
        <table>\
        <tr>\
        <td>ประเภท</td>\
        <td>'+larType+'</td>\
        </tr>\
        <tr>\
        <td>เหตุผล</td>\
        <td>'+title+'</td>\
        </tr>\
        <tr>\
        <td>วันที่ลา</td>\
        <td>'+timec.dateStart+(timec.dateEnd==timec.dateStart ? '' : ' - '+timec.dateEnd)+'</td>\
        </tr>\
        <tr>\
        <tr>\
        <td>ช่วงเวลา</td>\
        <td>'+timec.timeStart+(timec.timeEnd ? ' - '+timec.timeEnd : '')+'</td>\
        </tr>\
        <tr>\
        <td>ระยะเวลา</td>\
        <td>'+timec.daylength+'</td>\
        </tr>\
        </table><br>\
        <a href="'+qlink+'"><button class="blue">เข้าสู่ระบบ</button></a>'
    }
    log.logger('info',mailOptions)
    transporter.sendMail(mailOptions, function (err, info) {
        if(err) {
          log.logger('error',err)
        }
        else {
          if (info.accepted) {
            log.logger('info','Send mail success: '+status+' '+larType+' to '+info.accepted)
          } else if (info.rejected) {
            log.logger('info','Send mail reject: '+status+' '+larType+' to '+info.rejected)
          }
        }
    })
}

async function sendb(mail,pass) {
  var user = mail.match(/^[\w.]+/)
  let mailOptions = {
    from: 'iris4notice@gmail.com',
    to: mail,
    subject: 'Password for login',
    html: '<h3>รหัสเข้าใช้งานสำหรับ '+user+' : '+pass+'</h3>'
  }
  transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        log.logger('error',err)
      else
      if (info.accepted) {
        log.logger('info','Send password success: '+info.accepted)
      } else if (info.rejected) {
        log.logger('info','Send password reject: '+info.rejected)
      }
  })
}
  
exports.send = send
exports.sendb = sendb