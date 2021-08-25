var express = require('express')
const router = express.Router()
const ll = require('../bin/larlist')
const con = require('../bin/mysql')
const log = require('../bin/logger')
const fingerscan = require('../bin/fingerscan')
const moment = require('moment')
const api = require('../bin/api')
const path = require('path')
require("dotenv").config()

/* GET /lar. */
router.get('/', async function(req, res) {
	let dataid = req.cookies.user_dataid
	parms = {
		title: 'ระบบลา', 
		head1: 'ระบบลา',
		lars: await ll.viewLar(dataid,new Date().getTime()),
		sdate: moment.unix((await con.q('SELECT cdate FROM privacy_data WHERE dataid = ?',[dataid]))[0].cdate),
		user: req.cookies.user_name,
		vacation: parseInt(process.env.VACATION),
  maxvacation: parseInt(process.env.MAXVACATION),
		operator: req.cookies.user_op
	}
	res.render('lar', parms)
})

router.get('/loaddata', async function(req, res) {
 await fingerscan.fingerToJSON()
 res.redirect('/lar')
})

router.get('/togglevacation', async function(req, res) {
 let vacation = (process.env.VACATION === '0' ? '3' : '0')
 if (vacation == '3') {
  log.logger('warn',req.cookies.user_name +': enable condition leave vacation in advance')
 } else {
  log.logger('warn',req.cookies.user_name +': disable condition leave vacation in advance')
 }
 process.env.VACATION = vacation
 res.end(vacation)
})

router.get('/togglemaxvacation', async function(req, res) {
 let maxvacation = (process.env.MAXVACATION === '0' ? '7' : '0')
 if (maxvacation == '7') {
  log.logger('warn',req.cookies.user_name +': enable condition leave vacation max in advance')
 } else {
  log.logger('warn',req.cookies.user_name +': disable condition leave vacation max in advance')
 }
 process.env.MAXVACATION = maxvacation
 res.end(maxvacation)
})

router.get('/getvacation', async function(req, res) {
 res.json({
  vacation: process.env.VACATION,
  maxvacation: process.env.MAXVACATION
 })
})

router.get('/update',async function(req,res) {
 await api.send('GET','/lardata','')
 res.redirect('/lar')
})

router.post('/swaptime',async function(req,res) {
 let id = req.cookies.user_dataid
 let result = await con.q('SELECT * FROM lar_data WHERE swapDate = ? AND dataid = ?',[req.body.time,id])
 if (result) {
  res.json(result)
 } else {
  res.send("")
 }
})

router.post('/viewfile', async function(req, res) {
		//let fileExt = req.body.thisfile.substring(req.body.thisfile.lastIndexOf('.')).toLowerCase()
		let filename = '/doc/' +req.body.thisname+ '/' +req.body.thisfile
		res.send(filename)
})

router.post('/viewrender',async function (req,res) {
		let updatedur
		if (req.cookies.user_name) {
			let intime = moment.unix(req.body.endtime).format('M')
			let time = (intime == 12 ? moment.unix(req.body.endtime).subtract(1,'y').endOf("year").subtract(7,'h').unix() : parseInt(req.body.endtime))
			updatedur = await ll.viewLar(req.cookies.user_dataid,time)
		} else {
			res.redirect('/login')
		}
		res.json(updatedur)
	})
	//
	router.post('/getvacation',async function (req,res) {
		let result = await con.q('SELECT wplace FROM privacy_data WHERE dataid = ?',[req.cookies.user_dataid])
		let mydata = await con.q('SELECT * FROM vacation_list WHERE '+(result[0].wplace == 1? 'doffice' : 'dsite')+' BETWEEN ? AND ?',[req.body.start,req.body.end])
		let myswap = await con.q('SELECT title,swapDate,start FROM lar_data WHERE className = ? AND dataid = ? AND swapDate BETWEEN ? AND ? AND approve > 0',['label-danger',req.cookies.user_dataid,req.body.start/1000,req.body.end/1000])
		let myattach = await con.q('SELECT start,fname FROM lar_data WHERE dataid = ? AND start BETWEEN ? AND ?',[req.cookies.user_dataid,req.body.start/1000,req.body.end/1000])
		req.body.wplace = (result[0].wplace == 1 ? 'doffice' : 'dsite')
		req.body.mydata = mydata
		req.body.myswap = myswap
		req.body.myattach = myattach
		req.body.thisname = req.cookies.user_name
		res.json(req.body)
})

router.post('/getinout',async function (req,res) {
		let result = await con.q('SELECT * FROM inoutchange_data WHERE dataid = ? AND date = ?',[req.cookies.user_dataid,req.body.date])
		if (result.length) {
			res.json(result[0])
		} else {
			res.end('none')
		}
})

router.post('/dailyreport/add',async function (req,res) {
 let data = req.body
 let query
 data.map(row => {
  row.dataid = req.cookies.user_dataid
  if (row.id) {
   query = updateQuery(row)
  } else {
   query = insertQuery(row)
  }
  console.log(query)
  con.q(query)
 })
 res.send('ok')
})

router.post('/getdailypic',async function (req,res) {
	let start = req.body.start
	let end = req.body.end
	let data = await con.q("SELECT * FROM dailycheckin WHERE dataid = ? AND date BETWEEN ? AND ?",[req.cookies.user_dataid,start,end]).then(
  result => result.map(it => {
   it.date = moment(it.date).add(7,'h').format('YYYY-MM-DD')
   it.path = path.join('\\public\\image',it.date,it.filename)
   return it
   })
 )
	res.json(data)
})

function insertQuery(data) {
 let keys = []
 let values = []
 Object.keys(data).map(key => {
  let value = data[key]
  keys.push(key)
  values.push(value)
 })
 keys = keys.join(",")
 values = values.join(",")
 return `INSERT INTO dailywork (${keys}) VALUES (${values})`
}

function updateQuery(data) {
 let sets = []
 Object.keys(data).map(key => {
  let value = data[key]
  if (key != "id") {
   sets.push(`${key} = ${value}`)
  }
 })
 sets = sets.join(",")
 return `UPDATE dailywork ${sets} WHERE id = ${data.id}`
}


module.exports = router