var express = require('express'),
router = express.Router(),
ll = require('../bin/larlist'),
con = require('../bin/mysql'),
larstock = require('../bin/larstock'),
log = require('../bin/logger')
const fingerscan = require('../bin/fingerscan')

/* GET /lar. */
router.get('/loaddata', async function(req, res) {
 fingerscan.fingerToJSON()
 res.redirect('/lar')
})
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
	if (req.body.state == 'viewfile') {
		fileExt = req.body.thisfile.substring(req.body.thisfile.lastIndexOf('.')).toLowerCase()
		filename = '/doc/' +req.body.thisname+ '/' +req.body.thisfile
		res.send(filename)
	}
	if (req.body.state == 'viewrender') {
		if (req.cookies.user_name) {
			await larstock.updateLar(req.cookies.user_name,req.cookies.user_dataid,parseInt(req.body.endtime))
			updatedur = await ll.viewLar(req.cookies.user_name,req.cookies.user_dataid,parseInt(req.body.endtime))
		} else {
			res.redirect('/login')
		}
		res.json(updatedur)
	}
	//
	if (req.body.state == 'getvacation') {
		var result = await con.q('SELECT wplace FROM privacy_data WHERE dataid = ?',[req.cookies.user_dataid])
		var mydata = await con.q('SELECT * FROM vacation_list WHERE '+(result[0].wplace == 1? 'doffice' : 'dsite')+' BETWEEN ? AND ?',[req.body.start,req.body.end])
		var myswap = await con.q('SELECT title,swapDate,start FROM lar_data WHERE className = ? AND dataid = ? AND swapDate BETWEEN ? AND ? AND approve > 0',['label-danger',req.cookies.user_dataid,req.body.start/1000,req.body.end/1000])
		var myattach = await con.q('SELECT start,fname FROM lar_data WHERE dataid = ? AND start BETWEEN ? AND ?',[req.cookies.user_dataid,req.body.start/1000,req.body.end/1000])
		req.body.wplace = (result[0].wplace == 1 ? 'doffice' : 'dsite')
		req.body.mydata = mydata
		req.body.myswap = myswap
		req.body.myattach = myattach
		req.body.thisname = req.cookies.user_name
		res.json(req.body)
	}
})

module.exports = router