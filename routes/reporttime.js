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
   let larstart = moment(timeStart,"YYYY-MM-DD").add(7,'hours').unix()
   let larend = moment(timeEnd,"YYYY-MM-DD").add(7,'hours').unix()
   let larlist = await con.q('SELECT d.title,d.className,t.lartype,d.start,d.end,d.swapDate,d.allDay FROM lar_data AS d JOIN lar_type AS t ON d.className = t.classname WHERE dataid = ? AND ((d.start BETWEEN ? AND ?) OR (d.end BETWEEN ? AND ?))',[dataid,larstart,larend,larstart,larend])
   let datelist = datetodate(timeStart,timeEnd)
   let result = (await con.q('SELECT emid,depart FROM user_data WHERE dataid = ?',[dataid]))[0]
   parms = {
    title: 'รายงานแสดงเวลาของพนักงาน',
    username: userName,
    dataid: dataid,
    operator: dataop,
    mail: mail,
    emid: result.emid,
    depart: result.depart,
    datestart: moment(timeStart,"YYYY-MM-DD").locale("th").format('DD MMMM YYYY'),
    dateend: moment(timeEnd,"YYYY-MM-DD").locale("th").format('DD MMMM YYYY'),
    datelist: datetodate(timeStart,timeEnd),
    dateshow: datelist.map(x => moment(x,'YYYY-MM-DD').locale("th").format('DD MMM YYYY'))
   }
   query = 'SELECT DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.timestart,u.timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM '+table+' AS u JOIN machine_data AS ms on u.MachCodeStart = ms.MachCode JOIN machine_data AS me on u.MachCodeEnd = me.MachCode WHERE (date BETWEEN ? AND ?)'
   result = await con.q(query,[timeStart,timeEnd])
   result = result.reduce((acc,it) => (acc[it.date] = it,acc),{})
   //moment(it.date,"YYYY-MM-DD").format('DD-MMM-YYYY')
   parms.fingerscan = result
   console.log(larlist)
   parms.lartype = larlist.reduce((acc,it) => (
    acc[moment.unix(it.start).format('YYYY-MM-DD')] = {
     lartype: (it.lartype == "ลาอื่นๆ" ? it.title : it.lartype) +""+(it.lartype == "ลาสลับวันหยุด" ? "กับวันที่ "+ moment.unix(it.swapDate).locale("th").format('DD MMM YYYY')+" ": "") +""+ (it.allDay ? "ทั้งวัน" : " "+moment.duration((it.end-it.start)*1000).asHours()+" ชั่วโมง")
    }
    ,acc),{})
   //console.log(parms)
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