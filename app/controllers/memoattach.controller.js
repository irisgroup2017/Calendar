exports.uploadForm = (req, res) => {
 let log = require(__basedir+'/bin/logger')
	let data = {
        file: req.file,
        ext: req.body.ext
    }
    console.log(data)
    // log applicationForm
	log.logger('info',data.username+' Upload memo attachment: '+data.file.filename+' file')
	res.send(data)
}