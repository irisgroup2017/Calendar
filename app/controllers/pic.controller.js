const qs = require('qs');
const con = require('../../bin/mysql')
const moment = require('moment')
exports.uploadDailyPic = async (req, res) => {
 //let log = require(__basedir+'/bin/logger')
 let page = req.get('referer')
 let data = {
    file: req.file,
    cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
 }

 // log applicationForm
 //log.logger('info',data.username+' Upload attachment: '+data.file.filename+' file')
 await con.q('INSERT INTO dailycheckin (dataid,date,filename) VALUES (?,?,?)',[data.cookies.user_dataid,moment().format('YYYY-MM-DD'),data.file.filename])
 //res.send(data)
 res.redirect(page);
}