const express = require('express')
const router = express.Router()
const log = require('../bin/logger')
const dns = require('dns')

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

router.post('/address',async function(req,res) {
 var url = (req.get('host').split(':'))[0]
  let ip
  async function ipResolve() {
   return new Promise((resolve,reject) => {
    dns.lookup(url,(err,address,family) => {
     if (err) { reject(err) }
     resolve(address !== undefined ? address : 'localhost')
    })
   })
  }
  try {
   ip = await ipResolve()
  } catch(err) {
   console.log(err.stack)
  }
  res.send(req.protocol+"://" + ip)
})

router.post('/ip',async function(req,res) {
 let ip = {
  protocal:req.protocol+"://",
  ip: getIp.get.Ethernet[0]
 }
  res.json(ip)
})

module.exports = router