var express = require('express'),
router = express.Router(),
ll = require('../bin/larlist')

/* GET /lar. */
router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'ระบบลา', head1: 'ระบบลา', head2: userName }
		parms.lars = await ll.viewLar(userName,dataid)
		parms.larl = parms.lars.length
		parms.user = userName
		parms.operator = dataop
	} else {
		res.redirect('/login')
	}
	res.render('lar', parms)
})

module.exports = router