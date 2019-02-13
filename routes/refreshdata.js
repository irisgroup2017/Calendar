express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
larstock = require('../bin/larstock')

router.get('/', async function(req, res) {
    result = await con.q('SELECT userName,dataid FROM privacy_data')
    for (i=0;i<result.length;i++) {
        await larstock.updateLar(result[i].userName,result[i].dataid,new Date().getTime())
    }
})

module.exports = router