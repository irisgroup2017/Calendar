var multer = require('multer')
var fs = require('fs')
var storage = multer.diskStorage({
 destination: function (req, file, cb) {
  var path = __basedir + '\\public\\memo\\image'
  if (!fs.existsSync(path)) {
   fs.mkdirSync(path)
  }
  cb(null, path)
 },
 filename: function (req, file, cb) {
  var path = __basedir + '\\public\\memo\\image'
  let ext = "." + file.mimetype.split("/")[1]
  let time = (new Date()).getTime()
  let name = (Buffer.from(file.originalname +""+ time, 'base64')).toString('hex')
  let filename = name + '' + ext
  path = path + '' + filename
  if (!fs.existsSync(path)) {
   cb(null, filename)
  } else {
   fs.unlinkSync(path)
   cb(null, filename)
  }
 }
})
var memoattach = multer({
 storage: storage
})
module.exports = memoattach