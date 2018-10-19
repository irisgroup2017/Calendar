const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
timestamp = require('unix-timestamp'),
nodemailer = require('nodemailer'),
ll = require('../bin/larlist'),
log = require('../bin/logger')

function remodule(d) {
	var i,a,d=d.toString()
	if (d.length < 5) {i=1} else {i=0}
	if (d.length == 3) {i=1} else {i=0}
	if (d.length == 1) {i=1} else {i=0}
	if (d.length+i == 6) { a= d.substring(0,2-i) + ' วัน ' , a= a + (Number(d.substring(2-i,2)) == 0 ? "" : d.substring(2-i,2) + ' ชั่วโมง ') , a= a + (Number(d.substring(4-i,2)) == 0 ? "" : d.substring(4-i,2) + ' นาที') }
	if (d.length+i == 4) { a= d.substring(0,2-i) + ' ชั่วโมง ', a= a + (Number(d.substring(2-i,2)) == 0 ? d.substring(2-i,2) : d.substring(2-i,2) + ' นาที') }
	if (d.length+i == 2) { a= d.substring(0,2-i) + ' นาที' }
	return a
}
router.post('/',async function(req, res) {
	if (req.body.state == 'load') {
		con.q('SELECT * FROM reserve_data WHERE start BETWEEN ? AND ?',[req.body.start,req.body.end])
		.then(result => {
			var objs = []
			var end = ''
			var allDay = ''
	
			for (var i = 0; i < result.length; i++) {
				if (result[i].end) {
					end = timestamp.toDate(result[i].end)
				} else {
					end = null
				}
				if (result[i].allDay) {
					allDay = true
				} else {
					allDay = false
				}
				if (req.cookies.user_name == result[i].userName) {
					editable = true
				} else {
					editable = false
				}
				objs.push({
					id: result[i].id,
					title: result[i].title,
					start: timestamp.toDate(result[i].start),
					end: end,
					allDay: allDay,
					className: result[i].className,
					userName: result[i].userName,
					editable: editable
				})
			}
			res.json(objs)
		})
	}
	if (req.body.state == 'loads') {
		var result = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?',[req.cookies.user_dataid,new Date().getFullYear()])
		objs = {
			'ลาป่วย': (result[0].sickr ? remodule(result[0].sickr) : result[0].sick+' วัน'),
			'ลากิจ': (result[0].personalr ? remodule(result[0].personalr) : result[0].personal+' วัน'),
			'ลาพักร้อน': (result[0].vacationr ? remodule(result[0].vacationr) : result[0].vacation+' วัน'),
			'ลาฝึกอบรม': (result[0].trainingr ? remodule(result[0].trainingr) : result[0].training+' วัน'),
			'ลาทำหมัน':'ตามใบรับรองแพทย์',
			'ลาคลอด':'90 วันต่อครรภ์',
			'ลาอุปสมบท': (result[0].religiousr ? remodule(result[0].religiousr) : result[0].religious+' วัน'),
			'ลารับราชการทหาร': (result[0].militaryr ? remodule(result[0].militaryr) : result[0].military+' วัน')
		}
		res.json(objs)
	}
	if (req.body.state == 'loadm') {
		var sql = 'SELECT * FROM privacy_data WHERE userName = ?'
		result = await con.q(sql,req.body.userName)
		result = result[0]
		var objs = {}
		objs.dataid = result.dataid
		objs.boss = result.boss
		objs.mailGroup = result.mailGroup
		res.json(objs)
	}
	if (req.body.state == 'loadl') {
		var sql = 'SELECT * FROM lar_data WHERE mailGroup = ? OR userName = ? AND start BETWEEN ? AND ?'
		con.q(sql,[req.cookies.user_mail,req.cookies.user_name,req.body.start,req.body.end])
		.then(result => {
			var objs = [],
			end,allDay,classn
			for (var i = 0; i < result.length; i++) {
				if (result[i].boss || result[i].userName == req.cookies.user_name) {
					if (result[i].end) {
						end = timestamp.toDate(result[i].end+25200)
					} else {
						end = null
					}
					if (result[i].approve == 2) { classn = 'label-light' , result[i].title = result[i].title + ' (รออนุมัติ)' } else { classn = result[i].className }
					if (result[i].allDay) {
						allDay = true
					} else {
						allDay = false
					}
					if (result[i].approve >= 2) {
						objs.push({
							dataid: result[i].dataid,
							id: result[i].id,
							title: result[i].title,
							boss: result[i].boss,
							mailGroup: result[i].mailGroup,
							start: timestamp.toDate(result[i].start+25200),
							end: end,
							allDay: allDay,
							className: classn,
							userName: result[i].userName,
							editable: false
						})
					}
				}
			}
			res.json(objs)
		})
	}
	if (req.body.state == 'getevent') {
		var sql = 'SELECT * FROM reserve_data WHERE ID = ?'
		con.q(sql,req.body.id)
		.then(result => {
			var objs = []
			var end = ''
			var allDay = ''

			for (var i = 0; i < result.length; i++) {
				if (result[i].end) {
					end = timestamp.toDate(result[i].end)
				} else {
					end = null
				}
				if (result[i].allDay) {
					allDay = true
				} else {
					allDay = false
				}
				if (req.cookies.user_name == result[i].userName) {
					editable = true
				} else {
					editable = false
				}
				objs.push({
					id: result[i].id,
					title: result[i].title,
					start: timestamp.toDate(result[i].start),
					end: end,
					allDay: allDay,
					className: result[i].className,
					userName: result[i].userName,
					editable: editable
				})
			}
			res.send(objs)
		})
	}

	if (req.body.state == 'move') {
		if (req.body.title) {
			var title = req.body.title
		}
		if (req.body.id) {
			var ID = req.body.id
		}
		if (req.body.start) {
			var start = timestamp.fromDate(req.body.start)
		}
		if (req.body.end) {
			var end = timestamp.fromDate(req.body.end)
		} else {
			var end = null
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.className) {
			var className = req.body.className
		}
		if (req.body.userName) {
			var userName = req.body.userName
		}

		var sql = 'UPDATE reserve_data SET start = ? , end = ? , allDay = ? WHERE ID = ?'
		con.q(sql, [ start, end, allDay, ID ])
		log.logger('info','Move Reserve Plan : '+ userName +' ID '+ ID)
		res.end()
	}

	if (req.body.state == 'savelar') {
	    var title = req.body.title,
		ID = req.body.id,
		start = timestamp.fromDate(req.body.start),
		className = req.body.className,
		userName = req.body.userName,
		cTime = req.body.cTime,
		dataid = req.body.dataid
		if (req.body.end) {
			var end = timestamp.fromDate(req.body.end)
		} else {
			var end = null
		}
		if (req.body.editable) {
			var editable = 1
		} else {
			var editable = 0
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.boss) {
			var boss = 1
		} else {
			var boss = 0
		}
		if (className == 'label-grey') { larType = 'ลาป่วย' }
		else if (className == 'label-success') { larType = 'ลากิจ' }
		else if (className == 'label-warning') {	larType = 'ลาพักร้อน' }
		else if (className == 'label-yellow') {	larType = 'ลาสลับวันหยุด' }
		else if (className == 'label-info') { larType = title }
		var mailGroup = req.body.mailGroup,
		a,b,c
		if (req.body.swapDate) {
			a = 'dataid,ID,title,start,end,allDay,className,userName,mailGroup,boss,cTime,approve,swapDate'
			b = '?,?,?,?,?,?,?,?,?,?,?,?,?'
			c = [dataid, ID, title, start, end, allDay, className, userName ,mailGroup,boss,cTime,2,req.body.swapDate]
		} else {
			a = 'dataid,ID,title,start,end,allDay,className,userName,mailGroup,boss,cTime,approve'
			b = '?,?,?,?,?,?,?,?,?,?,?,?'
			c = [dataid, ID, title, start, end, allDay, className, userName ,mailGroup,boss,cTime,2]
		}
		var sql = await 'INSERT INTO lar_data ('+ a +') VALUES ('+ b +')'
		con.q(sql,c)
		var userdat = await con.q('SELECT userName,password FROM user_data WHERE mail = ?',mailGroup),
		qlink = 'http://webapp.iris.co.th:3000/authorize?username='+userdat[0].userName+'&password='+userdat[0].password+'&redirect=approve',
		timec = ll.getDayTime(start,end,allDay)
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'iris4notice@gmail.com', // your email
			  pass: '#Iris@2013' // your email password
			}
		  })
		  let mailOptions = {
			from: 'iris4notice@gmail.com',                // sender
			to: mailGroup,                // list of receivers
			subject: "ขออนุญาติ"+larType,              // Mail subject
			html: '<h3>ขออนุญาติ'+larType+'</h3>\
			<h5>'+userName+'</h5>\
			<table>\
			<tr>\
			<td>ประเภท</td>\
			<td>'+larType+'</td>\
			</tr>\
			<tr>\
			<td>เหตุผล</td>\
			<td>'+title+'</td>\
			</tr>\
			<tr>\
			<td>วันที่ลา</td>\
			<td>'+timec.dateStart+(timec.dateEnd==timec.dateStart ? '' : ' - '+timec.dateEnd)+'</td>\
			</tr>\
			<tr>\
			<tr>\
			<td>ช่วงเวลา</td>\
			<td>'+timec.timeStart+(timec.timeEnd ? ' - '+timec.timeEnd : '')+'</td>\
			</tr>\
			<tr>\
			<td>ระยะเวลา</td>\
			<td>'+timec.daylength+'</td>\
			</tr>\
			</table><br>\
			<a href="'+qlink+'"><button class="blue">ไปยังหน้าอนุมัติ</button></a>'
		  }
		  //<style>.wrapper {	width: 600px;margin: 0 auto; } header { width: 600px; } footer { width: 600px; } nav, section , footer {float: left; } nav {width: 150px;margin-right: 10px; } section {width: 440px; } *, *:before, *:after {-moz-box-sizing: border-box;-webkit-box-sizing: border-box;box-sizing: border-box; } body {background: #2980b9;color: #FFF;font-family: Helvetica;text-align: center;margin: 0; } header, nav, section,footer {border: 1px solid rgba(255,255,255,0.8);margin-bottom: 10px;border-radius: 3px; } header {padding: 10px 0; } footer {padding: 10px 0; } nav, section {padding: 10px 0; } button.blue {color: white;background: #4C8FFB;border: 1px #3079ED solid;box-shadow: inset 0 1px 0 #80B0FB;}button.blue:hover {border: 1px #2F5BB7 solid;box-shadow: 0 1px 1px #EAEAEA, inset 0 1px 0 #5A94F1;background: #3F83F1;}button.blue:active {box-shadow: inset 0 2px 5px #2370FE;} </style>
		  transporter.sendMail(mailOptions, function (err, info) {
			if(err)
			  console.log(err)
			else
			  console.log(info)
		 })
		lars = await ll.viewLar(userName,dataid)
		log.logger('info','Request Leave : '+ larType +' by '+ userName +' ID '+ ID)
		res.json(lars)
	}

	if (req.body.state == 'resize') {
		if (req.body.id) {
			var ID = req.body.id
		}
		if (req.body.start) {
			var start = timestamp.fromDate(req.body.start)
		}
		if (req.body.end) {
			var end = timestamp.fromDate(req.body.end)
		} else {
			var end = null
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.userName) {
			var userName = req.body.userName
		}

		var sql = 'UPDATE reserve_data SET start = ? , end = ? , allDay = ? WHERE ID = ?'
		con.q(sql, [ start, end, allDay, ID ])
		log.logger('info','Resize Reserve Plan : '+ userName +' ID '+ ID)
		res.end()
	}

	if (req.body.state == 'edit') {
		if (req.body.title) {
			var title = req.body.title
		}
		if (req.body.id) {
			var ID = req.body.id
		}
		var sql = 'UPDATE reserve_data SET title = ? WHERE ID = ?'
		con.q(sql, [ title, ID ])
		log.logger('info','Edit title Reserve Plan : '+ req.cookies.user_name +' ID '+ ID)
		res.end()
	}

	if (req.body.state == 'remove') {
		if (req.body.title) {
			var title = req.body.title
		}
		if (req.body.id) {
			var ID = req.body.id
		}
		if (req.body.start) {
			var start = timestamp.fromDate(req.body.start)
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.className) {
			var className = req.body.className
		}
		if (req.body.userName) {
			var userName = req.body.userName
		}

		var sql = 'DELETE FROM reserve_data WHERE ID = ?'
		con.q(sql, [ ID ])
		log.logger('info','Remove Reserve Plan : '+ userName +' ID '+ ID)
		res.end()
	}
	if (req.body.state == 'removel') {
		if (req.body.title) {
			var title = req.body.title
		}
		if (req.body.id) {
			var ID = req.body.id
		}
		if (req.body.start) {
			var start = timestamp.fromDate(req.body.start)
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.className) {
			var className = req.body.className
		}
		if (req.body.userName) {
			var userName = req.body.userName
		}

		var sql = 'DELETE FROM lar_data WHERE ID = ?'
		con.q(sql, [ ID ])
		res.end()
	}
	if (req.body.state == 'write') {
		if (req.body.id) {
			var ID = req.body.id
		}
		if (req.body.title) {
			var title = req.body.title
		}
		if (req.body.start) {
			var start = timestamp.fromDate(req.body.start)
		}
		if (req.body.end) {
			var end = timestamp.fromDate(req.body.end)
		} else {
			var end = null
		}
		if (req.body.allDay) {
			var allDay = 1
		} else {
			var allDay = 0
		}
		if (req.body.className) {
			var className = req.body.className
		}
		if (req.body.userName) {
			var userName = req.body.userName
		}

		var sql = 'INSERT INTO reserve_data (ID,title,start,end,allDay,className,userName) VALUES (?,?,?,?,?,?,?)'
		con.q(sql, [ ID, title, start, end, allDay, className, userName ])
		log.logger('info','Create Reserve Plan : '+ userName +' ID '+ ID)
		.then(result => {
			res.end()
		})
	}
})
  
module.exports = router