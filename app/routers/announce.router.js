const con = require(__basedir+'/bin/mysql')
module.exports = (app, router,upload) => {

 router.use((req,res,next) => {
  next()
 })

 app.post('/upload/createannounce',upload.single('note_file'),async function(req,res,next) {
  let now = new Date()
  let file = req.file
  let body = req.body
  let path = file.path.match(/(\\public)(.*)/g)[0]
  console.log()
  await con.q("INSERT INTO notice_data (note_title,note_desc,note_create,note_file) VALUES (?,?,?,?)",[body.note_title,body.note_desc,now,path])
  res.redirect('/')
 })
}