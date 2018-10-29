var express = require('express')
var path = require('path')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var $ = require('jquery')
var app = express()
var mysql = require('mysql')
require('dotenv').config()

function handleDisconnect() {
	var con = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '#Iris@2013',
		database: 'calendar',
	})
  
	con.connect(function(err) { 
	  if(err) { 
		console.log('error when connecting to db:', err)
		setTimeout(handleDisconnect, 2000)
	  }                                    
	});                                
	con.on('error', function(err) {
	  console.log('db error', err)
	  if(err.code === 'PROTOCOL_CONNECTION_LOST') {
		handleDisconnect()       
	  } else {   
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
calendar = require('./routes/calendar'),
lar = require('./routes/lar'),
proc = require('./routes/proc'),
sumlar = require('./routes/sumlar'),
login = require('./routes/login'),
setting = require('./routes/setting'),
search = require('./routes/search'),
profile = require('./routes/profile'),
privacy = require('./routes/privacy'),
approve = require('./routes/approve'),
hr = require('./routes/hr'),
delreq = require('./routes/delreq'),
editentitle = require('./routes/editentitle'),
leavelist = require('./routes/leavelist'),
vacationa = require('./routes/vacationa'),
excelexport = require('./routes/excelexport')

app.use('/', index)
app.use('/authorize', authorize)
app.use('/calendar', calendar)
app.use('/lar', lar)
app.use('/proc', proc)
app.use('/sumlar', sumlar)
app.use('/login', login)
app.use('/setting', setting)
app.use('/search', search)
app.use('/profile', profile)
app.use('/privacy', privacy)
app.use('/approve', approve)
app.use('/hr', hr)
app.use('/delreq', delreq)
app.use('/editentitle', editentitle)
app.use('/leavelist', leavelist)
app.use('/vacationa', vacationa)
app.use('/excelexport', excelexport)

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