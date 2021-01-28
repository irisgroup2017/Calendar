const moment = require('moment')
const api = require(__basedir+'/bin/api')
const log = require(__basedir+'/bin/logger')
exports.uploadForm = (req, res) => {
	let data = {
        file: req.file,
        ext: req.body.ext
    }
    // log applicationForm
	log.logger('info',data.username+' Upload memo attachment: '+data.file.filename+' file')
	res.send(data)
}

exports.uploadFile = (req, res) => {
 let file = req.file
 let body = req.body
 let dataId = req.headers.cookie.split(";")[2].split("=")[1]
 let path = file.path.match(/(\\public)(.*)/g)[0]
 let time = moment().format("YYYY-MM-DD HH:mm:ss")
 let memo = {
  memoId: parseInt(body.memoid),
  dataId: parseInt(dataId),
  statusId: 10,
  path: path.toString(),
  originalName: file.originalname,
  time: time
 }

 api("POST","/memolog",memo)
 if (body.approve) {
  let bodies = {
   data: {
    memoStatus: 5
   },
   where: {
    memoId: parseInt(body.memoid)
   }
  }
  api("POST","/memo/update",bodies)
 }
	let data = {
        upload: 1,
        file: req.file,
        files: req.body.list
    }
    // log applicationForm
	log.logger('info',data.username+' Upload memo attachment: '+data.file.filename+' file')
	res.json(data)
}