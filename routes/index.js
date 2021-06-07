var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ls = require('../bin/larstock')
const moment = require('moment')

/* GET home page. */
router.get('/',async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail,
 now = (new Date()).getTime()
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'หน้าแรก', head1: 'หน้าแรก' }
		parms.user = userName
  parms.operator = dataop
  parms.moment = moment
  parms.newAnnounce = (date) => (moment().diff(moment(date),'days') < 2 ? true : false)
  parms.read = (id,list) => (list.indexOf(id) > -1 ? true : false)
  ls.updateLar(userName,dataid,now)
  parms.note = await con.q('SELECT * FROM notice_data ORDER BY note_create DESC')
  parms.noteRead = (await con.q('SELECT * FROM notice_read WHERE dataid = ?',[dataid])).map(line => line.note_id)
		res.render('index', parms)
	} else {
		res.redirect('login')
	}
})

router.post('/read',async function(req, res) {
 if (req.cookies.user_dataid) {
  let now = new Date()
  con.q('INSERT IGNORE INTO notice_read (note_id,dataid,note_read) VALUES (?,?,?)',[req.body.id,req.cookies.user_dataid,now])
  res.end()
 } else {
  res.redirect('login')
 }
 console.log(req.body)
})

module.exports = router