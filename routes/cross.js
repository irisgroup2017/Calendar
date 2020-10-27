const getIp = require('../bin/getip')
const axios = require('axios')
const express = require('express')
const router = express.Router()
require("dotenv").config()

router.post('/',async function(req,res) {
 let host = getIp.get
 let local = Object.keys(host)[0]
 let ip = host[local][0]
 var option = {
  baseURL: 'http://' + ip + ':' + process.env.PORT_API + '' + req.body.path,
  method: 'POST',
  data: (req.body.option == 'getcode' ? req.cookies : req.body.option)
 }
 const request = await axios(option)
 res.json(request.data)
})

module.exports = router