exports.uploadForm = (req, res) => {
    var log = require(__basedir+'/bin/logger')
	var data = {
        file: req.file,
        lartype: req.body.larType,
        username: req.body.username,
        dataid: req.body.dataid,
        start: req.body.start,
        ext: req.body.ext
    }
    // log applicationForm
	log.logger('info',data.username+' Upload attachment: '+data.file.filename+' file')
	res.send(data)
}