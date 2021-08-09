const nodemailer = require("nodemailer");
const axios = require('axios');
const qs = require('qs')

exports.mailSend = (message) => {
 let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
   user: process.env.USERMAIL,
   pass: process.env.USERPASS
  }
 })
 transporter.sendMail(message)
}

exports.lineSend = async (url,data,config) => {
 axios.post(url,qs.stringify(data),config).catch(function (error) {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error', error.message);
  }
  console.log(error.config);
});
}