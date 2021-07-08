express = require('express'),
router = express.Router(),
con = require('../bin/mysql')
const api = require('../bin/api')

router.get('/', async function(req, res) {
 api.send('GET','/lardata','')
})

module.exports = router