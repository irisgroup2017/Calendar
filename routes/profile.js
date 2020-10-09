const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const log = require('../bin/logger')
const dateFormat = require('dateformat')

function dateThai(date) {
 let day,month,year,gMonth = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
 day = date.getDate()
 month = gMonth[date.getMonth()]
 year = date.getFullYear()+543
 return day+ " " +month+ " " +year
}

router.get('/',async function(req, res) {
 var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
 parms = { title: 'ดูข้อมูล/เปลี่ยนรหัสผ่าน', head1: 'Profile' }
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
  }
  var bossname = ""
  parms.user = userName
  parms.operator = dataop
  result = (await con.q('SELECT * FROM privacy_data,contact_data,user_data WHERE user_data.dataid = ? AND privacy_data.dataid = ? AND contact_data.dataid = ?',[dataid,dataid,dataid]))[0]
  if (result.mailGroup) {
   bossname = await con.q('SELECT name,lastName FROM user_data WHERE mail = ?',[result.mailGroup])
   bossname = bossname[0].name +" "+bossname[0].lastName
  }
  parms.objs = []
  parms.objs.push({
   emid: result.emid,
   name: result.name,
   lastname: result.lastName,
   nickname: result.nickname,
   depart: result.depart,
   jobPos: result.jobPos,
   mail: result.mail,
   workplace: (result.wplace ? "ออฟฟิสใหญ่" : "หน้างาน"),
   swtime: result.swtime.substring(0,5),
   ewtime: result.ewtime.substring(0,5),
   workphone: (result.work == "-" ? "02-196-1100" +(result.ext ? " ("+ result.ext +")" : "") : result.work),
   privatephone: result.private,
   cdate: dateThai(new Date(result.cdate*1000)),
   bossname: bossname +" ("+result.mailGroup+")",
   username: result.userName,
   password: result.password.substring(0,3) + '*'.repeat(result.password.length-3)
  })
  res.render('profile', parms)
 } else {
  res.redirect("/login")
 }
})

router.post('/',async function(req,res){
    dataid = req.cookies.user_dataid
    sql = 'SELECT * FROM user_data WHERE dataid = ?'
    con.q(sql,dataid)
    .catch(err => {
        throw err
    })
    .then(result => {
        r = result[0]
        if (r.password == req.body.oldpass) {
            if (req.body.oldpass !== req.body.newpass1) {
                con.q('UPDATE user_data SET password = ? WHERE dataid = ?',[req.body.newpass1,dataid])
                log.logger('info','Change Password : '+ req.cookies.user_name)
                res.end("D")
            }
            else { res.end("SP") }
        } else { res.end("WP") }
    })
})

module.exports = router