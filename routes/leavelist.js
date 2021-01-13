const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ll = require('../bin/larlist'),
fs = require('fs'),
mailsend = require('../bin/mailsend'),
log = require('../bin/logger')

async function leavelist(req,res) {
 var userName = req.cookies.user_name,
 dataid = req.cookies.user_dataid,
 dataop = req.cookies.user_op,
 mail = req.cookies.user_mail,
 year = (req.params.year ? req.params.year : (new Date()).getFullYear())
 sTime = new Date(year, 0, 1, 7).getTime() / 1000,
 eTime = new Date(year, 11, 31, 7).getTime() / 1000,
 parms = {
  title: 'รายงานการลา',
  head1: "Detail List"
 }
 if (userName) {
  data = {
   'username': userName,
   'dataid': dataid,
   'operator': dataop,
   'mail': mail
  }
  parms.user = userName
  parms.operator = dataop
 } else {
  res.redirect('/login')
 }
 result = await con.q('SELECT * FROM lar_data WHERE dataid = ? AND start BETWEEN ? AND ?', [dataid, sTime, eTime])
 result2 = await con.q('SELECT * FROM privacy_data WHERE userName = ?', userName)
 parms.objs = []
 var end = '',
  allDay = '',
  larstatus = '',
  approvedate = '',
  dayPlus = 0,
  hourPlus = 0,
  minPlus = 0
 for (var i = 0; i < result.length; i++) {
  if (result[i].end) {
   end = (result[i].end - 25200) * 1000
  } else {
   end = null
  }
  if (result[i].allDay) {
   allDay = true
  } else {
   allDay = false
  }

  if (result[i].delreq == 1) {
   t = ll.getDateValue(result[i].deldate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = result[i].userName
  } else if (result[i].approve == 1 && result[i].hrapprovedate) {
   t = ll.getDateValue(result[i].hrapprovedate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = result[i].hrapprover
  } else if (result[i].approve == 2) {
   approvedate = ""
   approver = ""
  } else if (result[i].approve == 3) {
   t = ll.getDateValue(result[i].approvedate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = result[i].approver
  } else if (result[i].approve == 4) {
   t = ll.getDateValue(result[i].hrapprovedate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = (result[i].hrapprover === "ธนกร จริยเพียรพันธุ์" ? "Admin" : result[i].hrapprover)
  } else if (result[i].approve == 1) {
   t = ll.getDateValue(result[i].approvedate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = result[i].approver
  } else if (result[i].approve == 0) {
   t = ll.getDateValue(result[i].deldate * 1000 + (7 * 60 * 60))
   approvedate = t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
   approver = (result[i].hrapprover === "ธนกร จริยเพียรพันธุ์" ? "Admin" : result[i].hrapprover)
  }
  if (result[i].delreq == 1) {
   larstatus = 'แจ้งยกเลิก: ' + approvedate, classn = 'text-warning'
  } else if (result[i].approve == 0) {
   larstatus = 'ยกเลิก: ' + approvedate, classn = 'text-black-50'
  } else if (result[i].approve == 1) {
   larstatus = 'ไม่อนุมัติ: ' + approvedate, classn = 'text-danger'
  } else if (result[i].approve == 2) {
   larstatus = 'รออนุมัติ', classn = ''
  } else if (result[i].approve == 3) {
   larstatus = 'อนุมัติ: ' + approvedate, classn = 'text-success'
  } else if (result[i].approve == 4) {
   larstatus = 'HR อนุมัติ: ' + approvedate, classn = 'text-info'
  }

  if (result[i].className == 'label-grey') {
   larType = 'ลาป่วย'
  } else if (result[i].className == 'label-success') {
   larType = 'ลากิจ'
  } else if (result[i].className == 'label-dark') {
   larType = 'ลากิจไม่รับค่าจ้าง'
  } else if (result[i].className == 'label-warning') {
   larType = 'ลาพักร้อน'
  } else if (result[i].className == 'label-danger') {
   larType = 'สลับวันหยุด'
   let swaptitle = result[i].title
   if (swaptitle.match(/\d\d:\d\d:\d\d:\d\d/)) {
    let swaptime = swaptitle.match(/\d\d/g)
    let swaptop = (swaptime[0] * 40) + ((swaptime[1] / 30) * 20)
    let swapbottom = (-(swaptime[2] * 40) + ((swaptime[3] / 30) * 20))
    swaptime = swaptitle.match(/\d\d:\d\d/g)
    let swapre = swaptime[0] + ":" + swaptime[1]
    swaptime = swaptime[0] + "-" + swaptime[1]
    result[i].title = swaptitle.replace(swapre, "")
   }
  } else {
   larType = result[i].title
  }
  timeKeep = ll.getDayTime(result[i].start, end, allDay, result2[0].swtime.substring(0, 5), result2[0].ewtime.substring(0, 5))
  t = ll.getDateValue(result[i].cTime)
  cTime = t.dy + ', ' + t.da + ' ' + t.mo + ' ' + t.y + ' (' + t.h + ':' + t.mi + ')'
  parms.objs.push({
   id: result[i].id,
   dataTime: result[i].cTime,
   lartype: larType,
   title: result[i].title,
   dateStart: timeKeep.dateStart,
   dateEnd: timeKeep.dateEnd,
   timeStart: timeKeep.timeStart,
   timeEnd: timeKeep.timeEnd,
   daylength: timeKeep.daylength,
   cTime: cTime,
   larstatus: larstatus,
   approver: approver,
   aclass: classn
  })
  tokenDate = timeKeep.daylength.split(' ')
  if (tokenDate[1] === 'วัน') {
   dayPlus = parseInt(tokenDate[0]) + dayPlus
  } else {
   hourPlus = parseInt(tokenDate[0]) + hourPlus
   if (tokenDate[2]) {
    minPlus = parseInt(tokenDate[2])
   }
  }
  if (minPlus > 60) {
   hourPlus = hourPlus + (minPlus / 60)
   minPlus = minPlus % 60
  }
  if (hourPlus > 8) {
   dayPlus = dayPlus + (hourPlus / 8)
   hourPlus = hourPlus % 8
  }
  parms.lengthPlus = dayPlus + ' วัน ' + hourPlus + ' ชั่วโมง ' + (minPlus > 0 ? minPlus + ' นาที' : "")
 }
 parms.tbl = parms.objs.length
 res.render('leavelist', parms)
}

router.get('/', async function (req, res) {
 leavelist(req,res)
})
router.get('/:year', async function (req, res) {
 leavelist(req,res)
})

router.post('/', async function (req, res) {
 if (req.body.state == 'delete') {
  var filename = await con.q('SELECT fname FROM lar_data WHERE id = ?', req.body.larid)
  if (filename[0].fname != '') {
   var path = __basedir + '/bin/doc/' + req.cookies.user_name + '/' + filename[0].fname
   if (fs.existsSync(path)) {
    fs.unlinkSync(path)
   }
  }
  await con.q('DELETE FROM lar_data WHERE id = ?', req.body.larid)
  log.logger('info', 'Delete Leave Data : ' + req.cookies.user_name + ' ID ' + req.body.larid)
 }
 if (req.body.state == 'delkeep') {
  await con.q('UPDATE lar_data SET approve = ?,deldate = ? WHERE id = ?', [0, now / 1000, req.body.larid])
  mailsend.send('ทำการยกเลิกการ', req.cookies.user_name, req.body.larid, 'boss')
  log.logger('info', 'Send delete request to BOSS: ' + req.cookies.user_name + ' Leave ID ' + req.body.larid)
 }
 if (req.body.state == 'hrprove') {
  await con.q('UPDATE lar_data SET delreq = ?,deldate = ? WHERE id = ?', [1, now / 1000, req.body.larid])
  mailsend.send('แจ้งขอยกเลิกการ', req.cookies.user_name, req.body.larid, 'hr')
  log.logger('info', 'Send delete request to HR: ' + req.cookies.user_name + ' Leave ID ' + req.body.larid)
 }
 res.json(req.body)
})

router.post('/resend', async function (req, res, next) {
 mailsend.send('Resend: ขออนุญาติ', req.cookies.user_name, req.body.larid, 'boss')
 res.end('ok')
})

module.exports = router