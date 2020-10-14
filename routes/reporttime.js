const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')

router.get('/', async function(req, res, next) {
 parms = { title: 'รายงานแสดงเวลาของพนักงาน' }
 let timeStart = req.query.start
 let timeEnd = req.query.end
 let userName = req.cookies.user_name
 let dataid = req.cookies.user_dataid
 let dataop = req.cookies.user_op
 let mail = req.cookies.user_mail
	if (userName && timeStart && timeEnd) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
  }

  query = "SELECT * FROM "
  con.q()

  res.render('reporttime', parms)
 }
	else { res.redirect('/') }
})
module.exports = router