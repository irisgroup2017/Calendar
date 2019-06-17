module.exports = (app, router, upload) => {
	const controllers = require(__basedir+'/app/controllers/application.controller.js')
	
	router.use((req,res,next) => {
		next()
	})

	app.post('/api/upload/application', upload.single("file"), controllers.uploadForm)
}