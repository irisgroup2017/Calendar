var multer = require('multer')
const qs = require('qs');
var fs = require('fs')
const paths = require('path')
const moment = require('moment')
var storage = multer.diskStorage({
 destination: function (req, file, cb) {
  var path = paths.join(__basedir,'\\public\\image',moment().format('YYYY-MM-DD'))
  if (!fs.existsSync(path)) {
   fs.mkdirSync(path)
  }
  cb(null, path)
 },
 filename: function (req, file, cb) {
  var path = __basedir + '\\public\\image'
  let ext = paths.extname(file.originalname)
  let name = qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u')).user_name
  let filename = name +''+ext
  path = paths.join(path,name,filename)
  if (!fs.existsSync(path)) {
   cb(null, filename)
  } else {
   fs.unlinkSync(path)
   cb(null, filename)
  }
 }
})
var picUpload = multer({
 storage: storage
})
module.exports = picUpload