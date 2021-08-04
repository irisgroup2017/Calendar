const express = require('express')
const router = express.Router()
const sql = require('../bin/mysql')

router.get('/',function(req,res) {
 let dataid = req.cookies.user_dataid
})

module.exports = router