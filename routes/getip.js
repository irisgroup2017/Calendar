const getIp = require('../bin/getip')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let ip = {
  protocal:req.protocol+"://",
  ip: getIp.get.Ethernet[0]
 }
  res.json(ip)
})

module.exports = router