const axios = require('axios')
require("dotenv").config()

module.exports.send = async(method,path,data) => {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + path,
  method: method,
  data: data || {}
 }
 const request = await axios(option).then(result => result)
 return await request.data
}

