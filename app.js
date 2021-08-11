global.__basedir = __dirname;
const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const app = express()
const fileRouter = express.Router()
const upload = require('./app/config/multer.config.js')
const memoAttach = require('./app/config/memoattach.config.js')
const memoUpload = require('./app/config/memomulter.config.js')
const memoFileUpload = require('./app/config/memofilemulter.config.js')
const announceUpload = require('./app/config/announce.config')
const api = require('./bin/api')
const epass = require("./bin/easypass")
const schedule = require('node-schedule')
const log = require('./bin/logger')
const favicon = require('serve-favicon')
const fingerscan = require('./bin/fingerscan')
const router = require('./routes/core');

schedule.scheduleJob({ hour: [0,12],minute: 0,second: 0 },async () => {
 await fingerscan.fingerToJSON()
 await api.send('GET','/lardata','')
 await epass.get()
	log.logger("info","Auto Update Database")
})
require('./app/routers/memoattach.router.js')(app, fileRouter, memoUpload)
require('./app/routers/memofile.router.js')(app, fileRouter, memoFileUpload)
require('./app/routers/memoattachfile.route.js')(app, fileRouter, memoAttach)
require('./app/routers/announce.router')(app, fileRouter,announceUpload)
require('dotenv').config()

function handleDisconnect() {
	var con = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
	})
	con.connect(function(err,connected) { 
	  if(err) { 
		console.log('error when connecting to db:', err)
		setTimeout(handleDisconnect, 10000)
	  } else {
		  console.log(connected)
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
//process.setMaxListeners(0)
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(favicon(path.join(__dirname,"favicon.ico")))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/public', express.static('public'))
app.use(express.static(path.join(__dirname, '/public')))
app.use('/module', express.static('node_modules'))
app.use(express.static(path.join(__dirname, '/node_modules')))
app.use('/memo/public', express.static('public'))
app.use(express.static(path.join(__dirname, '/public')))

app.use(router); 

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