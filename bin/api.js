const axios = require('axios')
require("dotenv").config()

async function send(method,path,data) {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + path,
  method: method,
  data: data
 }
 console.log(option)
 const request = await axios(option)
 return request.data
}

module.exports = send