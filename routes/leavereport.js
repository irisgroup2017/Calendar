const express = require('express')
const router = express.Router()
const log = require('../bin/logger')

router.get('/',async function(req,res) {
 var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
  }
		parms = { title: 'รายงานการปฎิบัติงานของพนักงาน', head1: 'Employee Report' }
		parms.user = userName
  parms.operator = dataop
  parms.year = (new Date()).getFullYear()
  parms.month = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]
	} else {
		res.redirect('/login')
 }
 res.render('leavereport',parms)
})

router.post('/ip',async function(req,res) {
 let ip = process.env.PROTOCAL+ '://' + process.env.WEBAPP + ':' + process.env.PORT_API
 res.json(ip)
})

module.exports = router