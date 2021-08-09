const con = require(__basedir+'/bin/mysql')
const pdf = require('pdf-poppler');
const path = require('path');
const noticeController = require('../controllers/notice.controller')
module.exports = (app, router,upload) => {

 router.use((req,res,next) => {
  next()
 })

 app.post('/upload/createannounce',upload.single('note_file'),async function(req,res,next) {
  let now = new Date()
  let file = req.file
  let body = req.body
  let path = file.path.match(/(\\public)(.*)/g)[0]
  file.ext = file.path.split('.').pop();
  console.log(file)
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
   if (file.ext == 'pdf') {
    let opts = {
     format: 'jpeg',
     out_dir: file.destination,
     out_prefix: file.originalname.split('.')[0],
     page: null
    }
    pdf.convert(file.path, opts).then(result => {
      pdf.info(file.path).then(pdfinfo => {
       for (i=1;i<=pdfinfo.pages;i++) {
        let img = file.destination + '' + file.originalname.split('.')[0] + '-' + i + '.jpg'
        console.log(img)
        data = `imageFile=${img}&message=test`
        noticeController.lineSend(url,data,config)
       }
      });
     })
     .catch(error => {
      console.error(error);
    })
   }
  }
  await con.q("INSERT INTO notice_data (note_title,note_desc,note_create,note_file) VALUES (?,?,?,?)",[body.note_title,body.note_desc,now,path])
  res.redirect('/')
 })
}