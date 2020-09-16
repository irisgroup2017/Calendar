const getIp = require('../bin/getip')
const axios = require('axios')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let wifi = "Wi-Fi"
 let ip = (getIp.get.Ethernet == undefined ? getIp.get[wifi][0] : getIp.get.Ethernet[0])
 var option = {
  baseURL: 'http://' + ip + ':69' + req.body.path,
  method: 'POST',
  data: req.body.option
 }
 const request = await axios(option)
 res.json(request.data)
})

module.exports = router