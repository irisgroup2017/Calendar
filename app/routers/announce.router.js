const con = require(__basedir+'/bin/mysql')
//const pdf = require('pdf-poppler');
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
  let desc = body.note_desc || ""
  file.ext = file.path.split('.').pop();
  await con.q("INSERT INTO notice_data (note_title,note_desc,note_create,note_file) VALUES (?,?,?,?)",[body.note_title,desc,now,path])
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
  if (body.note_line) {
   let url = 'https://notify-api.line.me/api/notify'
   let channel = 'DdTAgy4JXyFNQw1eNn0jIRDS2pmzEyFBZhuoJ0Snu7p' // IRIS GROUP announce
   //let channel = 'PUlSsHV1lRlYHAvz5Db2GOwBQEMiA552iaTTCoNSXm5' //TEST GROUP
   //let itchannel = 'Ucl7cIrUw4k5x7OHeqHKAjVZA1Vt0vx5VSbSso1RE3R' //IT
   let data = { 
    message: `\nเรื่อง ${body.note_title} \nโปรดเข้าระบบเพื่อดูข้อมูล http://hr.iris.co.th:3000`
   }
   let config = {
    headers: {
     'Content-type': 'application/x-www-form-urlencoded',
     Authorization: `Bearer ${channel}`
    }
   }
   noticeController.lineSend(url,data,config)
  }
  res.redirect('/')
 })
}

/*
   if (file.ext == 'pdf') {
    let opts = {
     format: 'jpeg',
     out_dir: file.destination,
     out_prefix: file.originalname.split('.')[0],
     page: null
    }
    config = {
     headers: {
      'Content-type': 'multipart/form-data',
      Authorization: `Bearer ${channel}`
     }
    }    
    pdf.convert(file.path, opts).then(result => {
      pdf.info(file.path).then(pdfinfo => {
       for (i=1;i<=pdfinfo.pages;i++) {
        let img = path.join(file.destination,file.originalname.split('.')[0]+'-'+i +'.jpg')
        data = {
         message: file.originalname+ "page" +i+'/'+pdfinfo.pages,
         imageFile: img
        }
        noticeController.lineSend(url,data,config)
       }
      });
     })
     .catch(error => {
      console.error(error);
    })
   }
   */