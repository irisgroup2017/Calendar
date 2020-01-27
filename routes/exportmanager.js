const express = require('express')
const router = express.Router()
const excel = require('../bin/exportdirector')
const log = require('../bin/logger')
const con = require('../bin/mysql')

router.get('/', async function(req, res) {
    let dataop = req.cookies.user_op
    if (dataop < 3) { res.redirect('/') }
    else {
        let userName = req.cookies.user_name
        let dataid = req.cookies.user_dataid
        let mail = req.cookies.user_mail
        let thisyear = (new Date()).getFullYear()
        let query = "SELECT DISTINCT year FROM lar_status WHERE year > 2017 AND year <= ?"
        let yearlist = await con.q(query,thisyear)
        yearlist = yearlist.map(item => {
            return item.year
        })
        if (userName) {
            data = {
                'username': userName,
                'dataid': dataid,
                'operator': dataop,
                'mail': mail
            }
            parms = { title: 'นำออกข้อมูลสรุปรายละเอียดการลา', head1: 'Excel Export' }
            parms.yearlist = yearlist
            parms.thisyear = thisyear
            parms.user = userName
            parms.operator = dataop
        } else {
            res.redirect('/login')
        }
    }
    res.render('exportmanager', parms)
})

router.get('/export', async function(req, res) {
    excel.managerExport(req.query.option,req.query.time,res)
    log.logger('info','Manager Exported: '+ req.cookies.user_name)
})

router.post('/',async function(req,res) {
	rlink = '/exportmanager/export?time='+req.body.time+'&option='+req.body.option
	res.json(rlink)
})

module.exports = router