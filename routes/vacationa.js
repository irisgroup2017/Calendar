const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
log = require('../bin/logger'),
moment = require('moment')

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'ตั้งค่าวันหยุด', head1: 'ตั้งค่าวันหยุดประจำปี', head2: 'User' }
		parms.user = userName
		parms.operator = dataop
		parms.thisyear = new Date().getFullYear()+543
		yearlist = await con.q('SELECT DISTINCT year FROM vacation_list')
		parms.yearlist = []
		if (yearlist == "") { 
			parms.yearlist.push(new Date().getFullYear()+543)
			parms.yearlist.push(new Date().getFullYear()+544)
		}
		else {
			vlist = await con.q('SELECT * FROM vacation_list WHERE year = ?',[parms.thisyear])
			if (vlist.length > 0) {
				parms.vlist = []
				for (i=0;i<vlist.length;i++) {
					parms.vlist.push({
						year: vlist[i].year,
						dtitle: vlist[i].dtitle,
						doffice: solvedate(vlist[i].doffice),
						dsite: solvedate(vlist[i].dsite)
					})
				}
				parms.tbl = parms.vlist.length
			}
			for (i=0;i<=yearlist.length;i++) {
				if (i==yearlist.length) {
					parms.yearlist.push(yearlist[i-1].year+1)
				}
				else { 
					parms.yearlist.push(yearlist[i].year)
				}
			}
		}
			
		if (dataop < 3) { res.redirect('/') }
	} else {
		res.redirect('/login')
    }
    res.render('vacationa',parms)
})

router.post('/', async function(req, res) {
	if (req.body.state == 'add') {
		await con.q('INSERT INTO vacation_list (year,dtitle,doffice,dsite) VALUES (?,?,?,?)',[req.body.dyear,req.body.dtitle,req.body.doffice,req.body.dsite])
		req.body.doffice = solvedate(req.body.doffice)
		req.body.dsite = solvedate(req.body.dsite)
		res.json(req.body)
	}
	if (req.body.state == 'refresh') {
		vlist = await con.q('SELECT * FROM vacation_list WHERE year = ?',[req.body.dyear])
		if (vlist.length > 0) {
			req.body.vlist = []
			for (i=0;i<vlist.length;i++) {
				req.body.vlist.push({
					year: vlist[i].year,
					dtitle: vlist[i].dtitle,
					doffice: solvedate(vlist[i].doffice),
					dsite: solvedate(vlist[i].dsite)
				})
			}
			req.body.tbl = vlist.length
		}
		res.json(req.body)
	}
	if (req.body.state == 'remove') {
		await con.q('DELETE FROM vacation_list WHERE year = ? AND dtitle = ? AND doffice = ? AND dsite = ?',[req.body.dyear,req.body.dtitle,req.body.doffice,req.body.dsite])
		res.json(req.body)
	}
})

function solvedate(inTime) {
	if (inTime == 0) { return "" }
	inTime = new Date(parseInt(inTime))
	moment.updateLocale('th', {
		months : ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม","สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
		weekdays : ["วันอาทิตย์", "วันจันทร์", "วันอังคาร", "วันพุธ", "วันพฤหัส", "วันศุกร์", "วันเสาร์"]
	})
	return moment(inTime).format('ddddที่ D MMMM') +' '+ (inTime.getFullYear()+543)
}

module.exports = router