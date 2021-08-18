const multer  = require('multer')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
     let paths = path.join(__basedir,'\\public\\files\\')
     if (!fs.existsSync(paths)) {
      fs.mkdirSync(paths)
     }
     cb(null, paths)
    },
    filename: function (req, file, cb) {
     let ext = paths.extname(file.originalname)
     let name = moment() +''+ ext
     let paths = path.join(__basedir,'\\public\\files\\',name)
     if (!fs.existsSync(paths)) {
      cb(null, file.originalname)
     }
     else {
      fs.unlinkSync(paths)
      cb(null, file.originalname) 
     }
    }
})
var upload = multer({ storage: storage })
module.exports = upload