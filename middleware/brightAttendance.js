const XLSX = require('xlsx')
const moment = require('moment')
const formidable = require('formidable');

const controller = async (req, res, next) => {
  const form = new formidable.IncomingForm();
  await new Promise((resolve, reject) => {
    form.parse(req,async (err, fields, files) => {
      if (err) reject(err.message)
      const f = Object.entries(files)[0][1];
      if (f == undefined) reject("Please upload an excel file!")
      let path = f.filepath;
      const workbook = XLSX.readFile(path,{
        type: "buffer",
        //sheetRows: 140,
        cellDates: true,
        sheets: 'data'
      });
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets['data'], { header: ["id","date","name"]})
      resolve(worksheet)
    })
  }).then(response => {
    req.body.response = response
    next()
  }).catch(error => {
    res.status(500).send({
      message: error,
    });
  })
}

//id , date , name , in , out , working hours , ot , late ,shift wages
const generateExcel = async (req,res,next) => {
  let workBook = XLSX.utils.book_new();
  let workSheet
  let sheetname
  let sheetData = [['id','date','name','in','out','working hours','ot (hours)','late','shift wages']]
  workBook.Props = {
    Title: "สรุปข้อมูลการเข้างานโรงงาน",
    Subject: "สรุปข้อมูลการเข้างานโรงงาน",
    CreatedDate: new Date()
  }
  let data = req.body.response
  let worktime,row,info,attend = 0
  let result = []
  rows: 
    for (i=1;i<=data.length;i++) {
      if (typeof data[i] == "object") { 
        data[i].date = moment(data[i].date).set({ second:0,millisecond:0 })
      }
      row = data[i]
      lastrow = data[i-1]
      nextrow = data[i+1]
      if (typeof row == "undefined" || typeof lastrow == "undefined" || typeof nextrow == "undefined") continue rows
      row.index = i+1

      if (attend == 1 && row.id != info.id) {
        info = checkblank(info)
        result.push(info)
        sheetData.push([info.id,info.date,info.name,info.in,info.out,info.worktime,info.ot,info.late,(info.night ? 'yes' : 'no')])
        workSheet = XLSX.utils.aoa_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(workBook, workSheet,info.name)
        delete info
        sheetData = [['id','date','name','in','out','working hours','ot (hours)','late','shift wages']]

        worktime = getShift(row.id,row.date,0)
        info = checkin(row,worktime)
        info.indexin = i+1
        continue rows
      }

      if (attend == 0 || row.id != lastrow.id) {
        worktime = getShift(row.id,row.date,0)
        info = checkin(row,worktime)
        info.indexin = i+1
        attend = 1
        continue rows
      }

      if (nextrow.id != row.id) {
        if (attend == 1) {
          info = checkout(row,info)
          info.indexout = i+1
          result.push(info)
          sheetData.push([info.id,info.date,info.name,info.in,info.out,info.worktime,info.ot,info.late,(info.night ? 'yes' : 'no')])
          workSheet = XLSX.utils.aoa_to_sheet(sheetData)
          XLSX.utils.book_append_sheet(workBook, workSheet,info.name)
          delete info
          sheetData = [['id','date','name','in','out','working hours','ot (hours)','late','shift wages']]
        }
        attend = 0
        continue rows
      }
      let condition = determind(row,nextrow,info)
      if (condition == null) {
        info = checkblank(info)
        result.push(info)
        sheetData.push([info.id,info.date,info.name,info.in,info.out,info.worktime,info.ot,info.late,(info.night ? 'yes' : 'no')])
        delete info

        worktime = getShift(row.id,row.date,0)
        info = checkin(row,worktime)
        info.indexin = i+1
        attend = 1
        continue rows
      }
      if (condition) {
        info = checkout(row,info)
        info.indexout = i+1
        result.push(info)
        sheetData.push([info.id,info.date,info.name,info.in,info.out,info.worktime,info.ot,info.late,(info.night ? 'yes' : 'no')])
        delete info
        attend = 0
        continue rows
      }
    }
    XLSX.writeFile(workBook, "./sample.xlsx");
    req.body.result = result
  /*
  await new Promise((resolve, reject) => {

  })
  */
 next()
}

const checkin = (row,worktime) => {
  return {
    savetime: moment(row.date),
    id: row.id,
    name: row.name,
    date: moment(row.date).format("DD/MM/YYYY"),
    in: moment(row.date).format("HH:mm"),
    guessRange: worktime,
    night: (worktime[0] == 19 && worktime[1] == 4 ? true : false)
  }
}

const checkout = (row,info) => {
  let late = getOver(info.guessRange[0],info.savetime,false)
  let ot = getOt(info.savetime,row.date)
  info.out = moment(row.date).format("HH:mm")
  info.late = calLate(late)
  info.ot = calOt(ot)
  info.worktime = calOt(moment(row.date).diff(moment(info.savetime)))
  delete info.savetime
  return info
}

const checkblank = (info) => {
  let late = getOver(info.guessRange[0],info.savetime,false)
  info.out = 'ไม่แสกน'
  info.late = calLate(late)
  delete info.savetime
  return info
}

const determind = (row,nextrow,info) => {
  let checkin = moment(info.savetime)
  let thisdate = moment(row.date)
  let nextdate = moment(nextrow.date)
  let enddate = moment(info.savetime).add(9,'h')
    
  if (thisdate < enddate && nextdate > enddate && nextdate.diff(thisdate) < 288E5) return false //1
  if (thisdate < enddate && nextdate.diff(checkin) > 36E6) return true //2
  if (thisdate.diff(enddate) < 72E5 && nextdate.diff(enddate) <= 72E5) return false
  if (thisdate.diff(enddate) < 72E5 && Math.abs(thisdate.diff(checkin)) < 72E5 && nextdate.diff(thisdate) > 252E5) return true
  if (thisdate.diff(checkin) > 72E6 && (row.index - info.indexin) == 1) return null
  return true
}

const calLate = (time) => {
  if (time < 0) return '0 นาที'
  return `${Math.floor(time /1000 /60)} นาที`
}

const calOt = (time) => {
  if (time < 0) return 'ไม่มี'
  let h = Math.floor(time /1000 /60 /60)
  let m = Math.floor((((time /1000 /60 /60) - h) * 60))
  return `${h}.${m.toString().padStart(2, '0')}`
}

const response = async (req,res) => {
  res.json(req.body.result)
  //res.download()
}

const getShift = (id,date,attend) => {
  let time = shift[id]
  if (time == null) {
    let match = closest([[7,19],[16,4]][attend],parseInt(moment(date).format('HH.mm')))
    time = (match == 7 || match == 16 ? [7,16] : [19,4])
  }
  return time
}

const getOver = (time,attend,night) => {
  let date = moment(attend).add((night ? 1 : 0),'d').format("DD-MM-YYYY")
  let basetime = moment(`${date} ${time}`,"DD-MM-YYYY H")
  return moment(attend).diff(basetime)
}

const getOt = (timeIn,timeOut) => {
  let difference = moment(timeOut).diff(moment(timeIn))
  return (difference >= 324E5 ? difference - 324E5 : 0)
}

const shift = {
  2019592: [8,17],
  2013119: [8,17],
  2013029: [8,17],
  2017454: [8,17],
  2013042: null,
  2020606: [8,17],
  2020609: null,
  2020610: null,
  2020611: null,
  2020613: [8,17],
  2020614: null,
  2020615: [8,17],
  2021617: null,
  2021618: [8,17],
  2021621: null,
  2021622: [8,17],
  2018487: [8,17],
  2017449: null,
  2013230: null,
  2022623: [8,17],
  2022624: [7,16],
  2022625: [8,17]
}

const closest = (range,need) => range.reduce((a,b) => { return (Math.abs(b - need) < Math.abs(a - need) ? b : a) })

/*
1.สรุป เวลา เข้างานแต่ละวัน
 • ออฟฟิส 8.00 - 17.00
 • กะเช้า 7.00 - 16.00  OT: 16.00 - 19.00
 • กะดึก 19.00 - 04.00 OT: 04.00 - 07.00 (+20 บาท)
2.สาย 5 นาที หักเงิน
*/

module.exports = {
    controller,
    generateExcel,
    response
}