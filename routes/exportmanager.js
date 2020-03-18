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
        let names = await con.q("SELECT name,lastName,dataid FROM user_data WHERE status = 1 ORDER BY name ASC")
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
            parms = { title: 'นำออกข้อมูลรายละเอียดการลาทั้งหมด', head1: 'Excel Export' }
            parms.yearlist = yearlist
            parms.thisyear = thisyear
            parms.user = userName
            parms.operator = dataop
            parms.names = names
        } else {
            res.redirect('/login')
        }
    }
    res.render('exportmanager', parms)
})

router.get('/download', async function(req, res) {
 let file = '././report excel.xlsx'
 res.download(file)

})

router.get('/export', async function(req, res) {
 var body = req.query
 var id = (body.id !== "empty" ? JSON.parse(body.id) : "empty")
 excel.managerExport(body.option,id,body.start,body.end,res)
 log.logger('info','Manager Exported: '+ req.cookies.user_name)
})

router.post('/',async function(req,res) {
 var param = req.body
 var id = (typeof param.id === "object" ? JSON.stringify(param.id) : "empty")
 if (param.state == "export") {
    rlink = '/exportmanager/export?id='+id+'&option='+param.option+'&start='+param.start+'&end='+param.end
    res.redirect(rlink)
 } else {
    var data = await excel.managerView(id,param.start,param.end)
    if (data != null) {
        res.status(200).json(data)
    } else {
        res.status(204).end()
    }
 }
 res.end()
})

module.exports = router