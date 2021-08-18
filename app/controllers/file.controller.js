const moment = require('moment')
const con = require('../../bin/mysql')
const linenotify = require('../../bin/linenotify')
const path = require('path')
exports.uploadFile = async (req, res) => {
 let data = {
  file: req.file,
  cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
 }
 let host = req.headers.origin
 let message = `\n${data.cookies.user_name} รายงานตัวเข้างานวันที่ ${moment().fotmat("DD/MM/YYYY")}`
 let filepath = path.join(host,data.file.path.match(/(\\public)(.*)/g)[0])
 linenotify.image(filepath,message)
 res.send(data)
}

exports.uploadDaily = async (req, res) => {
 let data = {
  file: req.file,
  id: req.body.id
 }
 let message = `\n${data.cookies.user_name} รายงานตัวเลิกงานวันที่ ${moment().fotmat("DD/MM/YYYY")}`
 await con.q('UPDATE dailycheckin SET docname = ? WHERE id = ?',[data.file.filename,data.id])
 linenotify.message(message)
 res.send(data)
}