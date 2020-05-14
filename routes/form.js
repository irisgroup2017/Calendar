const express = require('express')
const router = express.Router()
const log = require('../bin/logger')
const con = require('../bin/mysql')

router.get('/form/:formName', async function(req, res) {
    let userName = req.cookies.user_name
    let dataid = req.cookies.user_dataid
    let mail = req.cookies.user_mail
    if (userName) {
    } else {
        res.redirect('/login')
    }
    res.render(req.params.formName,parms)
})