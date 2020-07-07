const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')

router.get('/', async function(req, res) {
 var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail,
	now = new Date()
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'MEMO', head1: 'MEMO' }
		parms.user = userName
		parms.operator = dataop
		res.render('memo',parms)
	} else {
		res.redirect('login')
	}
})

router.post('/create', async function(req, res) {

})

module.exports = router