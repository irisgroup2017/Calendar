
const express = require('express');
const router = express.Router();
const { indexView,singleSearch } = require('../controller/outsource');

router.get('/',indexView);
router.post('/',singleSearch);

module.exports = router