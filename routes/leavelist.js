const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ll = require('../bin/larlist'),
fs = require('fs'),
mailsend = require('../bin/mailsend'),
log = require('../bin/logger')
const api = require('../bin/api')
const moment = require('moment')
const dayjs = require('dayjs')
require('dayjs/locale/th')
var buddhistEra = require('dayjs/plugin/buddhistEra')
var dayduration = require('dayjs/plugin/duration')
dayjs.extend(dayduration)
dayjs.extend(buddhistEra)

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
 result2 = await con.q('SELECT * FROM privacy_data WHERE dataid = ?', dataid)
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
  timeKeep = ll.getDayTime(result[i].start, end, allDay)//, result2[0].swtime.substring(0, 5), result2[0].ewtime.substring(0, 5)
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
 let now = (new Date()).getTime()
 if (req.body.state == 'delete') {
  var filename = await con.q('SELECT fname FROM lar_data WHERE id = ?', req.body.larid)
  if (filename[0].fname != '') {
   var path = __basedir + '/bin/doc/' + req.cookies.user_name + '/' + filename[0].fname
   if (fs.existsSync(path)) {
    fs.unlinkSync(path)
   }
  }
  await con.q('DELETE FROM lar_data WHERE id = ?', req.body.larid)
  await api.send('GET','/lardata','')
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
 let userId = req.cookies.user_dataid
 let newBoss = (await con.q('SELECT mailGroup FROM privacy_data WHERE dataid = ?',[userId]))[0].mailGroup
 await con.q('UPDATE lar_data SET mailGroup = ? WHERE id = ?', [newBoss, req.body.larid])
 mailsend.send('Resend: ขออนุญาติ', req.cookies.user_name, req.body.larid, 'boss')
 res.end('ok')
})

router.post('/formpost',async function(req,res) {
    let userName = req.cookies.user_name
    let dataid = req.cookies.user_dataid
    let mail = req.cookies.user_mail
    let larid = req.body.larid
    let thisYear = moment().format('YYYY')
    let data

    let larData = await con.q('SELECT * FROM lar_data WHERE dataid = ? AND id = ?',[dataid,larid])
    let userData = await con.q('SELECT * FROM user_data WHERE dataid = ?',[dataid])
    let larStatus = await con.q('SELECT  * FROM lar_status WHERE dataid = ? AND year = ?',[dataid,thisYear])

    data = {
        detail: formatText(userData[0],larData[0]),
        larStatus: getLarstatus(larStatus[0])
    }
    res.json(data);
})


function getLarstatus(data) {
    let typeThai = ['ลาป่วย', 'ลากิจ', 'ลาพักร้อน', 'ลาฝึกอบรบ', 'ลาทำหมัน', 'ลาคลอด', 'ลาอุปสมบท', 'ลารับราชการทหาร']
    let typeEng = ['sick', 'personal', 'vacation', 'training', 'sterily', 'maternity', 'religious', 'military','sickd', 'personald', 'vacationd', 'trainingd', 'sterilyd', 'maternityd', 'religiousd', 'militaryd','sickr', 'personalr', 'vacationr', 'trainingr', 'sterilyr', 'maternityr', 'religiousr', 'militaryr','sickt', 'personalt', 'vacationt', 'trainingt', 'sterilyt', 'maternityt', 'religioust', 'militaryt']
    let typeIndex = ['all','used','remain','time']
    let ans = {}
    for (const key in data) {
        let match = typeEng.indexOf(key)
        let val = data[key]
        if (match === -1) continue

        let total = typeThai.length
        let indicate = Math.floor(match / total)
        let balance = (match % total)
        let index = typeIndex[indicate]
        let title = typeThai[balance]
        let type = typeEng[balance]
        let value = convertTime(val)
        let negative = (val < 0 ? true : false)

        if (!ans[type]) ans[type] = { title: title }
        if (index === 'time') value = val
        ans[type][index] = { 
            value: value,
            negative: negative
        }
    }
    return ans
}

function formatText(user,detail) {
    let lar = adjustInfo(detail)
    return {
        fullname: detail.userName,
        job: user.jobPos,
        depart: user.depart,
        detail: detail.title,
        ctime: lar.ctime,
        sdate: lar.sdate,
        edate: lar.edate,
        duration: lar.duration,
        stime: lar.stime,
        etime: lar.etime,
        lartype: lar.type
    }
}

function adjustInfo(lar) {
    let typeList = ['grey','success','dark','warning','danger','info']
    let typeResult = ['ลาป่วย','ลากิจ','ลากิจไม่รับค่าจ้าง','ลาพักร้อน','ลาสลับวันหยุด',lar.title]
    let type = lar.className.split('-')[1]
    let allDay = lar.allDay
    let ctime = dayjs(lar.cTime).locale('th').format('วันdddที่ D MMMM BBBB')
    let start = dayjs.unix(lar.start).subtract(7,'h')
    let end = lar.end == null ? '-' : dayjs.unix(lar.end).subtract(7,'h')
    let sdate = start.format('DD/MM/BBBB')
    let edate = end !== '-' ? end.format('DD/MM/BBBB') : start.format('DD/MM/BBBB')
    let stime = allDay ? '-' : start.format('HH:mm')
    let etime = allDay ? '-' : end.format('HH:mm')
    let diffe = end !== '-' ? end : start.add(8,'h')
    let duration = ( edate === '-' ? '1 วัน' : convertTime(diffe.diff(start,'s')) )
    type = typeResult[typeList.indexOf(type)]
    return {
        ctime: ctime,
        sdate: sdate,
        edate: edate,
        duration: duration,
        stime: stime,
        etime: etime,
        type: type
    }
}

function convertTime(num) {
    let ans = ""
    num = Math.abs(num)
    if (num >= 28800) [ans,num] = calDuration(ans,num,28800,'วัน')
    if (num >= 3600) [ans,num] = calDuration(ans,num,3600,'ชั่วโมง')
    if (num >= 60) [ans,num] = calDuration(ans,num,60,'นาที')
    return ans
}

const calDuration = (ans,num,base,unit) => { 
    let val = num / base
    ans += `${val} ${unit}`
    num = num % base
    return [ans,num]
}

module.exports = router