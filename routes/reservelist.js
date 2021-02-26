const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')
const api = require('../bin/api')

router.get('/', async function(req, res) {
 if (req.cookies.user_name) {
  parms = {
   user: req.cookies.user_name,
   operator: req.cookies.user_op,
   title: "รายงานการจองรถ"
  }
  res.render('reservelist',parms)
 } else {
  res.redirect("/")
 }
})

router.get('/table',async function(req,res) {
 let result = await api('GET','/reserve/getlist',{})
 res.json(result)
})

 module.exports = router