const moment = require('moment')
const con = require('../../bin/mysql')
const linenotify = require('../../bin/linenotify')
const qs = require('qs');
const path = require('path')
exports.uploadFile = async (req, res) => {
 let data = {
  file: req.file
 }
 res.send(data)
}

exports.uploadDaily = async (req, res) => {
 let data = {
  status: req.body.status,
  file: req.file,
  date: req.body.date,
  cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
 }
 let now = moment().format('YYYY-MM-DD')
 let message = `\n${data.cookies.user_name} รายงานตัวเลิกงานวันที่ ${moment().format("DD/MM/YYYY")}`
 await con.q('UPDATE dailycheckin SET docname = ? WHERE dataid = ? AND date = ?',[data.file.filename,data.cookies.user_dataid,data.date])
 if (data.date == now && data.status == "insert") {
  linenotify.message(message)
 }
 res.send(data)
}