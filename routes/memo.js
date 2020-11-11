const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const memo = require('../bin/memo')
const api = require('../bin/getapi')
const core = require('./scriptscore') 
const fs = require('fs')

router.get('/', async function(req, res) {
 var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
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

router.get('/list', async function(req, res) {
	if (req.cookies) {
  parms = { title: 'MEMO', head1: 'MEMO' }
  parms = core.objunion(parms,core.cookies(req.cookies))
  let query = "SELECT * FROM memo AS m LEFT JOIN Encoding contact_data AS cd ON m.memo_admin = cd.emid"
  let result = await con.q(query)
  console.log(result)
  res.render('memolist',parms)
	} else {
		res.redirect('login')
	}
})

router.post('/attachdel',async function(req,res){
 let path = req.body.path
 if (fs.existsSync(path)) {
  fs.unlinkSync(path)
 }
 res.send('ok')
})

router.post('/attachmultidel',async function(req,res){
 let list = req.body.file
 list.map(function(e) {
  let path = e.path
  if (fs.existsSync(path)) {
   fs.unlinkSync(path)
  }
 })
 res.send('ok')
})

module.exports = router