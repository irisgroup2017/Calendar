var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
log = require('../bin/logger')
mail = require('../bin/mailsend')

router.post('/',async function(req, res) {
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
    if (req.body.state == "fpw") {
        var pw = await con.q('SELECT password FROM user_data WHERE mail = ?',req.body.email)
        log.logger('info','Request password from : '+ req.body.email)
        if (pw.length == 0) {
            res.send('NE')
        } else {
            mail.send(req.body.email,pw[0].password)
            res.send('OK')
        }
        res.end()
    }
})

module.exports = router