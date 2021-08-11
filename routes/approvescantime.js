const express = require('express');
const router = express.Router();
const sql = require('../bin/mysql');
const api = require('../bin/api');


router.get('/',async function(req,res) {
 let dataid = req.cookies.user_dataid
 parms = {
		title: 'อนุมัติการลงบันทึกเวลา', 
		head1: 'อนุมัติการลงบันทึกเวลา',
		user: req.cookies.user_name,
		operator: req.cookies.user_op,
  objs: await api.send('GET','/iodata',{
   dataid:dataid
  })
	}
 res.render('approvescantime',parms)
})

router.post('/',async function(req,res) {
 let result
 try {
  result = await api.send('POST','/iodata/status',req.body)
 } catch(e) {
  res.status(500).send(e.message)
 }
 res.send(result)
})

module.exports = router