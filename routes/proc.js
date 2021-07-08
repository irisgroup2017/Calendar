const express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
timestamp = require('unix-timestamp'),
nodemailer = require('nodemailer'),
ll = require('../bin/larlist'),
log = require('../bin/logger'),
fs = require('fs')
const api = require('../bin/api')
const dns = require('dns')
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.USERMAIL,
		pass: process.env.USERPASS
	}
})


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

router.get('/getfinger',async function(req,res) {
 if (!req.cookies.user_dataid) { res.redirect('/') }
 let id = req.cookies.user_dataid
 let result = await con.q('SELECT status,comment,DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.stime AS timestart,u.etime AS timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM inoutchange_data AS u JOIN machine_data AS ms on u.placein = ms.MachCode JOIN machine_data AS me on u.placeout = me.MachCode where dataid = ? AND (date BETWEEN ? AND ?)',[id,req.body.start,req.body.end])
 if (result.length > 0 ) {
  res.json(result[0])
 }
})

router.get('/manualscan',async function(req,res) {
 if (!req.cookies.user_dataid) { res.redirect('/') }
 let id = req.cookies.user_dataid
 let date = req.body.date
 let result = await con.q('SELECT * FROM inoutchange_data WHERE dataid = ? AND date = ?',[id,date])
 res.json(result)
})

router.post('/fingerscan',async function(req, res) {
 if (!req.cookies.user_dataid) { res.redirect('/') }
 id = req.cookies.user_dataid
 let table = "em" + id.toString()
 let tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
 if (tableexist.length != 0) {
  let fingerScan = await con.q('SELECT DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.timestart,u.timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM '+table+' AS u JOIN machine_data AS ms on u.MachCodeStart = ms.MachCode JOIN machine_data AS me on u.MachCodeEnd = me.MachCode WHERE (date BETWEEN ? AND ?)',[req.body.start,req.body.end])
  let manualScan = await con.q('SELECT status,comment,DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.stime AS timestart,u.etime AS timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM inoutchange_data AS u JOIN machine_data AS ms on u.placein = ms.MachCode JOIN machine_data AS me on u.placeout = me.MachCode where dataid = ? AND status = 1 AND (date BETWEEN ? AND ?)',[id,req.body.start,req.body.end])
  let result = [...fingerScan,...manualScan]
  let timeScan = {}
  result.map(it => {
   if (it.timestart == "00:00:00") {
    delete it.timestart
    delete it.mstart
    if (it.status) {
     it.onlyStart = 1
    }
   } else if (it.timeend == "00:00:00") {
    delete it.timeend
    delete it.mend
    if (it.status) {
     it.onlyEnd = 1
    }
   }
   if (!it.onlyStart && !it.onlyEnd && it.status) {
    it.bothManual = 1
   }
   timeScan[it.date] = Object.assign(timeScan[it.date] || {
    date: it.date,
    timestart: '00:00:00',
    timeend: '00:00:00',
    mstart: 'None',
    mend: 'None'
   } ,it)
  })
  res.json(timeScan)
 }
 res.end("")
})

router.post('/',async function(req, res) {
	if (!req.cookies.user_dataid) { res.redirect('/') }
	if (req.body.state == "delfile") {
		var file =  __basedir + '\\public\\doc\\' +req.body.username+ '\\' +req.body.file
		if (fs.existsSync(file)) {
			fs.unlinkSync(file)
			log.logger('info',req.body.username+' Delete attachment: '+file)
			res.status(200).send(true)
		} else {
			res.status(200).send(false)
		}
	}
	if (req.body.state == "loadacc") {
  var url = (req.get('host').split(':'))[0]
  let ip
  async function ipResolve() {
   return new Promise((resolve,reject) => {
    dns.lookup(url,(err,address,family) => {
     if (err) { reject(err) }
     resolve(address !== undefined ? address : 'localhost')
    })
   })
  } 
  try {
   ip = await ipResolve()
  } catch(err) {
   console.log(err.stack)
  }
		result = await con.q('SELECT swtime,ewtime,wplace FROM privacy_data WHERE dataid = ?',[req.cookies.user_dataid])
		req.body.fcwend = result[0].ewtime.substring(0,5)
  req.body.fcwstart = result[0].swtime.substring(0,5)
		if (result[0].wplace == 1) {
			req.body.fcwdow = [1,2,3,4,5]	
		} else {
			req.body.fcwdow = [1,2,3,4,5,6]
  }
  req.body.ip = ip
		res.json(req.body)
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
  var dataid = req.cookies.user_dataid
		var sql = 'SELECT * FROM privacy_data WHERE dataid = ?'
		result = await con.q(sql,dataid)
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
			end,allDay,classn,title
			for (var i = 0; i < result.length; i++) {
				if (result[i].boss || result[i].userName == req.cookies.user_name) {
					if (result[i].swapDate) {
						thisswapdate = result[i].swapDate*1000
						dateread = ("0"+new Date(thisswapdate).getDate()).slice(-2)+ '/' +("0"+(new Date(thisswapdate).getMonth()+1)).slice(-2) +'/'+ new Date(thisswapdate).getFullYear()
						title = "สลับวันหยุดกับวันที่ "+ dateread
					} else {
						title = result[i].title
					}
					if (result[i].end) {
						end = timestamp.toDate(result[i].end)
					} else {
						end = null
					}
					if (result[i].approve == 2) { 
						classn = 'label-light' 
						title = title + ' (รออนุมัติ)' 
					} else { 
						classn = result[i].className 
					}
					if (result[i].allDay) {
						allDay = true
					} else {
						allDay = false
					}
					if (result[i].approve >= 2) {
						objs.push({
							dataid: result[i].dataid,
							id: result[i].id,
							title: title,
							boss: result[i].boss,
							mailGroup: result[i].mailGroup,
							start: timestamp.toDate(result[i].start),
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

	if (req.body.state == 'savelar') {
		var title,ID,start,className,cTime,dataid,end,editable,allDay,boss,larType,mailGroup,a,b,c,swapDate,attach,path,fileExt
		title = req.body.title
		ID = req.body.id
		start = timestamp.fromDate(req.body.start)
		className = req.body.className
		userName = req.body.userName
		cTime = req.body.cTime
		dataid = req.body.dataid
		if (req.body.end) {
			end = timestamp.fromDate(req.body.end)
		} else {
			end = null
		}
		if (req.body.editable) {
			editable = 1
		} else {
			editable = 0
		}
		if (req.body.allDay) {
			allDay = 1
		} else {
			allDay = 0
		}
		if (req.body.boss) {
			boss = 1
		} else {
			boss = 0
		}
		if (req.body.attach != null) { 
			attach = req.body.attach 
			path = __basedir + '/public/doc/' + userName+ '/' + attach
			fileExt = attach.substring(attach.lastIndexOf('.')).toLowerCase()
		}
		else { attach = '' }
		if (className == 'label-grey') { larType = 'ลาป่วย' }
		else if (className == 'label-success') { larType = 'ลากิจ' }
		else if (className == 'label-warning') { larType = 'ลาพักร้อน' }
		else if (className == 'label-dark') { larType = 'ลากิจไม่รับค่าจ้าง'} 
		else if (className == 'label-danger') {	larType = 'ลาสลับวันหยุด' }
		else if (className == 'label-info') { larType = title }
		mailGroup = req.body.mailGroup
		if (req.body.swapDate) {
			swapDate = req.body.swapDate
			a = 'dataid,ID,title,start,end,allDay,className,userName,mailGroup,boss,cTime,approve,swapDate,fname'
			b = '?,?,?,?,?,?,?,?,?,?,?,?,?,?'
			c = [dataid, ID, title, start, end, allDay, className, userName ,mailGroup,boss,cTime,2,swapDate,attach]
		} else {
			a = 'dataid,ID,title,start,end,allDay,className,userName,mailGroup,boss,cTime,approve,fname'
			b = '?,?,?,?,?,?,?,?,?,?,?,?,?'
			c = [dataid, ID, title, start, end, allDay, className, userName ,mailGroup,boss,cTime,2,attach]
		}
		var sql = 'INSERT INTO lar_data ('+ a +') VALUES ('+ b +')'
		await con.q(sql,c)
  await api.send('GET','/lardata/assignid','')
  console.log(await api.send('GET','/lardata/refreshid/'+ dataid,''))
  result = {}
		if (swapDate) {
			result.start = start
			result.swapDate = swapDate 
		}
		log.logger('info','Request Leave : '+ larType +' by '+ userName +' ID '+ ID)
		var userdat = await con.q('SELECT userName,password FROM user_data WHERE mail = ?',mailGroup),
		qlink = 'http://hr.iris.co.th:3000/authorize?username='+userdat[0].userName+'&password='+userdat[0].password+'&redirect=approve',
		timec = ll.getDayTime(start,end,allDay)
		if (path) {
			let mailOptions = {
				from: 'iris4notice@gmail.com',                // sender
				to: mailGroup,                // list of receivers
				subject: "ขออนุญาต"+larType,              // Mail subject
				attachments: {
					// file on disk as an attachment
					filename: (path?'เอกสารแนบประกอบการลา'+fileExt:null),
					path: (path?path:null) // stream this file
				},
				html: '<h3>ขออนุญาต'+larType+'</h3>\
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
			transporter.sendMail(mailOptions, function (err, info) {
				if(err)
				  console.log(err)
				else
				  console.log(info)
			 })
		}
		else {
			let mailOptions = {
				from: 'iris4notice@gmail.com',                // sender
				to: mailGroup,                // list of receivers
				subject: "ขออนุญาต"+larType,              // Mail subject
				html: '<h3>ขออนุญาต'+larType+'</h3>\
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
			/*transporter.sendMail(mailOptions, function (err, info) {
				if(err)
				  console.log(err)
				else
				  console.log(info)
			 })*/
		}
  result.lars = await ll.viewLar(dataid,parseInt(start)*1000)
  console.log(result.lars)
		res.json(result)
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
		await con.q(sql, [ ID ])
  await api.send('GET','/lardata/refreshid/'+ req.body.user_dataid,'')
		res.end()
	}
})

function to(promise) {
 return promise.then(data => {
    return {
      error: null,
      result: data
    }
 })
 .catch(err => {
   return {
     error: err
   }
 })
}
  
module.exports = router