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
const larstock = require("./bin/larstock")
const epass = require("./bin/easypass")
const schedule = require('node-schedule')
const log = require('./bin/logger')
const favicon = require('serve-favicon')
const fingerscan = require('./bin/fingerscan')

schedule.scheduleJob("0 0 0 * * *",async () => {
 larstock.updateAll()
 fingerscan.fingerToJSON()
	await epass.get()
	log.logger("info","Auto Update Database")
})
require(__basedir+'/app/routers/application.router.js')(app, router, upload)
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

const index = require('./routes/index')
const authorize = require('./routes/authorize')
const refreshdata = require('./routes/refreshdata')
const calendar = require('./routes/calendar')
const lar = require('./routes/lar')
const proc = require('./routes/proc')
const sumlar = require('./routes/sumlar')
const login = require('./routes/login')
const setting = require('./routes/setting')
const search = require('./routes/search')
const searchb = require('./routes/searchb')
const profile = require('./routes/profile')
const privacy = require('./routes/privacy')
const approve = require('./routes/approve')
const hr = require('./routes/hr')
const delreq = require('./routes/delreq')
const editentitle = require('./routes/editentitle')
const leavelist = require('./routes/leavelist')
const vacationa = require('./routes/vacationa')
const excelexport = require('./routes/excelexport')
const hrexport = require('./routes/hrexport')
const getlar = require('./routes/getlar')
const contact = require('./routes/contact')
const exportmanager = require('./routes/exportmanager')
const easypass = require('./routes/easypass')
const setting2 = require('./routes/setting2')
const forms = require('./routes/forms')

app.use('/', index)
app.use('/authorize', authorize)
app.use('/calendar', calendar)
app.use('/lar', lar)
app.use('/proc', proc)
app.use('/sumlar', sumlar)
app.use('/login', login)
app.use('/setting', setting)
app.use('/search', search)
app.use('/searchb', searchb)
app.use('/profile', profile)
app.use('/privacy', privacy)
app.use('/approve', approve)
app.use('/hr', hr)
app.use('/delreq', delreq)
app.use('/editentitle', editentitle)
app.use('/leavelist', leavelist)
app.use('/vacationa', vacationa)
app.use('/excelexport', excelexport)
app.use('/hrexport', hrexport)
app.use('/getlar', getlar)
app.use('/refreshdata', refreshdata)
app.use('/contact', contact)
app.use('/exportmanager', exportmanager)
app.use('/easypass', easypass)
app.use('/setting2', setting2)
app.use('/forms',forms)

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