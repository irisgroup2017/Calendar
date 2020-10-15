const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')

router.get('/', async function(req, res, next) {
 let timeStart = req.query.start
 let timeEnd = req.query.end
 let userName = req.cookies.user_name
 let dataid = req.cookies.user_dataid
 let dataop = req.cookies.user_op
 let mail = req.cookies.user_mail
 let table = "em" + dataid.toString()
 let tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
	if (userName && timeStart && timeEnd && tableexist) {
  let result = (await con.q('SELECT emid,depart FROM user_data WHERE dataid = ?',[dataid]))[0]
  parms = {
   title: 'รายงานแสดงเวลาของพนักงาน',
   username: userName,
   dataid: dataid,
   operator: dataop,
   mail: mail,
   emid: result.emid,
   depart: result.depart,
   datestart: moment(timeStart,"YYYY-MM-DD").format('DD/MM/YYYY'),
   dateend: moment(timeEnd,"YYYY-MM-DD").format('DD/MM/YYYY'),
   datelist: datetodate(timeStart,timeEnd)
  }
  query = 'SELECT DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.timestart,u.timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM '+table+' AS u JOIN machine_data AS ms on u.MachCodeStart = ms.MachCode JOIN machine_data AS me on u.MachCodeEnd = me.MachCode WHERE (date BETWEEN ? AND ?)'
  result = await con.q(query,[timeStart,timeEnd])
  result = result.reduce((acc,it) => (acc[it.date] = it,acc),{})
  parms.fingerscan = result
  res.render('reporttime', parms)
 }
	else { res.redirect('/') }
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