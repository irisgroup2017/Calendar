const getIp = require('../bin/getip')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let wifi = "Wi-Fi"
 let ip = (getIp.get.Ethernet == undefined ? getIp.get[wifi][0] : getIp.get.Ethernet[0])
 let ipop = {
  protocal:req.protocol+"://",
  ip: ip
 }
  res.json(ipop)
})

module.exports = router