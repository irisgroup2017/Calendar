const axios = require('axios')
const express = require('express')
const router = express.Router()
const moment = require('moment')
const api = require('../bin/api')

router.get('/',async function(req,res) {
 let data = api.get()
})

module.exports = router