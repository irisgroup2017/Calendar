var express = require('express')
const router = express.Router()
const ll = require('../bin/larlist')
const con = require('../bin/mysql')
const log = require('../bin/logger')
const fingerscan = require('../bin/fingerscan')
const moment = require('moment')
const api = require('../bin/api')
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

router.get('/getvacation', async function(req, res) {
 let vacation = process.env.VACATION
 res.end(vacation)
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

router.post('/', async function(req, res) {
	if (req.body.state == 'viewfile') {
		//let fileExt = req.body.thisfile.substring(req.body.thisfile.lastIndexOf('.')).toLowerCase()
		let filename = '/doc/' +req.body.thisname+ '/' +req.body.thisfile
		res.send(filename)
	}
	if (req.body.state == 'viewrender') {
		let updatedur
		if (req.cookies.user_name) {
			let intime = moment.unix(req.body.endtime).format('M')
			let time = (intime == 12 ? moment.unix(req.body.endtime).subtract(1,'y').endOf("year").subtract(7,'h').unix() : parseInt(req.body.endtime))
			updatedur = await ll.viewLar(req.cookies.user_dataid,time)
		} else {
			res.redirect('/login')
		}
		res.json(updatedur)
	}
	//
	if (req.body.state == 'getvacation') {
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
	}

	if (req.body.state == 'getinout') {
		let result = await con.q('SELECT * FROM inoutchange_data WHERE dataid = ? AND date = ?',[req.cookies.user_dataid,req.body.date])
		if (result.length) {
			res.json(result[0])
		} else {
			res.end('none')
		}
	}
})

module.exports = router