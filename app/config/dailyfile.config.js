const multer  = require('multer')
const fs = require('fs')
const qs = require('qs');
const path = require('path')
const moment = require('moment')
const storage = multer.diskStorage({
 destination: function (req, file, cb) {
  let paths = path.join(__basedir,'\\public\\dailywork\\')
  if (!fs.existsSync(paths)) {
   fs.mkdirSync(paths)
  }
  cb(null, paths)
 },
 filename: function (req, file, cb) {
  let ext = path.extname(file.originalname)
  let cookies = qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
  let fileName = moment().format('YYYY-MM-DD ') +''+ ext
  let paths = path.join(__basedir,'\\public\\dailywork\\',cookies.user_name)
  if (!fs.existsSync(paths)) {
   cb(null, fileName)
  }
  else {
   fs.unlinkSync(paths)
   cb(null, fileName) 
  }
 }
})
var upload = multer({ storage: storage })
module.exports = upload