const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')

router.get('/', async function(req, res, next) {
 let userName = req.cookies.user_name
 let dataid = req.cookies.user_dataid
 let dataop = req.cookies.user_op
 let mail = req.cookies.user_mail
 let timeStart = req.query.start
 let timeEnd = req.query.end
 if (dataid && timeStart && timeEnd) {
  let table = "em" + dataid.toString()
  let tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
  if (tableexist) {
   let larstart = dateconvert.add7unixs(timeStart)
   let larend = dateconvert.add7unixs(timeEnd)
   let vacationstart = dateconvert.add7unixms(timeStart)
   let vacationend = dateconvert.add7unixms(timeEnd)
   let privacy = await con.q('SELECT wplace,swtime,ewtime,cdate FROM privacy_data WHERE dataid = ?',[dataid])
   let wplace = privacy[0].wplace
   let vacationquery = 'SELECT dtitle,'+(wplace == 1 ? "doffice" : "dsite")+' AS time FROM vacation_list WHERE '+(wplace == 1 ? "doffice" : "dsite")+' BETWEEN ? AND ?'
   let vacationlist = await con.q(vacationquery,[vacationstart,vacationend])
   vacationlist = vacationlist.reduce((acc,it) => (acc[dateconvert.changeformat(it.time/1000)] = it,acc),{})
   let larlist = await con.q('SELECT d.title,d.className,t.lartype,d.start,d.end,d.swapDate,d.allDay FROM lar_data AS d JOIN lar_type AS t ON d.className = t.classname WHERE dataid = ? AND ((d.start BETWEEN ? AND ?) OR (d.end BETWEEN ? AND ?))',[dataid,larstart,larend,larstart,larend])
   let datelist = datetodate(timeStart,timeEnd)
   let result = (await con.q('SELECT emid,depart,jobPos FROM user_data WHERE dataid = ?',[dataid]))[0]
   let inc = ['0','6']
   parms = {
    title: 'รายงานแสดงเวลาของพนักงาน',
    username: userName,
    dataid: dataid,
    operator: dataop,
    mail: mail,
    emid: result.emid,
    depart: result.depart,
    job: result.jobPos,
    datestart: dateconvert.thformat(timeStart),
    dateend: dateconvert.thformat(timeEnd),
    datelist: datelist,
    dateshow: datelist.map(x => dateconvert.thformat(x)),
    dateday: datelist.filter(day => inc.includes(moment(day,"YYYY-MM-DD").format('d'))).reduce((acc,it) => (acc[it] = "วัน"+moment(it,"YYYY-MM-DD").locale('th').format('dddd'),acc),{})
   }
   query = 'SELECT DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.timestart,u.timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM '+table+' AS u JOIN machine_data AS ms on u.MachCodeStart = ms.MachCode JOIN machine_data AS me on u.MachCodeEnd = me.MachCode WHERE (date BETWEEN ? AND ?)'
   result = await con.q(query,[timeStart,timeEnd])
   result = result.reduce((acc,it) => (acc[it.date] = it,acc),{})
   parms.fingerscan = result
   parms.vacation = vacationlist
   let lartype = {}
   larlist.map((it) => {
    console.log(dateconvert.changeformat(it.start))
    lartype[dateconvert.changeformat(it.start)] = {
     lartype: (it.lartype == "ลาอื่นๆ" ? it.title : it.lartype) +""+(it.lartype == "ลาสลับวันหยุด" ? "กับวันที่ "+ dateconvert.unixthformat(it.swapDate)+" ": "") +""+ (it.allDay ? " (ทั้งวัน)" : " ("+dateconvert.durationhours((it.end-it.start)*1000)+" ชั่วโมง)")
    }
    if (it.end) {
     let dur = Math.floor(dateconvert.durationdays(it.end-it.start)*1000)
     if (dur > 1) {
      let i=1
      while (i<dur) {
       lartype[dateconvert.adddaychangeformat(it.start,i++)] = {
        lartype: (it.lartype == "ลาอื่นๆ" ? it.title : it.lartype) +""+(it.lartype == "ลาสลับวันหยุด" ? "กับวันที่ "+ dateconvert.unixthformat(it.swapDate)+" ": "") +""+ (it.allDay ? " (ทั้งวัน)" : " ("+dateconvert.durationhours((it.end-it.start)*1000)+" ชั่วโมง)")
       }
      }
     }
    }
   })
   parms.lartype = lartype
   res.render('reporttime', parms)
  }
 } else { res.redirect('/') }
})
module.exports = router

function datetodate(datestart,dateend) {
 let result = []
 let i = 1
 let date = datestart
 while (date != dateend) {
  result.push(date)
  date = moment(datestart,"YYYY-MM-DD").add(i++,'days').format('YYYY-MM-DD')
 }
 result.push(date)
 return result
}

let dateconvert = {
 add7unixs: function(date) {
  return moment(date,"YYYY-MM-DD").add(7,'hours').unix()
 },
 add7unixms: function(date) {
  return moment(date,"YYYY-MM-DD").add(7,'hours').valueOf()
 },
 thformat: function(date) {
  return moment(date,"YYYY-MM-DD").locale("th").format('DD MMM YYYY')
 },
 unixthformat: function(date) {
  return moment.unix(date,"YYYY-MM-DD").locale("th").format('DD MMM YYYY')
 },
 changeformat: function(date) {
  return moment.unix(date).subtract(7,'hours').format('YYYY-MM-DD')
 },
 durationhours: function(date) {
  return moment.duration(date).asHours()
 },
 durationdays: function(date) {
  return moment.duration(date).asDays()
 },
 adddaychangeformat: function(date,day) {
  return moment.unix(date).add(day,"days").format('YYYY-MM-DD')
 },
 thday: function(date) {
  return moment(date,"YYYY-MM-DD").locale("th").format('dddd')
 }
}