module.exports = (app, router, upload) => {
	const memoControllers = require(__basedir+'/app/controllers/memoattach.controller.js')
	
	router.use((req,res,next) => {
		next()
	})
	app.post('/attachment', upload.single("file"), memoControllers.uploadForm)
}