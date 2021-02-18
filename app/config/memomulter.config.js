var multer = require('multer')
var fs = require('fs')
let year = (new Date()).getFullYear()
var storage = multer.diskStorage({
 destination: function (req, file, cb) {
  let memopath = req.body.memopath
  var path = __basedir + '\\public\\memo\\' + memopath
  if (!fs.existsSync(path)) {
   fs.mkdirSync(path)
  }
  cb(null, path)
 },
 filename: function (req, file, cb) {
  let memopath = req.body.memopath
  var path = __basedir + '\\public\\memo\\' + memopath
  let ext = "." + file.mimetype.split("/")[1]
  path = path + '' + file.originalname
  if (!fs.existsSync(path)) {
   cb(null, file.originalname)
  } else {
   fs.unlinkSync(path)
   cb(null, file.originalname)
  }
 }
})
var memoattach = multer({
 storage: storage
})
module.exports = memoattach