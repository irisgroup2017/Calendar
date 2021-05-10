const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
//const memo = require('../bin/memo')
const api = require('../bin/api')
const core = require('./scriptscore')
const moment = require('moment')
const fs = require('fs')
const mailsend = require('../bin/mailsend')

router.get('/', async function (req, res) {
 var userName = req.cookies.user_name,
  dataid = req.cookies.user_dataid,
  dataop = req.cookies.user_op,
  mail = req.cookies.user_mail
 if (userName) {
  data = {
   'username': userName,
   'dataid': dataid,
   'operator': dataop,
   'mail': mail
  }
  parms = {
   title: 'MEMO',
   head1: 'MEMO'
  }
  parms.user = userName
  parms.operator = dataop
  res.render('memo', parms)
 } else {
  res.redirect('/login')
 }
})

router.get('/edit/:memoId', async function (req, res) {
 if (req.cookies) {
  let memoId = parseInt(req.params.memoId)
  parms = {
   title: 'MEMO Edit',
   head1: 'MEMO Edit'
  }
  parms = core.objUnion(parms, core.cookies(req.cookies))
  let memo = await con.q('SELECT * FROM memo WHERE memo_id = ?', [memoId])
  parms.objs = memo[0]

  if ((parms.objs) && (parms.objs.memo_status == 2 || parms.objs.memo_status == 4) && (req.cookies.user_dataid == parms.objs.memo_admin)) {
   parms.objs.memo_date = moment(parms.objs.memo_date).format("DD/MM/YYYY")
   if (parms.objs.memo_path) {
    let path = parms.objs.memo_path.match(/(\\public\\).*/)[0]
    if (parms.objs.memo_file.includes(",")) {
     let file = parms.objs.memo_file.split(',')
     parms.objs.memo_file = file.map(f => f.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi, ""))
     parms.objs.memo_path = file.map(f => path + '' + f)
    } else {
     let file = parms.objs.memo_file
     parms.objs.memo_singlefile = file.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi, "").toString()
     parms.objs.memo_path = path + '' + file
    }
   }
   res.render('memoedit', parms)
  } else {
   res.render('cannotaccess', parms)
  }
 } else {
  res.redirect('/login')
 }
})

router.get('/view/:memoId', async function (req, res) {
 if (req.cookies) {
  let memoId = req.params.memoId
  let id = req.cookies.user_dataid
  let time = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
  parms = {
   title: 'MEMO View',
   head1: 'MEMO View'
  }
  parms = core.objUnion(parms, core.cookies(req.cookies))
  let readw = await api('post', '/memolog/recordread', {
   memoId: memoId,
   dataId: id,
   statusId: 7,
   time: time
  })
  let timeline = await api('get', '/memolog/getlog', {
   memoId: memoId
  })
  let memo = await con.q('SELECT memo_id,memo_code,DATE_FORMAT(memo_date,"%d/%m/%Y") memo_date,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_path,memo_file,memo_content,memo_admin,memo_boss,memo_approver,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE memo_id = ?', [memoId])
  let contact = (await con.q("SELECT dataid,name,lastName,jobPos FROM user_data")).reduce((acc, it) => (acc[it.dataid] = it, acc), {})
  let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc, it) => (acc[it.ID] = it, acc), {})
  let objs = core.relation(memo, contact, depart)
  parms.objs = objs[0]

  if (timeline && timeline.length > 0) {
   parms.objs.memo_timeline = timeline.reduce((acc, it) => {
    let date = moment(it.time).format("YYYYMMDD")
    let timeshow = moment(it.time).locale('th').format("DD MMMM YYYY (HH:mm:ss)")
    let time = moment(it.time).format("Hmmss")
    let user = contact[it.dataId].name +' '+ contact[it.dataId].lastName
    let path = (it.path ? it.path : "")
    let oriname = (it.originalName ? it.originalName : "")
    acc[date] = acc[date] || {}
    acc[date][time] = acc[date][time] || {}
    acc[date][time] = {
     user: user,
     status: it.statusId,
     comment: it.comment,
     timeshow: timeshow,
     path: path,
     originalName: oriname
    }
    return acc
   }, {})
  }

  if (parms.objs.memo_path) {
   let path = parms.objs.memo_path
   if (parms.objs.memo_file.includes(',')) {
    let file = parms.objs.memo_file.split(',')
    parms.objs.memo_file = file.map(f => f.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi, ""))
    parms.objs.memo_path = file.map(f => path + '' + f)
   } else {
    let file = parms.objs.memo_file
    parms.objs.memo_singlefile = file.replace(/\.(.+)(?=[?#])|(\.)(?:[\w]+)$/gmi, "").toString()
    parms.objs.memo_file = parms.objs.memo_singlefile
    parms.objs.memo_path = path + '' + file
   }
  }
  res.render('memoview', parms)
 } else {
  res.redirect('login')
 }
})

router.get('/list', async function (req, res) {
 if (req.cookies.user_dataid != undefined) {
  listAllMemo(req, res)
 } else {
  res.redirect('/')
 }
})
router.get('/list/:year', async function (req, res) {
 if (req.cookies.user_dataid != undefined) {
  listAllMemo(req, res)
 } else {
  res.redirect('/')
 }
})

router.get('/getlog', async function (req, res) {
 let memoId = req.query.memoId
 let data
 let timeline = await api('get', '/memolog/getlog', {
  memoId: memoId
 })
 let contact = (await con.q("SELECT dataid,name,lastName,jobPos FROM user_data")).reduce((acc, it) => (acc[it.dataid] = it, acc), {})
 if (timeline && timeline.length > 0) {
  data = timeline.reduce((acc, it) => {
   let date = moment(it.time).format("YYYYMMDD")
   let timeshow = moment(it.time).locale('th').format("DD MMMM YYYY (HH:mm:ss)")
   let time = moment(it.time).format("Hmmss")
   let user = contact[it.dataId].name +' '+ contact[it.dataId].lastName
   let path = (it.path ? it.path : "")
   let oriname = (it.originalName ? it.originalName : "")
   acc[date] = acc[date] || {}
   acc[date][time] = acc[date][time] || {}
   acc[date][time] = {
    user: user,
    status: it.statusId,
    comment: it.comment,
    timeshow: timeshow,
    path: path,
    originalName: oriname
   }
   return acc
  }, {})
 }
 res.send(data)
})

router.post('/action', async function (req, res) {
 let status = parseInt(req.body.status)
 let approver = req.body.approver
 let statusId
 let data = {}
 switch (req.body.eventId) {
  case '0': //return
   status++
   statusId = status
   break
  case '1': //approve
   if (status == 1 && approver) {
    status = 3
    statusId = 3
    data.memoVerifyTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
   } else {
    status = 5
    statusId = 5
    data.memoApproveTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
   }
   break
  case '2': //reject
   status = 6
   statusId = 6
   break
  case '3': //delete
   status = 0
   statusId = 0
 }
 data.memoStatus = status
 await api('post', '/memolog', {
  memoId: req.body.memoId,
  dataId: req.cookies.user_dataid,
  statusId: statusId,
  time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
 })
 let result = await api('post', '/memo/update', {
  where: {
   memoId: req.body.memoId
  },
  data: data
 })

 res.send(result)
})

router.post('/getdetail',async function (req, res) {
 if (req.cookies.user_dataid != undefined) {
  res.json(await api('get','/memo/getdetail',req.body))
 } else {
  res.redirect('/')
 }
})

router.post('/attachdel', async function (req, res) {
 let id = req.body.id
 let file = req.body.path.replace(/.*[\/\\]/, "")
 let filename = await con.q("SELECT memo_file FROM memo WHERE memo_id = ?", [id])
 if (filename.length) {
  filename = filename[0].memo_file
  if (filename.includes(",")) {
   filename = filename.split(",").filter(i => i != file).toString()
  } else {
   filename = filename.replace(file, "")
  }
  if (filename == "") {
   con.q("UPDATE memo SET memo_file = ?,memo_path = ? WHERE memo_id = ?", [filename, "", id])
  } else {
   con.q("UPDATE memo SET memo_file = ? WHERE memo_id = ?", [filename, id])
  }
 }
 let path = __basedir + "" + req.body.path
 if (fs.existsSync(path)) {
  fs.unlinkSync(path)
 }
 res.send('ok')
})

router.post('/attachmultidel', async function (req, res) {
 let list = req.body.file
 if (typeof list == "object") {
  list.map(function (e) {
   let path = e.path
   if (fs.existsSync(path)) {
    fs.unlinkSync(path)
   }
  })
 }
 res.send('ok')
})

async function listAllMemo(req,res) {
 let year = (req.params.year ? req.params.year : (new Date()).getFullYear())
 year = (year - 400 > (new Date()).getFullYear() ? year - 543 : year)
 parms = {
  title: 'รายการเมโมที่เกี่ยวข้อง',
  head1: 'MEMO'
 }
 parms = core.objUnion(parms, core.cookies(req.cookies))
 let memo = await con.q("SELECT memo_id,memo_create,memo_code,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_file,memo_admin,memo_boss,memo_approver,memo_verifytime,memo_approvetime,memo_create,memo_edit,memo_refuse,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE year(memo_date) = ?", [year])
 let contact = (await con.q("SELECT dataid,name,lastName,jobPos FROM user_data")).reduce((acc, it) => (acc[it.dataid] = it, acc), {})
 let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc, it) => (acc[it.ID] = it, acc), {})
 let dataid = parms.dataid
 let departid = contact[dataid].level
 parms.depart = depart[departid].depart
 memo = core.classAssign(memo, dataid)
 memo = core.relation(memo, contact, depart)
 parms.objs = memo
 res.render('memolist', parms)
}

async function listMemo(req, res) {
 let year = (req.params.year ? req.params.year : (new Date()).getFullYear())
 year = (year - 400 > (new Date()).getFullYear() ? year - 543 : year)
 parms = {
  title: 'รายการเมโมที่เกี่ยวข้อง',
  head1: 'MEMO'
 }
 parms = core.objUnion(parms, core.cookies(req.cookies))
 let memo = await con.q("SELECT memo_id,memo_create,memo_code,memo_subject,memo_from,memo_to,memo_cc,m.memo_status,memo_file,memo_admin,memo_boss,memo_approver,memo_verifytime,memo_approvetime,memo_create,memo_edit,memo_refuse,ms.memo_title memo_title FROM memo m INNER JOIN memo_status ms ON m.memo_status=ms.memo_status WHERE year(memo_date) = ?", [year])
 let contact = (await con.q("SELECT dataid,name,lastName,jobPos FROM user_data")).reduce((acc, it) => (acc[it.dataid] = it, acc), {})
 let depart = (await con.q("SELECT ID,depart FROM depart_row")).reduce((acc, it) => (acc[it.ID] = it, acc), {})
 let dataid = parms.dataid
 let departid = contact[dataid].level
 parms.depart = depart[departid].depart
 let objs = memo.filter(check => core.persist(dataid, departid, [check.memo_from, check.memo_to, check.memo_cc]))
 objs = core.classAssign(objs, dataid)
 objs = core.relation(objs, contact, depart)
 parms.objs = objs
 res.render('memolist', parms)
}

router.post('/creatememo', async function (req, res) {
 let data = req.body.data
 data.cookies = req.cookies
 let result = await api('POST',req.body.path,data)
 if (result && typeof result == 'object') {
  if (result.status == 'create') {
   let from = data.memoFrom
   let to = data.memoTo
   let cc = data.memoCc
   cc = (cc.indexOf(',') ? cc.split(',') : cc)
   let email = await getMail(from,to,cc)
   email.subject = data.memoSubject
   email.docId = result.memoId
   email.docNum = result.memoCode
   mailsend.sendm(email)
  }
  res.json(result)
 } else {
  res.end()
 }
})

async function getMail(from,to,cc) {
 let contact = (await con.q("SELECT dataid,name,lastName,jobPos FROM user_data")).reduce((acc, it) => (acc[it.dataid] = it, acc), {})
 let depart = (await con.q("SELECT ID,depart,depart_mail FROM depart_row")).reduce((acc, it) => (acc[it.ID] = it, acc), {})
 let mail = {}
 mail.from = (contact[from] != undefined ? contact[from].name : depart[from].depart)
 mail.to = (contact[to] != undefined ? contact[to].email : depart[to].depart_mail)
 mail.cc = cc.map(id => {
  if (contact[id] != undefined) {
   return contact[id].email
  } else if (depart[id] != undefined) {
   return depart[id].depart_mail
  }
 },[])
 return mail
}

module.exports = router