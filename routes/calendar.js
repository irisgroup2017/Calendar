var express = require('express'),
router = express.Router()

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
		parms = { title: 'ระบบจอง', head1: 'ระบบจอง', head2: ' ' + userName }
		parms.user = userName
		parms.operator = dataop
	} else {
		res.redirect('/login')
	}
	res.render('calendar', parms)
})

module.exports = router