module.exports = (app, router, upload) => {
 const memoFileControllers = require(__basedir+'/app/controllers/memoattach.controller.js')
	
	router.use((req,res,next) => {
		next()
 })
 app.post('/fileuploadmemo', upload.single("file"), memoFileControllers.uploadFile)
}