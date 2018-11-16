var express = require('express'),
router = express.Router(),
ll = require('../bin/larlist'),
con = require('../bin/mysql'),
larstock = require('../bin/larstock')

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
		parms = { title: 'ระบบลา', head1: 'ระบบลา' }
		parms.lars = await ll.viewLar(userName,dataid,new Date().getTime())
		parms.larl = parms.lars.length
		parms.user = userName
		parms.operator = dataop
	} else {
		res.redirect('/login')
	}
	res.render('lar', parms)
})

router.post('/', async function(req, res) {
	if (req.body.state == 'viewrender') {
		if (req.cookies.user_name) {
			await larstock.updateLar(req.cookies.user_name,req.cookies.user_dataid,parseInt(req.body.endtime))
			updatedur = await ll.viewLar(req.cookies.user_name,req.cookies.user_dataid,parseInt(req.body.endtime))
		} else {
			res.redirect('/login')
		}
		res.json(updatedur)
	}
	if (req.body.state == 'getvacation') {
		var mydata = await con.q('SELECT * FROM vacation_list WHERE doffice BETWEEN ? AND ? OR dsite BETWEEN ? AND ?',[req.body.start,req.body.end,req.body.start,req.body.end])
		res.json(mydata)
	}
})

module.exports = router