const express = require('express'),
router = express.Router(),
con = require('../bin/mysql')

/* GET home page. */
router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	parms = { title: 'ดูข้อมูลการลา (ทั้งหมด)', head1: "Detail Report" }
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms.user = userName
		parms.operator = dataop
		if (dataop < 2) { res.redirect('/') }
	} else {
		res.redirect('/login')
	}
	res.render('getlar', parms)
})

module.exports = router