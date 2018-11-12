const express = require('express'),
router = express.Router(),
con = require('../bin/mysql')

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'ตั้งค่าวันหยุด', head1: 'ตั้งค่าวันหยุดประจำปี', head2: 'User' }
		parms.user = userName
		parms.operator = dataop
		yearlist = await con.q('SELECT DISTINCT year FROM vacation_list')
		parms.yearlist = []
		if (yearlist == "") { 
			parms.yearlist.push(new Date().getFullYear())
		}
		else {
			for (i=0;i<yearlist.length;i++) {
				parms.yearlist.push(yearlist[i].year)
			}
		}
		if (dataop < 3) { res.redirect('/') }
	} else {
		res.redirect('/login')
    }
    res.render('vacationa',parms)
})

module.exports = router