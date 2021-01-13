const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
//const memo = require('../bin/memo')
const api = require('../bin/api')
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

router.get('/edit/:memoId', async function(req, res) {
 if (req.cookies) {
  let memoId = parseInt(req.params.memoId)
  parms = { title: 'MEMO Edit', head1: 'MEMO Edit' }
  parms = core.objUnion(parms,core.cookies(req.cookies))
  let memo = await con.q('SELECT * FROM memo WHERE memo_id = ?',[memoId])
  parms.objs = memo[0]
  parms.objs.memo_date = moment(parms.objs.memo_date).format("DD/MM/YYYY")
  if (parms.objs.memo_path) {
   let path = parms.objs.memo_path.match(/(\\public\\).*/)[0]
   if (parms.objs.memo_file.match(',') && parms.objs.memo_file.match(',').length > -1) {
    let file = parms.objs.memo_file.split(',')
    parms.objs.memo_file = file.map(f => f.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi,""))
    parms.objs.memo_path = file.map(f => path +''+ f)
   } else {
    let file = parms.objs.memo_file
    parms.objs.memo_singlefile = file.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi,"").toString()
    parms.objs.memo_path = path +''+ file
   }
  }
  console.log(parms)
  res.render('memoedit',parms)
 } else {
		res.redirect('../login')
	}
})

router.get('/view/:memoId', async function(req, res) {
 if (req.cookies) {
  let memoId = req.params.memoId
  let id = req.cookies.user_dataid
  let time = moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
  parms = { title: 'MEMO View', head1: 'MEMO View' }
  parms = core.objUnion(parms,core.cookies(req.cookies))
  await con.q('INSERT INTO memo_read (memo_id,user_read,date_read) VALUES (?,?,?) WHERE NOT EXISTS ( SELECT memo_id FROM memo_read WHERE memo_id = ? AND user_read = ? ) LIMIT 1;',[memoId,id,time,memoId,id])
  let memo = await con.q('SELECT memo_id,memo_code,DATE_FORMAT(memo_date,"%d/%m/%Y") memo_date,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_path,memo_file,memo_content,memo_admin,memo_boss,memo_approver,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE memo_id = ?',[memoId])
  let contact = (await con.q("SELECT dataid,name,job FROM contact_data")).reduce((acc,it) => (acc[it.dataid] = it,acc),{})
  let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc,it) => (acc[it.ID] = it,acc),{})
  let objs = core.relation(memo,contact,depart)
  parms.objs = objs[0]
  if (parms.objs.memo_path) {
   let path = parms.objs.memo_path.match(/(\\public\\).*/)[0]
   if (parms.objs.memo_file.match(',') && parms.objs.memo_file.match(',').length > -1) {
    let file = parms.objs.memo_file.split(',')
    parms.objs.memo_file = file.map(f => f.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi,""))
    parms.objs.memo_path = file.map(f => path +''+ f)
   } else {
    let file = parms.objs.memo_file
    parms.objs.memo_singlefile = file.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi,"").toString()
    parms.objs.memo_path = path +''+ file
   }
  }
  res.render('memoview',parms)
 } else {
		res.redirect('login')
	}
})

router.get('/list', async function(req, res) {
	listMemo(req,res)
})
router.get('/list/:year', async function(req, res) {
	listMemo(req,res)
})

router.post('/action',async function(req,res) {
 let status = parseInt(req.body.status)

 switch (req.body.eventId) {
  case '0':
   status++
   break
  case '1':
   status = status+2
   break
  case '2':
   status = 6
   break
 }

 let result = await api('post','/memo/update',{
  where: {
   memoId: req.body.memoId
  },
  data: {
   memoStatus: status
  }
 })

 res.send(result)
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

async function listMemo (req, res) {
 if (req.cookies) {
  let year = (req.params.year ? req.params.year : (new Date()).getFullYear())
  year = (year-400 > (new Date()).getFullYear() ? year-543 : year)
  parms = { title: 'รายการเมโมที่เกี่ยวข้อง', head1: 'MEMO' }
  parms = core.objUnion(parms,core.cookies(req.cookies))
  let memo = await con.q("SELECT memo_id,memo_create,memo_code,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_file,memo_admin,memo_boss,memo_approver,memo_verifytime,memo_approvetime,memo_create,memo_edit,memo_refuse,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE year(memo_date) >= ?",[year])
  let contact = (await con.q("SELECT dataid,name,level,job FROM contact_data")).reduce((acc,it) => (acc[it.dataid] = it,acc),{})
  let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc,it) => (acc[it.ID] = it,acc),{})
  let dataid = parms.dataid
  let departid = contact[dataid].level
  parms.depart = depart[departid].depart
  let objs = memo.filter(check => core.persist(dataid,departid,[check.memo_from,check.memo_to,check.memo_cc]))
  objs = core.classAssign(objs,dataid)
  objs = core.relation(objs,contact,depart)
  parms.objs = objs
  res.render('memolist',parms)
	} else {
		res.redirect('login')
	}
}

module.exports = router