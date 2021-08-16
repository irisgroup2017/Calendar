var multer = require('multer')
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
  let name = moment()
  let filename = name +''+ext
  path = paths.join(path,moment().format('YYYY-MM-DD'),filename)
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