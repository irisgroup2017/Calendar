const xlsx = require('excel4node')
const log = require('../logger')
const con = require('../mysql')
const Excel = require('exceljs')

async function gen(id,data,res) {
 let [filename,sheetname] = getName(id)
 let result = await dataProcess(id,data)
 let cell = result.cell
 let info = result.info
 var workbook = new Excel.Workbook()
 workbook = await workbook.xlsx.readFile(__dirname+ '/form/' +filename)
 let worksheet = workbook.getWorksheet(sheetname)
 let i = 0
 for (var key in cell) {
  if (key != "loop") {
    key = parseInt(key)
    for (var col in cell[key]) {
      let item = cell[key][col]
      worksheet.getRow(key).getCell(item).value = info.data[i++]
    }
  } else {
    for (var group in cell[key])
    col = cell[key][group]
    let row = parseInt(group)
    i = 0
    for (var loop in info[key]) {
      let item = info[key][loop]
      for (var j in col) {
        worksheet.getRow(row+i).getCell(col[j]).value = item[j]
      }
      i++
    }
  }
 }
 workbook.xlsx.writeFile("test1.xlsx")
}

function getName(id) {
 switch (id) {
  case "FM-HR-01-02":
   return ["FM-HR-01-02 แผนอัตรากำลังคน ประจำปี.xlsx","แผนอัตรากำลังคน"]
 }
}

async function dataProcess(id,data) {
 let cell,info
 switch (id) {

  case "FM-HR-01-02":
   cell = {
    1: [19],
    2: [6],
    4: [7],
    loop: {
     7: [2,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
    }
   }
   info = await fmhr0102(data)
   return {cell,info}
 }
}

function fmhr0102(data) {
 let info = {}
 let dat = data.data
 let ex = {}
 let item = ["reg-pos","reg-bud","reg-jan","reg-feb","reg-mar","reg-apr","reg-may","reg-jun","reg-jul","reg-aug","reg-sep","reg-oct","reg-nov","reg-dec","reg-cur","reg-rep","reg-inc","reg-tot"]
 dat.forEach(e => {
   let i=0
   ex[i] = []
   for (var k in e) {
    ex[i].push((i==1 ? finform(e[k]) : e[k]))
   }
   i++
 })
 info.data = ["formid",data.depart,data.bdyear]
 info.loop = ex
 return info
}

function finform(n) {
 n=n.replace(/[,|e]/g,"")
 return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
exports.gen = gen