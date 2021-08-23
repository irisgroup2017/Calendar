const qs = require('qs');
const con = require('../../bin/mysql')
const moment = require('moment')
const path = require('path')
const linenotify = require('../../bin/linenotify')
exports.uploadDailyPic = async (req, res) => {
 //let page = req.get('referer')
 let data = {
  file: req.file,
  cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
 }
 data.file.urlpath = path.join('\\public','image',moment().format('YYYY-MM-DD'),data.file.filename)
 let message = `\n${data.cookies.user_name} รายงานตัวเข้างานวันที่ ${moment().format("DD/MM/YYYY")}`
 //let host = req.headers.origin
 //let filepath = path.join(host,data.file.path.match(/(\\public)(.*)/g)[0])
 //linenotify.image(filepath,message)
 let status = 1
 let result = await con.q('INSERT INTO dailycheckin (dataid,date,filename,time) VALUES (?,?,?,?)',[data.cookies.user_dataid,moment().format('YYYY-MM-DD'),data.file.filename,moment().format('HH:mm:ss')])
 if (result == undefined) {
  await con.q('UPDATE dailycheckin SET filename = ?,time = ? WHERE dataid = ? AND date = ?',[data.file.filename,moment().format('HH:mm:ss'),data.cookies.user_dataid,moment().format('YYYY-MM-DD')])
  status = 0
 }
 data.status = status
 if (status) {
  linenotify.message(message)
 }
 res.json(data)
}