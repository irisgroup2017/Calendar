var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
larlist = require('../bin/larlist')

/* GET home page. */
router.get('/',async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail,
	now = new Date()
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'หน้าแรก', head1: 'หน้าแรก' }
		parms.user = userName
		parms.operator = dataop
		res.render('index', parms)
	} else {
		/**
		parms = { title: 'หน้าแรก', head1: 'หน้าแรก' }
		var now = new Date(),
		tStart = new Date(now.getFullYear(),now.getMonth(),now.getDate(),7).getTime()/1000, 
		tEnd = new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,7).getTime()/1000,
		r = {
			"label-grey":"Avanza 6841",
			"label-success":"March 475",
			"label-danger":"March 745",
			"label-dark":"Vios 1494",
			"label-purple":"ห้องประชุมใหญ่ ชั้น 1",
			"label-yellow":"ห้องประชุมใหญ่ ชั้น 2",
			"label-pink":"ห้องประชุมเล็ก 1 ชั้น 2",
			"label-info":"ห้องประชุมเล็ก 2 ชั้น 2"
		}
		var y,z = await con.q('SELECT * FROM reserve_data WHERE start BETWEEN ? AND ? OR ? BETWEEN start AND end ORDER BY className , start ASC',[tStart,tEnd,tStart])
		parms.objs = []
		if (z) {
			for (var i=0;i<z.length;i++) {
				var mytime = '',mylen = '',miTime=0
				if (!z[i].end && z[i].allDay == 1) { mytime = 'ทั้งวัน' , dlength = '1 วัน' }
				if (z[i].end && z[i].allDay == 0) {
					y = larlist.getDayTime(z[i].start,z[i].end,z[i].allDay) 
					mytime = y.timeStart +'-' + y.timeEnd
					mylen = (y.daylength>4)
					myshTime = Number(y.timeStart.split(':')[0])
					myehTime = Number(y.timeEnd.split(':')[0])
					mysmTime = Number(y.timeStart.split(':')[1])
					myemTime = Number(y.timeEnd.split(':')[1])
					if (myemTime-mysmTime != 0) { miTime = 30 }
					dlength = myehTime-myshTime +' ชั่วโมง '+ (miTime == 0 ? "" : miTime +' นาที')
				}
				if (z[i].end && z[i].allDay == 1) { 
					y = larlist.getDayTime(z[i].start,z[i].end,z[i].allDay) 
					mytime = y.dateStart +' - ' + y.dateEnd 
					dlength = y.daylength
				}
				parms.objs.push({
					className: r[z[i].className],
					title: z[i].title,    
					time: mytime,
					userName: z[i].userName,
					dayLength: dlength
				})
			}
		}
		res.render('index', parms)
		**/
		res.redirect('login')
	}
})
module.exports = router