var multer  = require('multer')
var fs = require('fs')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = __basedir + '/public/memo/'
        if (!fs.existsSync(path)){
            fs.mkdirSync(path)
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        var path = __basedir + '/public/memo/'
        //if (file.mimetype == "application/pdf") { ext = '.pdf' } else { ext = '.jpg' }
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
var memoattach = multer({ storage: storage })
module.exports = memoattach