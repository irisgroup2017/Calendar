const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const ll = require('../bin/larlist')
const mailsend = require('../bin/mailsend')
const log = require('../bin/logger')
const { authUser } = require('../middleware/authorized')

router.get('/',authUser, async function (req, res) {
 let data = await con.q('SELECT a.*,b.* FROM inoutchange_data a INNER JOIN (SELECT dataid FROM user_data WHERE mailGroup = (SELECT mail FROM user_data WHERE dataid = ?)) b ON a.dataid = b.dataid',req.cookies.user_dataid)
 console.log(data)
 res.end()
})

module.exports = router