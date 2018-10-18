var express = require('express'),
authHelper = require('../bin/auth'),
router = express.Router(),
con = require('../bin/mysql'),
ll = require('../bin/larlist'),
ls = require('../bin/larStock'),
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
		parms = { title: 'รายการขอยกเลิกการลา', head1: 'Delete Request', head2: userName }

		authHelper.fortuneCookies(data,res)
        parms.user = userName
        parms.operator = dataop
        if (dataop < 3) { res.redirect('/') }
	} else {
		res.redirect('/login')
    }
    result = await con.q('SELECT * FROM lar_data WHERE delreq = ?',1)
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
    res.render('delreq', parms)
})

router.post('/', async function(req, res) {
    var state = req.body.state,
    larid = req.body.larid,
    approve,
    approver = req.cookies.user_name,
    delreq,
    approvedate = new Date().getTime()/1000
    if (state == 'approve') {
        approve = 0
        result = await con.q('UPDATE lar_data SET approve = ?,hrapprover = ?,hrapprovedate = ?,delreq = ? WHERE id = ?',[approve,approver,approvedate,0,larid])
        mailsend.send('ฝ่ายทรัพยากรบุคคลอนุมัติคำขอยกเลิกการ',approver,larid,'user')
    }
    if (state == 'massapprove') {
        approve = 0
        for (var i=0;i<larid.length;i++) {
            result = await con.q('UPDATE lar_data SET approve = ?,hrapprover = ?,hrapprovedate = ?,delreq = ? WHERE id = ?',[approve,approver,approvedate,0,req.body.larid[i]])
            mailsend.send('ฝ่ายทรัพยากรบุคคลอนุมัติคำขอยกเลิกการ',approver,req.body.larid[i],'user')
        }
    }
    if (state == 'reject') {
        result = await con.q('UPDATE lar_data SET delreq = ?,hrapprover = ?,hrapprovedate = ? WHERE id = ?',[0,approver,approvedate,larid])
        mailsend.send('ฝ่ายทรัพยากรบุคคลปฏิเสธคำขอยกเลิกการ',approver,larid,'user')
    }
    ls.updateLar(data.userName,data.dataid)
    res.json(req.body)
})

module.exports = router