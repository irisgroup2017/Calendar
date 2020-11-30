const getIp = require('../bin/getip')
const express = require('express')
const router = express.Router()

router.post('/',async function(req,res) {
 let ipop = process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API
 res.json(ipop)
})

module.exports = router