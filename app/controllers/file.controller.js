const moment = require('moment')
const con = require('../../bin/mysql')
const linenotify = require('../../bin/linenotify')
const path = require('path')
exports.uploadFile = async (req, res) => {
 let data = {
  file: req.file
 }
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