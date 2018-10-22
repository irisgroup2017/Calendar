const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
ll = require('../bin/larlist'),
log = require('../bin/logger')

router.post('/',async function(req,res,next){
	var sTime = req.body.datea/1000,eTime = req.body.dateb/1000,userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'Summary', head1: 'Login', head2: userName }
		parms.user = userName
		parms.operator = dataop
	} else {
		res.redirect('/login')
	}

	result = await con.q('SELECT * FROM lar_data WHERE userName = ? AND start BETWEEN ? AND ?',[req.body.searchName,sTime,eTime])
	result2 = await con.q('SELECT * FROM privacy_data WHERE userName = ?',req.body.searchName)
	log.logger('info','List Leave Report : '+ req.cookies.user_name)
	parms.objs = []
	var end = '',
	allDay = '',
	larstatus = '',
	approvedate = '',
	dayPlus = 0,
	hourPlus = 0,
	minPlus = 0
	for (var i = 0; i < result.length; i++) {
			if (result[i].end) { end = result[i].end } else { end = null }
			if (result[i].allDay) {	allDay = true } else { allDay = false }
			if (result[i].delreq == 1) {
				t = ll.getDateValue(result[i].deldate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].userName
			}
            else if (result[i].approve == 1 && result[i].hrapprovedate) {
				t = ll.getDateValue(result[i].hrapprovedate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].hrapprover
			}
			else if (result[i].approve == 3) {
				t = ll.getDateValue(result[i].approvedate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].approver
			}
			else if (result[i].approve == 4) {
				t = ll.getDateValue(result[i].hrapprovedate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].hrapprover
            }
            else if (result[i].approve == 1) {
				t = ll.getDateValue(result[i].approvedate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].approver
            }
            else if (result[i].approve == 0) {
				t = ll.getDateValue(result[i].hrapprovedate*1000 + (7 * 60 * 60))
                approvedate = t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
                approver = result[i].hrapprover
			}
			if (result[i].delreq == 1) { larstatus = 'แจ้งยกเลิก: ' + approvedate , classn = 'class="bg-warning"' }
			else if (result[i].approve == 0) { larstatus = 'ยกเลิก: ' + approvedate , classn = 'class="strikeout"' } 
			else if (result[i].approve == 1) { larstatus = 'ไม่อนุมัติ: ' + approvedate , classn = 'class="bg-danger"' }
			else if (result[i].approve == 2) { larstatus = 'รออนุมัติ' , classn = '' }
			else if (result[i].approve == 3) { larstatus = 'อนุมัติ: ' + approvedate , classn = 'class="bg-success"' }
			else if (result[i].approve == 4) { larstatus = 'HR อนุมัติ: ' + approvedate , classn = 'class="bg-info"' }

			if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
			else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
			else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน' } 
			else { larType = result[i].title }
			timeKeep = ll.getDayTime(result[i].start+25200,(end?end+25200:end),allDay,result2[0].swtime.substring(0,5),result2[0].ewtime.substring(0,5))
			t = ll.getDateValue(result[i].cTime)
			cTime = t.dy+', '+t.da+' '+t.mo+' '+t.y+' ('+t.h+':'+t.mi+')'
			parms.objs.push({
				lartype: larType,
				title: result[i].title,
				dateStart: timeKeep.dateStart,
				dateEnd: timeKeep.dateEnd,
				timeStart: timeKeep.timeStart,
				timeEnd: timeKeep.timeEnd,
				daylength: timeKeep.daylength,
				userName: result[i].userName,
				cTime: cTime,
				classn: classn,
				larstatus: larstatus,
				approver: approver,
				approve: result[i].approve
			})
			tokenDate = timeKeep.daylength.split(' ')
			if (tokenDate.indexOf('วัน') > -1) {
				dayPlus = parseInt(tokenDate[tokenDate.indexOf('วัน')-1]) + dayPlus
			 }
			if (tokenDate.indexOf('ชั่วโมง') > -1) {
				hourPlus = parseInt(tokenDate[tokenDate.indexOf('ชั่วโมง')-1]) + hourPlus
			 }
			if (tokenDate.indexOf('นาที') > -1) {
				minPlus = parseInt(tokenDate[tokenDate.indexOf('นาที')-1]) + minPlus
			 }
			if (minPlus >= 60) { 
				hourPlus = Math.floor(hourPlus+ (minPlus / 60))
				minPlus = minPlus % 60
			}
			if (hourPlus >= 8) {
				dayPlus = Math.floor(dayPlus + (hourPlus / 8))
				hourPlus = hourPlus % 8
			}
			parms.lengthPlus = dayPlus +' วัน ' + hourPlus + ' ชั่วโมง '+ (minPlus > 0 ? minPlus +' นาที' : "")
		}
		parms.tbl = parms.objs.length
		res.json(parms)
})

module.exports = router