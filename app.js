global.__basedir = __dirname
const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express()
const router = express.Router()
const upload = require(__basedir+'/app/config/multer.config.js')
const memoUpload = require(__basedir+'/app/config/memomulter.config.js')
const larstock = require("./bin/larstock")
const epass = require("./bin/easypass")
const schedule = require('node-schedule')
const log = require('./bin/logger')
const favicon = require('serve-favicon')
const fingerscan = require('./bin/fingerscan')

schedule.scheduleJob("0 0 0 * * *",async () => {
 larstock.updateAll()
 await epass.get()
 fingerscan.fingerToJSON()
	log.logger("info","Auto Update Database")
})
require(__basedir+'/app/routers/application.router.js')(app, router, upload)
require(__basedir+'/app/routers/memoattach.router.js')(app, router, memoUpload)
require('dotenv').config()

function handleDisconnect() {
	var con = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	})
  
	con.connect(function(err) { 
	  if(err) { 
		console.log('error when connecting to db:', err)
		setTimeout(handleDisconnect, 10000)
	  }                                    
	});                                
	con.on('error', function(err) {
	  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log('database reconnected')
		handleDisconnect()       
	  } else {   
			console.log('db error', err)
			log.logger('error','db error')
			con.release()                   
			throw err                 
	  }
	})
}
handleDisconnect()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(favicon(path.join(__dirname,"favicon.ico")))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))

const approve = require('./routes/approve')
const authorize = require('./routes/authorize')
const calendar = require('./routes/calendar')
const contact = require('./routes/contact')
const cross = require('./routes/cross')
const delreq = require('./routes/delreq')
const easypass = require('./routes/easypass')
const editentitle = require('./routes/editentitle')
const excelexport = require('./routes/excelexport')
const exportmanager = require('./routes/exportmanager')
const forms = require('./routes/forms')
const getip = require('./routes/getip')
const getlar = require('./routes/getlar')
const hr = require('./routes/hr')
const hrexport = require('./routes/hrexport')
const index = require('./routes/index')
const lar = require('./routes/lar')
const leavelist = require('./routes/leavelist')
const leavereport = require('./routes/leavereport')
const listtable = require('./routes/listtable')
const login = require('./routes/login')
const memo = require('./routes/memo')
const managerleavelist = require('./routes/managerleavelist')
const privacy = require('./routes/privacy')
const proc = require('./routes/proc')
const profile = require('./routes/profile')
const refreshdata = require('./routes/refreshdata')
const setting = require('./routes/setting')
const setting2 = require('./routes/setting2')
const search = require('./routes/search')
const searchb = require('./routes/searchb')
const sumlar = require('./routes/sumlar')
const vacationa = require('./routes/vacationa')

app.use('/', index)
app.use('/approve', approve)
app.use('/authorize', authorize)
app.use('/calendar', calendar)
app.use('/contact', contact)
app.use('/cross', cross)
app.use('/delreq', delreq)
app.use('/easypass', easypass)
app.use('/editentitle', editentitle)
app.use('/exportmanager', exportmanager)
app.use('/excelexport', excelexport)
app.use('/forms',forms)
app.use('/getip', getip)
app.use('/getlar', getlar)
app.use('/hr', hr)
app.use('/hrexport', hrexport)
app.use('/lar', lar)
app.use('/leavelist', leavelist)
app.use('/leavereport', leavereport)
app.use('/listtable', listtable)
app.use('/login', login)
app.use('/memo', memo)
app.use('/managerleavelist', managerleavelist)
app.use('/proc', proc)
app.use('/profile', profile)
app.use('/privacy', privacy)
app.use('/refreshdata', refreshdata)
app.use('/search', search)
app.use('/searchb', searchb)
app.use('/setting', setting)
app.use('/setting2', setting2)
app.use('/sumlar', sumlar)
app.use('/vacationa', vacationa)

app.use(function(req, res, next) {
	var err = new Error('Not Found')
	parms = { title: 'Error', head1: 'Error Status', head2: ' 404' }
	err.status = 404
	next(err)
})

app.use(function(err, req, res, next) {
	res.locals.message = err.message
	res.locals.error = req.app.get('env') === 'development' ? err : {}
	res.status(err.status || 500)
	parms = { title: 'Error', head1: 'Error Status', head2: ' ' + err.status }
	
	res.render('error')
})

module.exports = app