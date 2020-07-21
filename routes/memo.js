const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const memo = require('../bin/memo')
const api = require('../bin/getapi')

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
  let depart = { 
   attributes: ["ID","depart"] 
  }
  //let test = await api.getAll('/depart/find/all')
  let test = await api.get('/depart/find/field',depart)
  console.log(test)
	} else {
		res.redirect('login')
	}
})

router.post('/create', async function(req, res) {

})

router.get('/app', async function(req,res) {
 
})

module.exports = router