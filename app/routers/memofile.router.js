module.exports = (app, router, upload) => {
 const memoFileControllers = require('../controllers/memoattach.controller')
	
	router.use((req,res,next) => {
		next()
 })
 app.post('/fileuploadmemo', upload.single("file"), memoFileControllers.uploadFile)
}