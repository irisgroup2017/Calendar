const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
authHelper = require('../bin/auth')

/* GET home page. */
router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	parms = { title: 'ดูข้อมูลการลา (รายบุคคล)', head1: "Detail Report" }
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		authHelper.fortuneCookies(data,res)
		parms.user = userName
		parms.operator = dataop
		if (dataop < 2) { res.redirect('/') }
	} else {
		res.redirect('/login')
	}
	rows = await con.q('SELECT * FROM privacy_data WHERE userName = ?',userName)
		rows = rows[0]
		if (rows.boss) { 
			result = await con.q('SELECT * FROM user_data WHERE mailGroup = ?',mail)
		} else {
		userName = userName.split(' ')
		result = [{
			'name':userName[0],
			'lastName':userName[1]
		}]
	}
		parms.objs = []
		for (var i = 0; i < result.length; i++) {
			parms.objs.push({
				me: (result[i].name + ' ' + result[i].lastName == userName ? 1 : 0),
				userName: result[i].name + ' ' + result[i].lastName 
			})
		}
		parms.ddl = parms.objs.length
		res.render('sumlar', parms)
})

module.exports = router