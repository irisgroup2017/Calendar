module.exports = (app, router, upload) => {
	const controllers = require('../../app/controllers/pic.controller.js')
	
	router.use((req,res,next) => {
		next()
	})
	app.post('/upload/pic', upload.single("file"), controllers.uploadDailyPic)
}