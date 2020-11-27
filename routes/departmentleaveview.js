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
 res.render('departmentleaveview',parms)
})

router.post('/load',async function(req,res) {
 let email = req.cookies.user_mail
 let dataid = req.cookies.user_dataid
 let start = req.body.start
 let end = req.body.end
 let query = "SELECT dataid FROM user_data WHERE (status = 1 AND depart = (SELECT depart FROM user_data WHERE dataid = ?)) OR mailGroup = ?"
 let result = (await con.q(query,[dataid,email])).map(it => it.dataid)
 let objs = []
 for (id of result) {
  query = 'SELECT dataid,title,start,end,swapDate,allDay,className,userName,approve FROM lar_data WHERE dataid = ? AND approve > 1 AND (start BETWEEN ? AND ?)'
  result = (await con.q(query,[id,start,end])).map(item => {
   let stime = moment.unix(item.start).valueOf()
   let etime = (item.end ? moment.unix(item.end).valueOf() : "")
   return {
    date: stime,
    start: stime,
    end: etime,
    title: item.userName + " " +(item.approve == 2 ? "(รออนุมัติ)" : ""),
    user: item.userName,
    allDay: (item.allDay ? true : false),
    className: (item.approve == 2 ? "label-white" : item.className),
    description: item.title,
   }
  },[])
  objs.push(result)
 }
 objs = objs.reduce((prev, cur) => prev.concat(cur), [])
 res.json(objs)
})

module.exports = router