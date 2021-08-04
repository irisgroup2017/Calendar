var express = require('express'),
router = express.Router()

router.get('/', async function(req, res, next) {
	parms = { title: 'ลงชื่อเข้าใช้งาน', head1: 'ลงชื่อเข้าใช้งาน' }
	if (req.query.status) { parms.status = req.query.status }
 res.render('login', parms) 
})

module.exports = router