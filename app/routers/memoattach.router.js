module.exports = (app, router, upload) => {
 const memoControllers = require('../controllers/memoattach.controller')
	
	router.use((req,res,next) => {
		next()
	})
 app.post('/attachment', upload.single("file"), memoControllers.uploadForm)
}