var express = require('express'),
authHelper = require('../bin/auth'),
con = require('../bin/mysql'),
router = express.Router(),
dateFormat = require('dateformat'),
ls = require('../bin/larStock')

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		authHelper.fortuneCookies(data,res)
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
				userName: result[i].userName
			})
		}
		parms.tbl = parms.objs.length
		res.render('setting', parms)
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
			result[0].boss = (result[0].boss==1?true:false)
			result[0].cdate = dateFormat(new Date(result[0].cdate)*1000,'dd-mm-yyyy')
			result[0].swtime = result[0].swtime.substring(0,5)
			result[0].ewtime = result[0].ewtime.substring(0,5)
			res.json(result[0])
		})
	}
	if (a.state == "cdate") {
		con.q('UPDATE privacy_data SET cdate = ? WHERE emid = ?',[a.cdate,a.emid])
		ls.setLar(a.name+' '+a.lastName,a.dataid,'insert')
        res.json(a)
	}
	if (a.state == "swtime") {
		a.swtime = a.swtime.substring(0,5)
		con.q('UPDATE privacy_data SET swtime = ? WHERE emid = ?',[a.swtime,a.emid])
        res.json(a)
	}
	if (a.state == "ewtime") {
		a.ewtime = a.ewtime.substring(0,5)
		con.q('UPDATE privacy_data SET ewtime = ? WHERE emid = ?',[a.ewtime,a.emid])
        res.json(a)
    }
	if (a.state === 'delete') {
		await con.q(['DELETE FROM user_data WHERE dataid = ?','DELETE FROM privacy_data WHERE dataid = ?','DELETE FROM lar_status WHERE dataid = ?','DELETE FROM lar_data WHERE dataid = ?'],a.dataid)
		res.json(a)
	}
	if (a.state === 'add') {
		await con.q('INSERT INTO user_data (dataid,emid,name,lastName,jobPos,depart,mail,mailGroup,userName,password) VALUES (?,?,?,?,?,?,?,?,?,?)',[a.dataid,a.emid,a.name,a.lastName,a.jobPos,a.depart,a.mail,a.mailGroup,a.userName,a.password])
		await con.q('INSERT INTO privacy_data (dataid,cdate,emid,userName,mailGroup,boss,operator,swtime,ewtime) VALUES (?,?,?,?,?,?,?,?,?)',[a.dataid,a.cdate,a.emid,a.name+' '+a.lastName,a.mailGroup,0,0,'083000','173000'])
		res.json(a)
	}
	if (a.state == 'save') {
		await con.q('UPDATE user_data SET emid = ?,name = ?,lastName = ?,jobPos = ?,depart = ?,mail = ?,mailGroup = ?,userName = ? WHERE dataid = ?',[a.emid,a.name,a.lastName,a.jobPos,a.depart,a.mail,a.mailGroup,a.userName,a.dataid])
		await con.q('UPDATE privacy_data SET emid = ?,userName = ?,mailGroup = ? WHERE dataid = ?',[a.emid,a.name+' '+a.lastName,a.mailGroup,a.dataid])
		await con.q('UPDATE lar_data SET userName = ?,mailGroup = ? WHERE dataid = ?',[a.name+' '+a.lastName,a.mailGroup,a.dataid])
		res.json(a)
	}
})

module.exports = router