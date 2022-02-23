const express = require('express')
const con = require('../bin/mysql')
const router = express.Router()
const moment = require('moment')
const log = require('../bin/logger')
const fs = require("fs")
const api = require("../bin/api")

router.get('/', async function (req, res) {
 let userName = req.cookies.user_name,
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
   title: 'ตั้งค่า',
   head1: 'Manage',
   head2: 'User'
  }
  parms.user = userName
  parms.operator = dataop
  if (dataop < 3) {
   res.redirect('/')
  }
 } else {
  res.redirect('/login')
 }
 let depart = await con.q('SELECT * FROM depart_row ORDER BY row ASC,ID ASC')
 var dept = []
 for (const dep of depart) {
  dept.push({
   depid: dep.ID,
   deptitle: dep.depart.split("(")[0].replace(/\s$/, "")
  })
 }
 let bosslist = await con.q('SELECT privacy_data.userName,user_data.mail FROM privacy_data LEFT JOIN user_data ON privacy_data.dataid = user_data.dataid WHERE user_data.status = 1 AND (privacy_data.boss = 1 OR privacy_data.operator = 3)')
 var bossl = []
 for (const boss of bosslist) {
  bossl.push({
   bossname: boss.userName,
   bossmail: boss.mail
  })
 }
 parms.departlist = dept
 parms.bosslist = bossl
 depart = depart.reduce((acc, it) => (acc[it.ID] = it, acc), {})
 sql = ['SELECT * FROM privacy_data WHERE userName = ?', 'SELECT * FROM user_data ORDER BY name ASC']
 con.q(sql, userName)
  .catch(err => {
   throw err
  })
  .then(results => {
   result = results[1]
   parms.objs = []
   for (let i = 0; i < result.length; i++) {
    parms.objs.push({
     dataid: result[i].dataid,
     cdate: result[i].cdate,
     emid: result[i].emid,
     name: result[i].name,
     lastName: result[i].lastName,
     mail: result[i].mail,
     jobPos: result[i].jobPos,
     depart: ((parseInt(result[i].depart) != NaN && depart[result[i].depart] != undefined) ? depart[result[i].depart].depart : result[i].depart),
     mailGroup: result[i].mailGroup,
     userName: result[i].userName,
     status: result[i].status
    })
   }
   parms.tbl = parms.objs.length
   res.render('setting2', parms)
  })
})

router.get('/getlist', async function (req, res) {
 let data = {}
 let depart = await con.q('SELECT * FROM depart_row ORDER BY row ASC,ID ASC')
 var dept = []
 for (const dep of depart) {
  dept.push({
   depid: dep.ID,
   deptitle: dep.depart.split("(")[0].replace(/\s$/, "")
  })
 }
 let bosslist = await con.q('SELECT privacy_data.userName,user_data.mail FROM privacy_data LEFT JOIN user_data ON privacy_data.dataid = user_data.dataid WHERE user_data.status = 1 AND (privacy_data.boss = 1 OR privacy_data.operator = 3)')
 var bossl = []
 for (const boss of bosslist) {
  bossl.push({
   bossname: boss.userName,
   bossmail: boss.mail
  })
 }
 data.departlist = dept
 data.bosslist = bossl
 res.send(data)
})

router.put('/togglestatus', async function (req, res) {
 let r = con.q('UPDATE user_data SET status = ? WHERE dataid = ?',[req.body.status,req.body.id])
 res.send(r)
})

router.post('/add', async function (req, res) {
 let data = req.body.data
 let boss = data.power
 let dataid = Generator()
 let emid = data.emid
 let name = data.name
 let lastName = data.lastname
 let fullName = name + ' ' + lastName
 let nickName = data.nickname
 let ext = data.teli
 let private = data.tel
 let work = data.telw
 let mail = data.mail
 let operator = data.access
 let jobPos = data.position
 let depart = data.departt
 let mailGroup = data.boss
 let userName = data.username
 let cdate = data.startdate
 let password = userName + '1234'
 let status = 1
 let swtime = data.starttime
 let ewtime = data.endtime
 let wplace = data.place
 let level = data.depart
 let company = data.company
 let line = await con.q('SELECT Max(line) line from contact_data WHERE level = ?', [level])
 if (line[0].line == null) {
  line = 0
 } else {
  line = line[0].line + 1
 }
 wuser = {
  dataId: dataid,
  userId: emid,
  userName: name,
  userLastName: lastName,
  userMail: mail,
  userPosition: jobPos,
  depart: depart,
  userBossMail: mailGroup,
  userUserName: userName,
  userPassword: password,
  userStatus: status
 }
 wcontact = {
  dataId: dataid,
  emid: emid,
  level: level,
  line: line,
  fullname: fullName,
  position: jobPos,
  nickname: nickName,
  extentionNumber: ext,
  privatePhone: private,
  workPhone: work,
  email: mail
 }
 wprivacy = {
  dataId: dataid,
  startDate: cdate,
  emid: emid,
  userName: fullName,
  bossMail: mailGroup,
  boss: boss,
  operator: operator,
  startTime: swtime,
  endTime: ewtime,
  workPlace: wplace,
  companyId: company
 }
 let result = await api.send("POST", "/cross/addemp", {
  user: wuser,
  contact: wcontact,
  privacy: wprivacy
 })
 api.send('GET','/lardata','')
 res.json(result)
})

router.post('/edit', async function (req, res) {
 let data = req.body
 console.log(data)
 let key = classify(data)
 console.log(key)
 let block = manageKey(key,data)
 if (block.privacy && (block.privacy.startTime || block.privacy.endTime)) {
  let date = new Date()
  let result = (await con.q('SELECT dataid,swtime,ewtime FROM privacy_data WHERE dataid = ?',[data.profileId]))[0]
  let info = [result.dataid,result.swtime,result.ewtime,date]
  con.q('INSERT INTO change_worktime (dataid,oldstime,oldetime,changetime) VALUES (?,?,?,?)',info)
 }
 await api.send('PUT','/cross/editemp',block)
 api.send('GET','/lardata','')
 res.json(data)
})

router.delete('/delete',async function(req,res){
let dataid = req.body.id
con.q('DROP TABLE IF EXISTS em'+dataid)
con.q('DELETE FROM user_data WHERE dataid = ?',[dataid])
con.q('DELETE FROM privacy_data WHERE dataid = ?',[dataid])
con.q('DELETE FROM lar_data WHERE dataid = ?',[dataid])
con.q('DELETE FROM lar_status WHERE dataid = ?',[dataid])
con.q('DELETE FROM inoutchange_data WHERE dataid = ?',[dataid])
con.q('DELETE FROM contact_data WHERE dataid = ?',[dataid])
res.send(req.body.id)
})

router.post('/get/:id', async function (req, res) {
 let dataid = req.params.id
 let result = (await con.q('SELECT * FROM privacy_data,contact_data,user_data WHERE user_data.dataid = ? AND privacy_data.dataid = ? AND contact_data.dataid = ?', [dataid, dataid, dataid]))[0]
 let depart = await con.q('SELECT * FROM depart_row')
 depart = depart.reduce((acc, it) => (acc[it.ID] = it, acc), {})
 if (result) {
  if (result.mailGroup) {
   bossname = await con.q('SELECT name,lastName FROM user_data WHERE mail = ?', [result.mailGroup])
   bossname = (bossname[0] == undefined ? "" : bossname[0].name + " " + bossname[0].lastName)
  }
  let parms = {
   emid: result.emid,
   name: result.name,
   lastname: result.lastName,
   nickname: result.nickname,
   depart: ((parseInt(result.depart) != NaN && depart[result.depart] != undefined) ? depart[result.depart].depart : result.depart),
   jobPos: result.jobPos,
   boss: result.boss,
   mail: result.mail,
   workplace: (result.wplace ? "ออฟฟิศใหญ่" : "หน้างาน"),
   swtime: result.swtime.substring(0, 5),
   ewtime: result.ewtime.substring(0, 5),
   officephone: result.ext,
   workphone: result.work,
   privatephone: result.private,
   operator: operlist(result.operator),
   cdate: moment(result.cdate * 1000).locale('th').format("DD MMMM YYYY"),
   bossname: (result.mailGroup ? bossname + " (" + result.mailGroup + ")" : ""),
   username: result.userName,
   retire: (result.retire ? moment(result.retire,'YYYY-MM-DD').locale('th').format("DD MMMM YYYY") : ''),
   password: result.password.substring(0, 3) + '*'.repeat(result.password.length - 3)
  }
  res.json(parms)
 } else {
  res.end("N/A")
 }
})

function Generator() {
 return Math.floor(Math.random() * 26) + Date.now()
}

function operlist(level) {
 switch (level) {
  case 0:
   return 'ยังไม่ได้ตั้งค่า'
  case 1:
   return 'ผู้ใช้งาน'
  case 2:
   return 'หัวหน้า'
  case 3:
   return 'ฝ่ายบุคคล'
  case 4:
   return 'ผู้ดูแลระบบ'
 }
}

function classify(data) {
 let user = ('profileId,edit-emid,edit-name,edit-lastname,edit-email,edit-job,edit-depart,edit-boss,edit-username,edit-password,edit-retire').split(',')
 let privacy = ('profileId,edit-sdate,edit-emid,edit-name,edit-lastname,edit-boss,edit-bossstatus,edit-operator,edit-stime,edit-etime,edit-wplace').split(',')
 let contact = ('profileId,edit-emid,edit-name,edit-lastname,edit-job,edit-nickname,edit-phone,edit-mobile,edit-workphone,edit-email').split(',')
 return {
  user: Object.keys(data).filter(key => user.includes(key)),
  privacy: Object.keys(data).filter(key => privacy.includes(key)),
  contact: Object.keys(data).filter(key => contact.includes(key))
 }
}

function manageKey(key,data) {
 let result = {}
 if (key.user.length > 1) {
  let user = ukey(key.user,data)
  result.user = user
 }
 if (key.privacy.length > 1) {
  let privacy = pkey(key.privacy,data)
  result.privacy = privacy
 }
 if (key.contact.length > 1) {
  let contact = ckey(key.contact,data)
  result.contact = contact
 }
 return result
}

function ukey(key,data) {
 let result = {}
 key.map(u => {
  switch (u) {
   case 'profileId':
    return result.dataId = data.profileId
   case 'edit-emid':
    return result.userId = data['edit-emid']
   case 'edit-name':
    return result.userName = data['edit-name']
   case 'edit-lastname':
    return result.userLastName = data['edit-lastname']
   case 'edit-email':
    return result.userMail = data['edit-email']
   case 'edit-job':
    return result.userPosition = data['edit-job']
   case 'edit-depart':
    return result.depart = data['edit-depart']
   case 'edit-boss':
    return result.userBossMail = data['edit-boss']
   case 'edit-username':
    return result.userName = data['edit-username']
   case 'edit-password':
    return result.userPassword = data['edit-password']
   case 'edit-retire':
    return result.retire = data['edit-retire']
  }
 })
 return result
}

function pkey(key,data) {
 let result = {}
 key.map(p => {
  switch (p) {
   case 'profileId':
    return result.dataId = data.profileId
   case 'edit-sdate':
    return result.startDate = data['edit-sdate']
   case 'edit-emid':
    return result.emid = data['edit-emid']
   case 'edit-name':
    return result.userName = data['edit-name'] +''+ data['edit-lastname']
   case 'edit-boss':
    return result.bossMail = data['edit-boss']
   case 'edit-bossstatus':
    return result.boss = data['edit-bossstatus']
   case 'edit-operator':
    return result.operator = data['edit-operator']
   case 'edit-stime':
    return result.startTime = data['edit-stime']
   case 'edit-etime':
    return result.endTime = data['edit-etime']
   case 'edit-wplace':
    return result.workPlace = data['edit-wplace']
  }
 })
 return result
}

function ckey(key,data) {
 let result = {}
 key.map(c => {
  switch (c) {
   case 'profileId':
    return result.dataId = data.profileId
   case 'edit-emid':
    return result.emid = data['edit-emid']
   case 'edit-name':
    return result.fullname = data['edit-name'] +''+ data['edit-lastname']
   case 'edit-job':
    return result.position = data['edit-job']
   case 'edit-nickname':
    return result.nickname = data['edit-nickname']
   case 'edit-phone':
    return result.extentionNumber = data['edit-phone']
   case 'edit-mobile':
    return result.privatePhone = data['edit-mobile']
   case 'edit-workphone': 
    return result.workPhone = data['edit-workphone']
   case 'edit-email':
    return result.email = data['edit-email']
  }
 })
 return result
}

module.exports = router