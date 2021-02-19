const express = require('express')
const con = require('../bin/mysql')
const router = express.Router()
const moment = require('moment')
const ls = require('../bin/larStock')
const log = require('../bin/logger')
const larstock = require('../bin/larstock')
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
     depart: result[i].depart,
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
  ext: ext,
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
 let result = await api("POST", "/cross/addemp", {
  user: wuser,
  contact: wcontact,
  privacy: wprivacy
 })
 res.json(result)
})

router.post('/get/:id', async function (req, res) {
 let dataid = req.params.id
 let result = (await con.q('SELECT * FROM privacy_data,contact_data,user_data WHERE user_data.dataid = ? AND privacy_data.dataid = ? AND contact_data.dataid = ?', [dataid, dataid, dataid]))[0]
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
   depart: result.depart,
   jobPos: result.jobPos,
   boss: result.boss,
   mail: result.mail,
   workplace: (result.wplace ? "ออฟฟิศใหญ่" : "หน้างาน"),
   swtime: result.swtime.substring(0, 5),
   ewtime: result.ewtime.substring(0, 5),
   officephone: result.ext,
   workphone: result.work,
   privatephone: result.private,
   operator: result.operator,
   cdate: moment(result.cdate * 1000).locale('th').format("DD MMMM YYYY"),
   bossname: (result.mailGroup ? bossname + " (" + result.mailGroup + ")" : ""),
   username: result.userName,
   password: result.password.substring(0, 3) + '*'.repeat(result.password.length - 3)
  }
  res.json(parms)
 }
 res.end("N/A")
})

function dateThai(date) {
 let day, month, year, gMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
 day = date.getDate()
 month = gMonth[date.getMonth()]
 year = date.getFullYear() + 543
 return day + " " + month + " " + year
}

function Generator() {
 return Math.floor(Math.random() * 26) + Date.now()
}

module.exports = router