var express = require('express'),
router = express.Router(),
con = require('../bin/mysql')

router.post('/',function(req, res) {
    if (req.body.state == "cb") {
        con.q('UPDATE privacy_data SET boss = ? WHERE userName = ?',[req.body.sel,req.body.dataname])
        res.end()
    }
    if (req.body.state == "rb") {
        con.q('UPDATE privacy_data SET operator = ? WHERE userName = ?',[req.body.sel,req.body.dataname])
        res.end()
    }
})

module.exports = router