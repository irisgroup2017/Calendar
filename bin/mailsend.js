const nodemailer = require('nodemailer'),
 ll = require('../bin/larlist'),
 con = require('../bin/mysql'),
 log = require('../bin/logger')
transporter = nodemailer.createTransport({
      host: 'smtp.office365.com',
      port: 587,
      secure: false,
      auth: {
            user: process.env.USERMAIL,
            pass: process.env.USERPASS
      }
})

async function send(status, user, larid, mail) {
 let result = await con.q('SELECT * FROM lar_data WHERE id = ?', larid)
 let start = result[0].start
 let userName = result[0].userName
 let end = result[0].end
 let allDay = result[0].allDay
 let className = result[0].className
 let title = result[0].title
 let larType
 let qlink = 'http://webapp.iris.co.th:3000/login'
 if (mail == 'hr') {
  mail = process.env.DB_MAILHR
 } else if (mail == 'user') {
  mail = await con.q('SELECT mail FROM user_data WHERE dataid = ?', result[0].dataid), mail = mail[0].mail
 } else if (mail == 'boss') {
  mail = result[0].mailGroup
 }
 timec = ll.getDayTime(start, end, allDay)
 if (className == 'label-grey') {
  larType = 'ลาป่วย'
 } else if (className == 'label-dark') {
  larType = 'ลากิจไม่รับค่าจ้าง'
 } else if (className == 'label-success') {
  larType = 'ลากิจ'
 } else if (className == 'label-warning') {
  larType = 'ลาพักร้อน'
 } else if (className == 'label-danger') {
  larType = 'ลาสลับวันหยุด'
 } else if (className == 'label-info') {
  larType = title
 }
 let mailOptions = {
  from: 'iris4notice@gmail.com',
  to: mail,
  subject: status + ' ' + larType,
  html: '<h3>' + status + '' + larType + ' โดย ' + user + '</h3>\
        <h5>ผู้ลา: ' + userName + '</h5>\
        <table>\
        <tr>\
        <td>ประเภท</td>\
        <td>' + larType + '</td>\
        </tr>\
        <tr>\
        <td>เหตุผล</td>\
        <td>' + title + '</td>\
        </tr>\
        <tr>\
        <td>วันที่ลา</td>\
        <td>' + timec.dateStart + (timec.dateEnd == timec.dateStart ? '' : ' - ' + timec.dateEnd) + '</td>\
        </tr>\
        <tr>\
        <tr>\
        <td>ช่วงเวลา</td>\
        <td>' + timec.timeStart + (timec.timeEnd ? ' - ' + timec.timeEnd : '') + '</td>\
        </tr>\
        <tr>\
        <td>ระยะเวลา</td>\
        <td>' + timec.daylength + '</td>\
        </tr>\
        </table><br>\
        <a href="' + qlink + '"><button class="blue">เข้าสู่ระบบ</button></a>'
 }
 log.logger('info', mailOptions)
 transporter.sendMail(mailOptions, function (err, info) {
  if (err) {
   log.logger('error', err)
  } else {
   if (info.accepted) {
    log.logger('info', 'Send mail success: ' + status + ' ' + larType + ' to ' + info.accepted)
   } else if (info.rejected) {
    log.logger('info', 'Send mail reject: ' + status + ' ' + larType + ' to ' + info.rejected)
   }
  }
 })
}

async function sendb(mail, pass) {
 var user = mail.match(/^[\w.]+/)
 let mailOptions = {
  from: 'iris4notice@gmail.com',
  to: mail,
  subject: 'Password for login',
  html: '<h3>รหัสเข้าใช้งานสำหรับ ' + user + ' : ' + pass + '</h3>'
 }
 transporter.sendMail(mailOptions, function (err, info) {
  if (err)
   log.logger('error', err)
  else
  if (info.accepted) {
   log.logger('info', 'Send password success: ' + info.accepted)
  } else if (info.rejected) {
   log.logger('info', 'Send password reject: ' + info.rejected)
  }
 })
}

async function sendm(option) {
 let qlink = 'http://webapp.iris.co.th:3000/memo/view/'+ option.docId
 let to = option.to
 let from = option.from
 let cc = option.cc
 let subject = option.subject
 let document = option.docNum
 let mailOptions = {
  from: 'iris4notice@gmail.com',
  to: to,
  subject: 'แจ้งเตือนการออกบันทึกภายใน: ' + document,
  html: '<table>\
        <tr>\
         <td>เลขที่เอกสาร</td>\
         <td>' + document + '</td>\
        </tr>\
        <tr>\
         <td>ชื่อเรื่อง</td>\
         <td>' + subject + '</td>\
        </tr>\
        <tr>\
         <td>ผู้ออกสารเอกสาร</td>\
         <td>' + from + '</td>\
        </tr>\
        <tr>\
        <tr>\
        <td>ลิงค์เพื่อเปิดดูเอกสาร</td>\
        <td><a href="' + qlink + '"><button class="blue">'+document+'</button></a></td>\
        </tr>\
        </table>'
 }
 if (typeof cc == 'object') {
  mailOptions.cc = cc
 }
 log.logger('info', mailOptions)
 transporter.sendMail(mailOptions, function (err, info) {
  if (err) {
   log.logger('error', err)
  } else {
   if (info.accepted) {
    log.logger('info', 'Send mail success: ' + document + ' to ' + info.accepted)
   } else if (info.rejected) {
    log.logger('info', 'Send mail reject: ' + document + ' to ' + info.rejected)
   }
  }
 })
}

exports.send = send
exports.sendb = sendb
exports.sendm = sendm