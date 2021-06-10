const express = require('express')
const router = express.Router()
const fs = require('fs')
const filepath = './public/handbook/';
const path = require('path')

/* GET home page. */
router.get('/', async function(req, res) {
	parms = { title: 'คู่มือ', head1: "Handbook" }
 if (req.cookies) {
  parms.user = req.cookies.user_name
		parms.operator = req.cookies.user_op
 }
 parms.handbook = fs.readdirSync(filepath,callback => result)
 .map(file => ({
   path: '/public/handbook/' +file,
   name: path.basename(file),
   ext: path.extname(file)
  })
 );
	res.render('handbook', parms)
})

module.exports = router