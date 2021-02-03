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
 res.render('reserve',parms)
})

module.exports = router