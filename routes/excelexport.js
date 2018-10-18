var express = require('express'),
router = express.Router(),
excel = require('../bin/excelexport')

router.get('/', async function(req, res) {
    excel.xlCreate(res)
})

module.exports = router