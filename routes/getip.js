const getIp = require('../bin/getip')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let ipGet = getIp.get
 let ipKey = Object.keys(ipGet)
 let ip = ipGet[ipKey[0]][0]
 let ipop = {
  protocal:req.protocol+"://",
  ip: ip
 }
  res.json(ipop)
})

module.exports = router