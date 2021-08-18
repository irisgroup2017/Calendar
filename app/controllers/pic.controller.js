const qs = require('qs');
const con = require('../../bin/mysql')
const moment = require('moment')
const path = require('path')
const linenotify = require('../../bin/linenotify')
exports.uploadDailyPic = async (req, res) => {
 let page = req.get('referer')
 let data = {
  file: req.file,
  cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
 }
 let host = req.headers.origin
 let message = `\n${data.cookies.user_name} รายงานตัวเข้างานวันที่ ${moment().format("DD/MM/YYYY")}`
 let filepath = path.join(host,data.file.path.match(/(\\public)(.*)/g)[0])
 linenotify.image(filepath,message)
 await con.q('INSERT INTO dailycheckin (dataid,date,filename) VALUES (?,?,?)',[data.cookies.user_dataid,moment().format('YYYY-MM-DD'),data.file.filename])
 res.redirect(page);
}