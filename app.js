var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var app = express()
var router = express.Router()
var upload = require('./app/config/multer.config.js')
require('./app/routers/application.router.js')(app, router, upload)
global.__basedir = __dirname
require('dotenv').config()
//require('./bin/createview')

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
		setTimeout(handleDisconnect, 2000)
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
	});
  }
handleDisconnect()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, '/public')))

var index = require('./routes/index'),
authorize = require('./routes/authorize'),
refreshdata = require('./routes/refreshdata'),
calendar = require('./routes/calendar'),
lar = require('./routes/lar'),
proc = require('./routes/proc'),
sumlar = require('./routes/sumlar'),
login = require('./routes/login'),
setting = require('./routes/setting'),
search = require('./routes/search'),
searchb = require('./routes/searchb'),
profile = require('./routes/profile'),
privacy = require('./routes/privacy'),
approve = require('./routes/approve'),
hr = require('./routes/hr'),
delreq = require('./routes/delreq'),
editentitle = require('./routes/editentitle'),
leavelist = require('./routes/leavelist'),
vacationa = require('./routes/vacationa'),
excelexport = require('./routes/excelexport'),
getlar = require('./routes/getlar')

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
app.use('/getlar', getlar)
app.use('/refreshdata', refreshdata)

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