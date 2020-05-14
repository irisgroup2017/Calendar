var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');

var fs = require('fs');
var path = require('path');

function replaceErrors(key, value) {
 if (value instanceof Error) {
     return Object.getOwnPropertyNames(value).reduce(function(error, key) {
         error[key] = value[key];
         return error;
     }, {});
 }
 return value;
}

function errorHandler(error) {
 console.log(JSON.stringify({error: error}, replaceErrors));

 if (error.properties && error.properties.errors instanceof Array) {
     const errorMessages = error.properties.errors.map(function (error) {
         return error.properties.explanation;
     }).join("\n");
     console.log('errorMessages', errorMessages);
 }
 throw error;
}

function getName(id) {
 switch (id) {
  case "FM-HR-01-04":
   return "FM-HR-01-04 ใบขออัตรากำลังคน.docx"
 }
}

async function gen(id,data,res) {
 var filename = getName(id)
 var content = fs.readFileSync(__dirname+ '/form/' +filename, 'binary');

 var zip = new PizZip(content);
 var doc;
 try {
  doc = new Docxtemplater(zip);
 } catch(error) {
  // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
  errorHandler(error);
 }

 //set the templateVariables
 doc.setData({
  date: '30 เมษายน 2563',
  job: 'เจ้าหน้าที่ฝ่ายการตลาด',
  volumn: '27',
  cost: '30,000',
  chk_cost: 'บาท/เดือน',
  workplace: 'สำนักงานใหญ่'
 });

 try {
  // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
  doc.render()
 }
 catch (error) {
  // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
  errorHandler(error);
 }

 var buf = doc.getZip()
           .generate({type: 'nodebuffer'});

 // buf is a nodejs buffer, you can either write it to a file or do anything else with it.
 fs.writeFileSync("test1.docx", buf);
}

exports.gen = gen