const getIp = require('../bin/getip')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let ipGet = getIp.get
 let ip
 for (address in ipGet) {
  if (ipGet[address][0].split('.').shift != "169") {
   ip = ipGet[address][0]
  }
 }
 let ipop = {
  protocal:req.protocol+"://",
  ip: ip
 }
  res.json(ipop)
})

module.exports = router