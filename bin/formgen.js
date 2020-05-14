const excelform = require('./formgen/excel')
const wordform = require('./formgen/word')

async function prepare(id,data,res) {
 switch (id) {
  case "FM-HR-01-02":
   await excelform.gen(id,data,res)
   break
  case "FM-HR-01-04":
   await wordform.gen(id,data,res)
   break
  default:
   throw new Error('form id not found')
 }
}

exports.prepare = prepare