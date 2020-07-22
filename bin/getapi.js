const axios = require('axios');
const host = "http://"+process.env.DB_HOST +":"+ process.env.PORT_API
exports.getAll = getAll
exports.post = post
exports.get = get

async function getAll(url) {
 url = host +''+ url
 let response
 try {
   response = await axios.get(url);
 } catch (error) {
   console.error(error);
 }
 return response
}

async function get(url,data) {
 url = host +''+ url
 let response
 try {
   response = await axios({
    method: 'GET',
    baseURL: url,
    responseType: 'json',
    data: data
   })
 } catch (error) {
   console.error(error);
 }
 return response.data
}

async function post(url,data) {
 url = host +''+ url
 axios.post(url,data)
 .then(function (response) {
  console.log(response);
 })
 .catch(function (error) {
   console.log(error);
 })
}