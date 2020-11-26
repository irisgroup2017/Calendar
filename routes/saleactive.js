const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')
const site = ['','','','','','','label-warning','','label-success','','','label-danger','label-dark','label-primary']

router.get('/', async function(req, res) {
 parms = {
  user: req.cookies.user_name,
  operator: req.cookies.user_op,
  title: "แสดงข้อมูลเซลล์ประจำโครงการ"
 }
 res.render('saleactive',parms)
})

router.post('/load',async function(req,res) {
 let start = moment.unix(req.body.start).format("YYYY-MM-DD")
 let end = moment.unix(req.body.end).format("YYYY-MM-DD")
 let query = "SELECT cd.dataid,cd.name FROM contact_data cd LEFT JOIN user_data ud ON ud.dataid = cd.dataid WHERE cd.level = 11 AND ud.status = 1"
 let result = await con.q(query)
 let dataFinger = result.map(id => ("em"+id.dataid).toString(),[])
 let dataPerson = result.map(id => id.name,[])
 let objs = []
 let rcount = 0
 for (tableid of dataFinger) {
  query = 'SELECT DATE_FORMAT(date,"%Y-%m-%d") AS date,timestart,timeend,MachCodeStart AS mstart,MachCodeEnd AS mend FROM '+tableid+' AS u WHERE MachCodeStart <> 5 AND MachCodeEnd <> 5 AND (date BETWEEN ? AND ?)'
  result = (await con.q(query,[start,end])).map(person => {
   let day = moment(person.date,'YYYY-MM-DD')
   let stime = person.timestart.split(':')
   let etime = person.timeend.split(':')
   if (person.mstart && person.mend) {
    console.log(person.mstart,person.end)
   }
   return {
    day: person.date,
    date: moment(person.date,'YYYY-MM-DD').add(7,'hours').valueOf(),
    start: moment(day).set({ hour: stime[0], minute: stime[1] }).add(7,'hours').valueOf(),
    end: moment(day).set({ hour: etime[0], minute: etime[1] }).add(7,'hours').valueOf(),
    title: dataPerson[rcount],
    user: dataPerson[rcount],
    className: site[person.mstart] || site[person.mend]
   }
  },[])
  objs.push(result)
  rcount++
 }
 objs = objs.reduce((prev, cur) => prev.concat(cur), [])
 res.json(objs)
 //title:text start:unixtimestamp allday:boolean
})

module.exports = router