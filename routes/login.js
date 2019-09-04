var express = require('express'),
router = express.Router()

router.get('/', async function(req, res, next) {
	parms = { title: 'ลงชื่อเข้าใช้งาน', head1: 'ลงชื่อเข้าใช้งาน' }
	if (req.query.status) { parms.status = req.query.status }
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		res.redirect('/')
    }
	else { res.render('login', parms) }
})
module.exports = router