var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ls = require('../bin/larstock')

/* GET home page. */
router.get('/',async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail,
 now = (new Date()).getTime()
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'หน้าแรก', head1: 'หน้าแรก' }
		parms.user = userName
  parms.operator = dataop
  ls.updateLar(userName,dataid,now)
		res.render('index', parms)
	} else {
		res.redirect('login')
	}
})
module.exports = router