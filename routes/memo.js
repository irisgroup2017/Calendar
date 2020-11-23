const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const memo = require('../bin/memo')
const api = require('../bin/getapi')
const core = require('./scriptscore')
const moment = require('moment')
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

router.get('/view/:memoId', async function(req, res) {
 if (req.cookies) {
  let memoId = req.params.memoId
  parms = { title: 'MEMO View', head1: 'MEMO View' }
  parms = core.objUnion(parms,core.cookies(req.cookies))
  let memo = await con.q('SELECT memo_id,memo_code,DATE_FORMAT(memo_date,"%d/%m/%Y") memo_date,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_file,memo_content,memo_admin,memo_boss,memo_approver,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE memo_id = ?',[memoId])
  let contact = (await con.q("SELECT dataid,name,job FROM contact_data")).reduce((acc,it) => (acc[it.dataid] = it,acc),{})
  let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc,it) => (acc[it.ID] = it,acc),{})
  let objs = core.relation(memo,contact,depart)
  parms.objs = objs[0]
  res.render('memoview',parms)
 } else {
		res.redirect('login')
	}
})

router.get('/list', async function(req, res) {
	if (req.cookies) {
  let year = (new Date()).getFullYear()-1
  parms = { title: 'รายการเมโมที่เกี่ยวข้อง', head1: 'MEMO' }
  parms = core.objUnion(parms,core.cookies(req.cookies))
  let memo = await con.q("SELECT memo_id,memo_create,memo_code,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_file,memo_admin,memo_boss,memo_approver,memo_verifytime,memo_approvetime,memo_create,memo_edit,memo_refuse,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE year(memo_date) >= ?",[year])
  let contact = (await con.q("SELECT dataid,name,level FROM contact_data")).reduce((acc,it) => (acc[it.dataid] = it,acc),{})
  let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc,it) => (acc[it.ID] = it,acc),{})
  let dataid = parms.dataid
  let departid = contact[dataid].level
  parms.depart = depart[departid].depart
  let objs = memo.filter(check => core.persist(dataid,departid,[check.memo_from,check.memo_to,check.memo_cc]))
  objs = core.relation(objs,contact,depart)
  parms.objs = objs
  res.render('memolist',parms)
	} else {
		res.redirect('login')
	}
})

router.get('/decision',async function(req,res) {
 parms = { title: 'เมโมที่ต้องพิจารณา', head1: 'MEMO' }

})

router.post('/attachdel',async function(req,res) {
 let path = req.body.path
 if (fs.existsSync(path)) {
  fs.unlinkSync(path)
 }
 res.send('ok')
})

router.post('/attachmultidel',async function(req,res) {
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