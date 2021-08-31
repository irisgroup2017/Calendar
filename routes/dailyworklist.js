const axios = require('axios')
const express = require('express')
const router = express.Router()
const moment = require('moment')
const api = require('../bin/api')

router.get('/',async function(req,res) {
 let data = await api.get('/dailywork',{ 
  dataid: req.cookies.user_dataid 
 })
 parms = {
  title: 'รายการบันทึกการทำงาน',
  head1: 'Dailywork List',
  head2: req.cookies.user_name,
  data: data
 }
 res.json(data)
})

module.exports = router