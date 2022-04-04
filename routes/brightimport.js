const express = require('express')
const router = express.Router()
const { controller,generateExcel,response } = require('../middleware/brightAttendance')

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
		parms = { title: 'BP ATTENDANCE', head1: 'BP ATTENDANCE', head2: ' ' + userName }
		parms.user = userName
		parms.operator = dataop
	} else {
		res.redirect('/login')
	}
	res.render('brightimport', parms)
})

router.post('/',controller,generateExcel,response)

module.exports = router