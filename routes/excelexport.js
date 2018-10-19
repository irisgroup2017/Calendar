var express = require('express'),
router = express.Router(),
excel = require('../bin/excelexport'),
log = require('../bin/logger')

router.get('/', async function(req, res) {
    excel.xlCreate(res)
    log.logger('info','Excel Exported: '+ req.cookies.user_name)
})

module.exports = router