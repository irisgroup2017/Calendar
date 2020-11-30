const axios = require('axios')
const express = require('express')
const router = express.Router()
require("dotenv").config()

router.post('/',async function(req,res) {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEBAPP + ':' + process.env.PORT_API + '' + req.body.path,
  method: 'POST',
  data: (req.body.option == 'getcode' ? req.cookies : req.body.option)
 }
 const request = await axios(option)
 res.json(request.data)
})

module.exports = router