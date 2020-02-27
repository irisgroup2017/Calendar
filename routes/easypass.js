const express = require('express')
const router = express.Router()
const con = require("../bin/mysql")
const log = require("../bin/logger")

/* GET /calendar. */
router.get('/',async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		const result = await con.q("SELECT * FROM licenseplate_data JOIN easypass_data ON licenseplate_data.unixid = easypass_data.unixid")
		parms = { 
			title: 'Easypass', 
			head1: 'ยอดเงินคงเหลือ', 
			head2: ' ' + userName,
			user: userName,
			operator: dataop,
			easypass: result
		}
	} else {
		res.redirect('/login')
	}
	res.render('easypass', { 
		moment: require('moment'),
		parms: parms
	})
})

module.exports = router