var express = require('express')
const router = express.Router()
const api = require('../bin/api')

router.get('/', async function(req, res) {
    let userList = await api.get('/users/find/employee')
	parms = {
		title: 'แสดงข้อมูลลงเวลาพนักงาน',
		head1: 'แสดงข้อมูลลงเวลาพนักงาน',
		id: req.cookies.user_dataid,
		user: req.cookies.user_name,
		operator: req.cookies.user_op,
        userList: JSON.stringify(userList)
	}
	res.render('calendarreport', parms)
})

module.exports = router