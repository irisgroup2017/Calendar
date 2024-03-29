const express = require('express')
const router = express.Router()
const con = require('../bin/mysql')
const moment = require('moment')
const logger = require('../bin/logger')

router.get('/', async function(req, res, next) {
 let option = {
  userName: req.cookies.user_name,
  dataid: req.cookies.user_dataid,
  dataop: req.cookies.user_op,
  mail: req.cookies.user_mail,
  timeStart: req.query.start,
  timeEnd: req.query.end
 }
 reportTime(req,res,option)
})

router.get('/user', async function(req, res, next) {
 let option = {
  //userName: req.cookies.user_name,
  dataid: req.query.dataid,
  timeStart: req.query.start,
  timeEnd: req.query.end
 }
 reportTime(req,res,option)
})

module.exports = router

async function reportTime(req,res,opt) {
 let userName = opt.userName
 let dataid = opt.dataid
 let timeStart = opt.timeStart
 let timeEnd = opt.timeEnd
 if (dataid && timeStart && timeEnd) {
  let table = "em" + dataid.toString()
  let tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
  if (tableexist) {
   let larstart = dateconvert.add7unixs(timeStart)
   let larend = dateconvert.add7unixs(timeEnd)
   let vacationstart = dateconvert.add7unixms(timeStart)
   let vacationend = dateconvert.add7unixms(timeEnd)
   let privacy = await con.q('SELECT wplace,swtime,ewtime,cdate FROM privacy_data WHERE dataid = ?',[dataid])
   let wplace = privacy[0].wplace
   let vacationquery = 'SELECT dtitle,'+(wplace == 1 ? "doffice" : "dsite")+' AS time FROM vacation_list WHERE '+(wplace == 1 ? "doffice" : "dsite")+' BETWEEN ? AND ?'
   let vacationlist = await con.q(vacationquery,[vacationstart,vacationend])
   vacationlist = vacationlist.reduce((acc,it) => (acc[dateconvert.changeformat(it.time/1000)] = it,acc),{})
   let larlist = await con.q('SELECT d.title,d.className,t.type_title lartype,d.start,d.end,d.swapDate,d.allDay FROM lar_data AS d JOIN lar_type AS t ON d.type_id = t.type_id WHERE dataid = ? AND d.approve > 2 AND ((d.start BETWEEN ? AND ?) OR (d.end BETWEEN ? AND ?))',[dataid,larstart,larend,larstart,larend])
   let datelist = datetodate(timeStart,timeEnd)
   let result = (await con.q('SELECT emid,depart,jobPos FROM user_data WHERE dataid = ?',[dataid]))[0]
   let inc = ['0','6']

   parms = {
    title: 'รายงานแสดงเวลาของพนักงาน',
    username: userName,
    dataid: dataid,
    emid: result.emid,
    depart: result.depart,
    job: result.jobPos,
    datestart: dateconvert.thformat(timeStart),
    dateend: dateconvert.thformat(timeEnd),
    datelist: datelist,
    dateshow: datelist.map(x => dateconvert.thformat(x)),
    dateday: datelist.filter(day => inc.includes(moment(day,"YYYY-MM-DD").format('d'))).reduce((acc,it) => (acc[it] = moment(it,"YYYY-MM-DD").locale('th').format('dddd'),acc),{})
   }
   query = 'SELECT DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.timestart,u.timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM '+table+' AS u JOIN machine_data AS ms on u.MachCodeStart = ms.MachCode JOIN machine_data AS me on u.MachCodeEnd = me.MachCode WHERE (date BETWEEN ? AND ?)'
   let manualScan = await con.q('SELECT status,comment,DATE_FORMAT(u.date,"%Y-%m-%d") AS date,u.stime AS timestart,u.etime AS timeend,ms.MachShort AS mstart,me.MachShort AS mend FROM inoutchange_data AS u JOIN machine_data AS ms on u.placein = ms.MachCode JOIN machine_data AS me on u.placeout = me.MachCode where dataid = ? AND status = 1  AND (date BETWEEN ? AND ?)',[dataid,timeStart,timeEnd])
   let fingerScan = await con.q(query,[timeStart,timeEnd])
   result = [...fingerScan,...manualScan]
   let timeScan = {}
   result.map(it => {
    if (it.timestart == "00:00:00") {
     delete it.timestart
     delete it.mstart
     if (it.status) {
      it.onlyStart = 1
     }
    } else if (it.timeend == "00:00:00") {
     delete it.timeend
     delete it.mend
     if (it.status) {
      it.onlyEnd = 1
     }
    }
    if (!it.onlyStart && !it.onlyEnd && it.status) {
     it.bothManual = 1
    }
    timeScan[it.date] = Object.assign(timeScan[it.date] || {
     date: it.date,
     timestart: '00:00:00',
     timeend: '00:00:00',
     mstart: 'None',
     mend: 'None'
    } ,it)
   })
   parms.fingerscan = timeScan
   parms.vacation = vacationlist
   //count lar
   parms.countLar = (larlist ? larlist.length : 0)
   parms.sumLar = larlist.reduce((acc,it) => {
    if (it.allDay) {
     if (it.end) {
      return acc + parseInt(moment(it.start*1000).diff(moment(it.end*1000)))
     } else { 
      return acc + 86400000 
     }
    } else {
        if (it.end) { 
            return acc + parseInt(moment(it.start*1000).diff(moment(it.end*1000)))
        }
    }
   },0)

   //select change time
   parms.dateLate = {}
   parms.entryLate = 0
   parms.countLate = 0
   parms.dateOut = {}
   parms.entryOut = 0
   parms.countOut = 0
   let change = await con.q('SELECT * FROM change_worktime WHERE dataid = ? AND changetime BETWEEN ? AND ? ORDER BY changetime ASC',[dataid,timeStart,timeEnd])

   //check
   Object.keys(timeScan).map(dateScan => {
    //console.log(change.length)
    if (change.length) {
        //console.log('change')
        for (const ctime of change) {
            let scanCheck = ((moment(ctime.changetime).diff(moment(dateScan,'YYYY-MM-DD')) > 0) ? ctime.oldstime : false)
            if (scanCheck) {
                let timeDiff = moment(scanCheck,'HH:mm:ss').diff(moment(timeScan[dateScan].timestart,'HH:mm:ss'))
                if (timeDiff > 0) {
                    parms.dateLate[dateScan] = moment.duration(timeDiff).format("mm")
                    parms.entryLate = (typeof parms.entryLate == 'number' ? parms.entryLate : 0) + timeDiff
                    parms.countLate++
                }
            }
        }
    } else {
        let timeDiff = moment(timeScan[dateScan].timestart,'HH:mm:ss').diff(moment(privacy[0].swtime,'HH:mm:ss'))
        let endDiff = moment(privacy[0].ewtime,'HH:mm:ss').diff(moment(timeScan[dateScan].timeend,'HH:mm:ss'))
        if (timeDiff > 0) {
            parms.dateLate[dateScan] = moment.duration(timeDiff).format("m นาที")
            parms.entryLate = (typeof parms.entryLate == 'number' ? parms.entryLate : 0) + timeDiff
            parms.countLate++
        }
        if (endDiff > 0) {
            parms.dateOut[dateScan] = moment.duration(endDiff).format("m นาที")
            parms.entryOut = (typeof parms.entryOut == 'number' ? parms.entryOut : 0) + endDiff
            parms.countOut++
        }
    }
   })

   //save
   parms.entryLate = moment.utc(parms.entryLate).format("HH:mm").split(':')
   parms.sumLar = moment.utc(parms.sumLar).format("D:HH:m").split(':')
   let lartype = {}
   larlist.map((it) => {
    lartype[dateconvert.changeformatsubtract(it.start)] = {
     lartype: (it.lartype == "ลาอื่นๆ" ? it.title : it.lartype) +""+(it.lartype == "ลาสลับวันหยุด" ? "กับวันที่ "+ dateconvert.unixthformat(it.swapDate)+" ": "") +""+ (it.allDay ? " (ทั้งวัน)" : " ("+dateconvert.durationhours((it.end-it.start)*1000)+" ชั่วโมง)")
    }
    if (it.end) {
     let dur = Math.floor(dateconvert.durationdays(it.end-it.start)*1000)
     if (dur > 1) {
      let i=1
      while (i<dur) {
       lartype[dateconvert.adddaychangeformatsubtract(it.start,i++)] = {
        lartype: (it.lartype == "ลาอื่นๆ" ? it.title : it.lartype) +""+(it.lartype == "ลาสลับวันหยุด" ? "กับวันที่ "+ dateconvert.unixthformat(it.swapDate)+" ": "") +""+ (it.allDay ? " (ทั้งวัน)" : " ("+dateconvert.durationhours((it.end-it.start)*1000)+" ชั่วโมง)")
       }
      }
     }
    }
   })
   parms.lartype = lartype
   res.render('reporttime', parms)
  }
 } else { res.redirect('/') }
} 

function datetodate(datestart,dateend) {
 let result = []
 let i = 1
 let date = datestart
 while (date != dateend) {
  result.push(date)
  date = moment(datestart,"YYYY-MM-DD").add(i++,'days').format('YYYY-MM-DD')
 }
 result.push(date)
 return result
}

let dateconvert = {
 add7unixs: function(date) {
  return moment(date,"YYYY-MM-DD").add(7,'hours').unix()
 },
 add7unixms: function(date) {
  return moment(date,"YYYY-MM-DD").add(7,'hours').valueOf()
 },
 thformat: function(date) {
  return moment(date,"YYYY-MM-DD").locale("th").format('DD MMM YYYY')
 },
 unixthformat: function(date) {
  return moment.unix(date,"YYYY-MM-DD").locale("th").format('DD MMM YYYY')
 },
 changeformatsubtract: function(date) {
  return moment.unix(date).subtract(7,'hours').format('YYYY-MM-DD')
 },
 changeformat: function(date) {
  return moment.unix(date).format('YYYY-MM-DD')
 },
 durationhours: function(date) {
  return moment.duration(date).asHours()
 },
 durationdays: function(date) {
  return moment.duration(date).asDays()
 },
 adddaychangeformat: function(date,day) {
  return moment.unix(date).add(day,"days").format('YYYY-MM-DD')
 },
 adddaychangeformatsubtract: function(date,day) {
  return moment.unix(date).add(day,"days").subtract(7,'hours').format('YYYY-MM-DD')
 },
 thday: function(date) {
  return moment(date,"YYYY-MM-DD").locale("th").format('dddd')
 }
}