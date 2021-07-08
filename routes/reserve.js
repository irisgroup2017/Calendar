const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')
const api = require('../bin/api')
const site = ['','','','','','','label-warning','','label-success','','','label-danger','label-dark','label-primary']

router.get('/', async function(req, res) {
 if (req.cookies.user_name) {
  parms = {
   user: req.cookies.user_name,
   operator: req.cookies.user_op,
   title: "ระบบจองรถ"
  }
  let today = moment().format("YYYY-MM-DD")
  let data = {
   date: today
  }
  let query = "SELECT * FROM reserve_car RC LEFT JOIN licenseplate_data LD ON RC.license = LD.license LEFT JOIN easypass_data ED on LD.unixid = ED.unixid"
  let easypass = await con.q(query)
  easypass = easypass.reduce((acc,it) => (acc[it.code] = it.amount,acc),{})
  let reserve = await api.send("get",'/reserve/gettoday',data)
  let car = {}
  let timenow = (moment().format('HH:mm')).split(':')
  reserve = reserve.reduce((acc,it) => {
   if (it.allDay) {
    it.dayres = [2,28]
   } else {
    let start = moment(it.start).subtract(7,"hours").format("HH:mm").split(":")
    let end = moment(it.end).subtract(7,"hours").format("HH:mm").split(":")
    start = ((((parseInt(start[0])*60) + parseInt(start[1]))-300)/30)
    end = ((((parseInt(end[0]*60)) + parseInt(end[1]))-300)/30)
    it.dayres = [start,(end > 28 ? 28 : end)]
   }
   car[it.carId] = [...(car[it.carId] || []),it.id]
   return (acc[it.id] = it,acc)
  },{})
  parms.car = car
  parms.reserve = reserve
  parms.easypass = easypass
  parms.timenow = ((((parseInt(timenow[0])*60) + parseInt((timenow[1] > 30 ? 30 : 0)))-300)/30)
  res.render('reserve',parms)
 } else {
  res.redirect("/")
 }
})

router.get('/getfuel',async function(req,res) {
 let car = await api.send('GET','/reserve/getfuel',{ now: moment().format('YYYY-MM-DD HH:mm:ss')})
 res.json(car)
})

module.exports = router