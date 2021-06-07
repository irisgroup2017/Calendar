var multer  = require('multer')
var fs = require('fs')
var moment = require('moment')
var date = moment().format('YYYY-MM-DD')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = __basedir + '\\public\\announce\\' +date+ '\\'
        if (!fs.existsSync(path)){
            fs.mkdirSync(path)
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        var path = __basedir + '\\public\\doc\\' +date+ '\\'
        path = path+''+file.originalname
        if (!fs.existsSync(path)){
            cb(null, file.originalname)
        }
        else {
            fs.unlinkSync(path)
            cb(null, file.originalname) 
        }
    }
})
var upload = multer({ storage: storage })
module.exports = upload