const axios = require('axios')
const express = require('express')
const router = express.Router()
const moment = require('moment')
require("dotenv").config()

router.get('/',async function(req,res) {
 let param = req.query
 param.option.cookies = req.cookies
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' +param.path,
  method: param.method,
  data: param.option
 }
 const request = await axios(option)
 res.json(request.data)
})

router.post('/',async function(req,res) {
 let parms = req.body
 parms.option.cookies = req.cookies
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + parms.path,
  method: 'POST',
  data: (parms.option == 'getcode' ? req.cookies : parms.option)
 }
 const request = await axios(option)
 res.json(request.data)
})

router.post('/sync/:path',async function(req,res) {
 req.body.ioDataid = parseInt(req.cookies.user_dataid)
 req.body.ioTimeadd = moment().format('YYYY-MM-DD HH:mm:ss')
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '/' + req.params.path,
  method: 'POST',
  data: req.body
 }
 const request = await axios(option)
 res.json(request.data)
})

router.post('/commentpost',async function(req,res) {
 req.body.time = moment().format('YYYY-MM-DD HH:mm:ss')
 req.body.dataId = req.cookies.user_dataid
 req.body.statusId = 8
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '/memolog',
  method: 'POST',
  data: req.body
 }
 const request = await axios(option)
 res.json(request.data)
})

module.exports = router