const express = require('express')
const router = express.Router()
const log = require('../bin/logger')
const con = require('../bin/mysql')
const genForm = require('../bin/formgen')

function getForm(id) {
 switch (id.toUpperCase()) {
  case "FM-HR-01-02":
   return "แผนอัตรากำลังคน (Manpower Plan)"
  case "FM-HR-01-04":
   return "ขออัตรากำลังคน"
 }
}

router.get('/:formName', async function(req, res) {
 let dataop = req.cookies.user_op
 let userName = req.cookies.user_name
 let dataid = req.cookies.user_dataid
 let mail = req.cookies.user_mail
 let form = req.params.formName
 let formName = getForm(form)
 if (userName) {
  parms = { 
   title: form.toUpperCase()+' '+formName, 
   head1: form.toUpperCase(), 
   head2: userName,
   user: userName,
   operator: dataop,
   formname: formName
  }
 } else {
  res.redirect('/login')
 }
 res.render(form,parms)
})

router.post('/:formName',async function(req,res) {
 var formName = (req.params.formName).toUpperCase()
 genForm.prepare(formName,req.body,res)
})

module.exports = router