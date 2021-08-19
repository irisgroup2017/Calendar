const axios = require('axios');
const qs = require('qs');
let irisAnnounce = 'DdTAgy4JXyFNQw1eNn0jIRDS2pmzEyFBZhuoJ0Snu7p' // IRIS GROUP announce
let irisNotify = '2xyFO5bWn4jLujNcuhv2XAG0ZRlDLxWtFKDhyjadBM5' // IRIS GROUP Notice
let testGroup = 'PUlSsHV1lRlYHAvz5Db2GOwBQEMiA552iaTTCoNSXm5' //TEST GROUP
let testIt = 'Ucl7cIrUw4k5x7OHeqHKAjVZA1Vt0vx5VSbSso1RE3R' //IT

module.exports.message = (message) => {
 let url = 'https://notify-api.line.me/api/notify'
 let data = { 
  message: message
 }
 let config = {
  headers: {
   'Content-type': 'application/x-www-form-urlencoded',
   Authorization: `Bearer ${testGroup}`
  }
 }
 linesend(url,data,config)
}

module.exports.image = (image,message) => {
 let url = 'https://notify-api.line.me/api/notify'
 let data = {
  imageFile: image,
  message: message
 }
 let config = {
  headers: {
   'Content-type': 'multipart/form-data',
   Authorization: `Bearer ${testGroup}`
  }
 }
 linesend(url,data,config)
}

async function linesend(url,data,config) {
 axios.post(url,qs.stringify(data),config).catch(function (error) {
  if (error.response) {
    console.log(error.response.data);
    console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log('Error', error.message);
  }
  console.log(error.config);
});
}