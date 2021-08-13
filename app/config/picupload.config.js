var multer = require('multer')
var fs = require('fs')
var storage = multer.diskStorage({
 destination: function (req, file, cb) {
  var path = __basedir + '\\public\\image\\'
  if (!fs.existsSync(path)) {
   fs.mkdirSync(path)
  }
  cb(null, path)
 },
 filename: function (req, file, cb) {
  var path = __basedir + '\\public\\image\\'
  let name = file.originalname
  let filename = name
  path = path + '' + filename
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