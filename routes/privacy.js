var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
log = require('../bin/logger')

router.post('/',function(req, res) {
    if (req.body.state == "cb") {
        con.q('UPDATE privacy_data SET boss = ? WHERE userName = ?',[req.body.sel,req.body.dataname])
        log.logger('info','Change BOSS status : '+ req.cookies.user_name +' ID '+ req.body.dataname)
        res.end()
    }
    if (req.body.state == "rb") {
        con.q('UPDATE privacy_data SET operator = ? WHERE userName = ?',[req.body.sel,req.body.dataname])
        log.logger('info','Change operator status : '+ req.cookies.user_name +' ID '+ req.body.dataname)
        res.end()
    }
})

module.exports = router