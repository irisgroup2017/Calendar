const axios = require('axios')
require("dotenv").config()

module.exports.send = async(method,path,data) => {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + path,
  method: method,
  data: data || {}
 }
 console.log(option)
 const request = await axios(option).then(result => result)
 return await request.data
}

module.exports.get = async(path,data) => {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + path,
  method: 'GET',
  data: data || {}
 }
 console.log(option)
 const request = await axios(option).then(result => result)
 return await request.data
}

module.exports.post = async(path,data) => {
 var option = {
  baseURL: process.env.PROTOCAL+ '://' + process.env.WEB_API +':'+ process.env.PORT_API + '' + path,
  method: 'POST',
  data: data || {}
 }
 const request = await axios(option).then(result => result)
 return await request.data
}

