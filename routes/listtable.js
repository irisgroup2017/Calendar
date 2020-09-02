const express = require('express')
const router = express.Router()

router.get('/',async function(req,res,next) {
 var userName = req.cookies.user_name
 var dataop = req.cookies.user_op
	if (userName) {
  parms = { title: 'รายการสถานะทรัพย์สิน', head1: 'Property Status List' }
		parms.user = userName
  parms.operator = dataop
 } else {
  res.redirect('/')
 }
 res.render('listtable',parms)
})

module.exports = router