var express = require('express'),
con = require('../bin/mysql'),
router = express.Router(),
dateFormat = require('dateformat'),
ls = require('../bin/larStock'),
log = require('../bin/logger'),
larstock = require('../bin/larstock'),
fs = require("fs")

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'ตั้งค่า', head1: 'Manage', head2: 'User' }
		parms.user = userName
		parms.operator = dataop
		if (dataop < 3) { res.redirect('/') }
	} else {
		res.redirect('/login')
	}
	sql = ['SELECT * FROM privacy_data WHERE userName = ?','SELECT * FROM user_data ORDER BY name ASC']
    con.q(sql,userName)
    .catch(err => { 
		throw err
	})
    .then(results => {
        a = [
            [1,1,0,0,0,0,0],
        	[1,1,0,0,1,0,0],
        	[1,1,1,1,1,0,0],
        	[1,1,0,1,1,1,1],
        	[1,1,1,1,1,1,1]
        	]
        result = results[0]
        if (result.boss) { parms.boss = 1 } else { parms.boss = 0 }
        if (result.mailGroup) { parms.mailGroup = result.mailGroup }
        if (result.operator) { parms.operators = result.operator } else { parms.operators = 0 }
		parms.chk = a[parms.operators]

		result = results[1]
		parms.objs = []
		for (var i = 0; i < result.length; i++) {
			parms.objs.push({
				dataid: result[i].dataid,
				cdate: result[i].cdate,
				emid: result[i].emid,
				name: result[i].name,
				lastName: result[i].lastName,
				mail: result[i].mail,
				jobPos: result[i].jobPos,
				depart: result[i].depart,
				mailGroup: result[i].mailGroup,
				userName: result[i].userName,
				status: result[i].status
			})
		}
		parms.tbl = parms.objs.length
		res.render('setting', parms)
	})
})

router.post('/privacy/:id',async function(req,res) {
  let dataid = req.parms.id
  let result = (await con.q('SELECT * FROM privacy_data,contact_data,user_data WHERE user_data.dataid = ? AND privacy_data.dataid = ? AND contact_data.dataid = ?',[dataid,dataid,dataid]))[0]
  if (result.mailGroup) {
   bossname = await con.q('SELECT name,lastName FROM user_data WHERE mail = ?',[result.mailGroup])
   bossname = bossname[0].name +" "+bossname[0].lastName
  }
  parms.objs = []
  parms.objs.push({
   emid: result.emid,
   name: result.name,
   lastname: result.lastName,
   nickname: result.nickname,
   depart: result.depart,
   jobPos: result.jobPos,
   mail: result.mail,
   workplace: (result.wplace ? "ออฟฟิสใหญ่" : "หน้างาน"),
   swtime: result.swtime.substring(0,5),
   ewtime: result.ewtime.substring(0,5),
   workphone: (result.work == "-" ? "02-196-1100" +(result.ext ? " ("+ result.ext +")" : "") : result.work),
   privatephone: result.private,
   operator: result.operator,
   cdate: dateThai(new Date(result.cdate*1000)),
   bossname: bossname +" ("+result.mailGroup+")",
   username: result.userName,
   password: result.password.substring(0,3) + '*'.repeat(result.password.length-3)
  })
})

router.post('/',async function(req, res) {
	var a = req.body
	if (a.state === 'privacy') {
		con.q('SELECT * FROM privacy_data WHERE dataid = ?',a.dataid)
		.catch(err => { 
			throw err
		})
		.then(result => {
			result[0].wplace = (result[0].wplace==1?true:false)
			result[0].boss = (result[0].boss==1?true:false)
			result[0].cdate = dateFormat(new Date(result[0].cdate*1000),'dd-mm-yyyy')
			result[0].swtime = result[0].swtime.substring(0,5)
			result[0].ewtime = result[0].ewtime.substring(0,5)
			res.json(result[0])
		})
	}
	if (a.state == "stc") {
		con.q("UPDATE user_data SET status = ? WHERE dataid = ?",[(a.status == "true" ? 1 : 0),a.dataid])
		log.logger('info','Change Status : '+ req.cookies.user_name+' - ID '+a.dataid+' to '+a.status)
		res.json(a)
	}
	if (a.state == "comp") {
		con.q("UPDATE privacy_data SET company_id = ? WHERE dataid = ?",[a.comp,a.dataid])
		log.logger('info','Change Company : '+ req.cookies.user_name+' - ID '+a.dataid+' to company ID '+a.comp)
		res.json(a)
	}
	if (a.state == "cdate") {
		con.q('UPDATE privacy_data SET cdate = ? WHERE emid = ?',[a.cdate,a.emid])
		ls.setLar(a.userName,a.dataid,'update',new Date().getTime())
		log.logger('info','Edit Date Start Work : '+ req.cookies.user_name+' - '+a.userName)
        res.json(a)
	}
	if (a.state == "swtime") {
		a.swtime = a.swtime.substring(0,5)
		con.q('UPDATE privacy_data SET swtime = ? WHERE emid = ?',[a.swtime,a.emid])
		log.logger('info','Edit Start Time : '+ req.cookies.user_name+' - '+a.emid)
        res.json(a)
	}
	if (a.state == "ewtime") {
		a.ewtime = a.ewtime.substring(0,5)
		con.q('UPDATE privacy_data SET ewtime = ? WHERE emid = ?',[a.ewtime,a.emid])
		log.logger('info','Edit End Time : '+ req.cookies.user_name+' - '+a.emid)
        res.json(a)
	}
	if (a.state == "checkbox") {
		a.cstatus = (a.cstatus=="true" ? 1 : 0)
		con.q('UPDATE privacy_data SET '+a.cname+' = ? WHERE emid = ?',[a.cstatus,a.emid])
		log.logger('info','Edit Checkbox : '+ req.cookies.user_name+' - '+a.emid)
        res.json(a)
    }
	if (a.state === 'delete') {
		await con.q(['DELETE FROM user_data WHERE dataid = ?','DELETE FROM privacy_data WHERE dataid = ?','DELETE FROM lar_status WHERE dataid = ?','DELETE FROM lar_data WHERE dataid = ?'],a.dataid)
		path = __basedir + '/public/doc/' +req.body.userName+ '/'
		var rmDir = function(path) {
			try { files = fs.readdirSync(path) } catch (e) { return }
			if (files.length > 0) {
				files.forEach(function(x, i) {
					if (fs.statSync(path + x).isDirectory()) {
						rmDir(path + x)
					} else {
						fs.unlinkSync(path + x)
					}
				})
				fs.rmdirSync(path)
			}
		}
		log.logger('info','Remove User : '+ req.body.userName+' by '+a.userName)
		res.json(a)
	}
	if (a.state === 'add') {
		let name = a.name.replace(/\s/g, '')
		let lastName = a.lastName.replace(/\s/g, '')
		await con.q('INSERT INTO user_data (dataid,emid,name,lastName,jobPos,depart,mail,mailGroup,userName,password,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[a.dataid,a.emid,name,lastName,a.jobPos,a.depart,a.mail,a.mailGroup,a.userName,a.password,1])
		await con.q('INSERT INTO privacy_data (dataid,cdate,emid,userName,mailGroup,boss,operator,swtime,ewtime,wplace) VALUES (?,?,?,?,?,?,?,?,?,?)',[a.dataid,a.cdate,a.emid,name+' '+lastName,a.mailGroup,0,0,'08:30:00','17:30:00',0])
		//await ls.setLar(name+' '+lastName,a.dataid,'insert',new Date().getTime())
		log.logger('info','ADD ID : '+ req.cookies.user_name+' - '+a.emid)
		larstock.updateAll()
		res.json(a)
	}
	if (a.state == 'resetpassword') {
		await con.q('UPDATE user_data SET password = ? WHERE dataid = ?',[a.username+'1234',a.dataid])
		log.logger('info','Reset password : '+ req.cookies.user_name+' - '+a.emid)
		res.json(a)
	}
	if (a.state == 'save') {
		await con.q('UPDATE user_data SET emid = ?,name = ?,lastName = ?,jobPos = ?,depart = ?,mail = ?,mailGroup = ?,userName = ? WHERE dataid = ?',[a.emid,a.name,a.lastName,a.jobPos,a.depart,a.mail,a.mailGroup,a.userName,a.dataid])
		await con.q('UPDATE privacy_data SET emid = ?,userName = ?,mailGroup = ? WHERE dataid = ?',[a.emid,a.name+' '+a.lastName,a.mailGroup,a.dataid])
		await con.q('UPDATE lar_data SET userName = ?,mailGroup = ? WHERE dataid = ?',[a.name+' '+a.lastName,a.mailGroup,a.dataid])
  log.logger('info','Edit detail ID : '+ req.cookies.user_name+' - '+a.emid)
  larstock.updateAll()
		res.json(a)
	}
})

module.exports = router