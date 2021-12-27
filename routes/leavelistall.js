var express = require('express')
const router = express.Router()

router.get('/', async function(req, res) {
	parms = {
		title: 'แสดงข้อมูลการลาพนักงาน',
		head1: 'แสดงข้อมูลการลาพนักงาน',
		user: req.cookies.user_name,
		operator: req.cookies.user_op
	}
	res.render('hrviewleave', parms)
})

module.exports = router