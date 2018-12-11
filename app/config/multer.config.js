var multer  = require('multer')
var fs = require('fs')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var path = __basedir + '/bin/doc/' +req.body.username+ '/'
        if (!fs.existsSync(path)){
            fs.mkdirSync(path)
        }
        cb(null, path)
    },
    filename: function (req, file, cb) {
        var ext,path = __basedir + '/bin/doc/' +req.body.username+ '/'
        if (file.mimetype == "application/pdf") { ext = '.pdf' }
        else { ext = '.jpg' }
        var file = req.body.start
        path = path+''+file+''+(ext=='.jpg'?'.pdf':'.jpg')
        if (!fs.existsSync(path)){
            cb(null, file+''+ext)
        }
        else {
            fs.unlinkSync(path)
            cb(null, file+''+ext) 
        }
    }
})
var upload = multer({ storage: storage })


module.exports = upload