const con = require(__basedir+'/bin/mysql')
let noticeController = require('../controllers/notice.controller')
module.exports = (app, router,upload) => {

 router.use((req,res,next) => {
  next()
 })

 app.post('/upload/createannounce',upload.single('note_file'),async function(req,res,next) {
  let now = new Date()
  let file = req.file
  let body = req.body
  let path = file.path.match(/(\\public)(.*)/g)[0]
  console.log(file)
  console.log(body)
  if (body.note_mail) {
   let message = {
    from: process.env.USERMAIL,
    to: 'all@iris.co.th',
    subject: 'ประกาศข่าว/ประชาสัมพันธ์: '+ body.note_title,
    attachments: [
     {
      filename: file.originalname,
      path: file.path
     }
    ],
    text: body.note_desc
   }
   noticeController.mailSend(message)
  }
  /*
  axios.defaults.baseURL = 'https://api.example.com';
  axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
  axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
  */
  if (body.note_line) {
   let url = 'https://notify-api.line.me/api/notify'
   let itchannel = 'Ucl7cIrUw4k5x7OHeqHKAjVZA1Vt0vx5VSbSso1RE3R'
   let data = `message=มีประกาศข่าว/ประชาสัมพันธ์ใหม่เรื่อง ${body.note_title} โปรดเข้าระบบเพื่อดูข้อมูล http://hr.iris.co.th:3000`
   let config = {
    headers: {
     'Content-type': 'application/x-www-form-urlencoded',
     Authorization: `Bearer ${itchannel}`
    }
   }
   noticeController.lineSend(url,data,config)
  }
  await con.q("INSERT INTO notice_data (note_title,note_desc,note_create,note_file) VALUES (?,?,?,?)",[body.note_title,body.note_desc,now,path])
  res.redirect('/')
 })
}