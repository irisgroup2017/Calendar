var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ll = require('../bin/larlist'),
mailsend = require('../bin/mailsend')

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'HR อนุมัติการลา', head1: 'HR Approve Page', head2: userName }

        parms.user = userName
        parms.operator = dataop
        if (dataop < 3) { res.redirect('/') }
	} else {
		// Redirect to home
		res.redirect('/')
    }
    result = await con.q('SELECT * FROM lar_data WHERE approve = ?',3)
    parms.objs = []
	var end = '',
	allDay = ''
    for (var i = 0; i < result.length; i++) {
        if (result[i].end) { end = result[i].end } else { end = null }
        if (result[i].allDay) { allDay = true } else { allDay = false }
        if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
        else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
        else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน'} 
        else { larType = result[i].title }
        timeKeep = ll.getDayTime(result[i].start,end,allDay)
        t = ll.getDateValue(result[i].cTime)
        cTime = t.dy+', '+t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
        parms.objs.push({
            larid: result[i].id,
            userName: result[i].userName,
            lartype: larType,
            title: result[i].title,
            dateStart: timeKeep.dateStart,
            dateEnd: timeKeep.dateEnd,
            timeStart: timeKeep.timeStart,
            timeEnd: timeKeep.timeEnd,
            daylength: timeKeep.daylength,
            userName: result[i].userName,
            cTime: cTime
        })
    }
    parms.tbl = parms.objs.length
    res.render('hr', parms)
})

router.post('/', async function(req, res) {
    var state = req.body.state,
    larid = req.body.larid,
    approve,
    approver = req.cookies.user_name,
    delreq,
    approvedate = new Date().getTime()/1000
    if (state == 'approve') {
        approve = 4
        result = await con.q('UPDATE lar_data SET approve = ?,hrapprover = ?,hrapprovedate = ? WHERE id = ?',[approve,approver,approvedate,larid])
        mailsend.send('ฝ่ายทรัพยากรบุคคลอนุมัติการ',approver,larid,'user')
        res.json(req.body)
    }
    if (state == 'massapprove') {
        approve = 4
        for (var i=0;i<larid.length;i++) {
            result = await con.q('UPDATE lar_data SET approve = ?,hrapprover = ?,hrapprovedate = ? WHERE id = ?',[approve,approver,approvedate,req.body.larid[i]])
            mailsend.send('ฝ่ายทรัพยากรบุคคลอนุมัติการ',approver,req.body.larid[i],'user')
        }
        res.json(req.body)
    }
    if (state == 'reject') {
        approve = 1
        result = await con.q('UPDATE lar_data SET approve = ?,hrapprover = ?,hrapprovedate = ? WHERE id = ?',[approve,approver,approvedate,larid])
        mailsend.send('ฝ่ายทรัพยากรบุคคลไม่อนุมัติการ',approver,larid,'user')
        res.json(req.body)
    }
})

module.exports = router