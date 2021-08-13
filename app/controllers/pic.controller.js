const qs = require('qs');
exports.uploadPic = (req, res) => {
 let log = require(__basedir+'/bin/logger')
	let data = {
        file: req.file,
        cookies: qs.parse(req.headers.cookie.split(';').join('&').replace(/\su/ig,'u'))
        /*
        username: req.body.username,
        dataid: req.body.dataid,
        start: req.body.start,
        ext: req.body.ext*/
    }
    // log applicationForm
	//log.logger('info',data.username+' Upload attachment: '+data.file.filename+' file')
	res.send(data)
}