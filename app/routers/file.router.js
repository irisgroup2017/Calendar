module.exports = (app, router, upload) => {
	const fileController = require('../controllers/file.controller')
	
	router.use((req,res,next) => {
		next()
	})
	app.post('/upload/dailyfile',upload.single('file'),fileController.uploadDaily)
 app.post('/upload/file',upload.single('file'),fileController.uploadFile)
}