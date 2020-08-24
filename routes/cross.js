const getIp = require('../bin/getip')
const axios = require('axios')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 var option = {
  baseURL: 'http://' + getIp.get.Ethernet[0] + ':69' + req.body.path,
  method: 'POST',
  data: req.body.option
 }
 const request = await axios(option)
 res.json(request.data)
})

module.exports = router