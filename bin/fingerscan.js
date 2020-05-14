const log = require('../bin/logger')
const ADODB = require('node-adodb')
const fs = require('fs')

async function fingerToJSON() {
 let userlist = await con.q('SELECT dataid,emid FROM user_data WHERE status = ?',[1])
 for (const id of userlist) {
  let ID = id.dataid
  let emid = id.emid
  //let stime = "#3/21/2020#"
  //let etime = "#4/20/2020#"
  ADODB.debug = true
  let mdb = ADODB.open('Provider=Microsoft.Jet.OLEDB.4.0;Data Source=Z:\\DB_FingerScan.mdb;',false)
  let timelist = await mdb.query("SELECT TimeInout FROM FCT_TimeFinger WHERE PersonCardID = '"+emid+"'")
  //let timelist = await mdb.query("SELECT TimeInout FROM FCT_TimeFinger WHERE (PersonCardID = '"+emid+"' AND ((TimeInout) Between "+stime+" And "+etime+"))")
  if (timelist != undefined) {
   let dateInfo = {}
   for (const time of timelist) {
   let dateFormat = time.TimeInout
   let dateSplit = dateFormat.split("T")
   let date = dateSolve(dateSplit)
   let obj = date.y +"-"+ date.mo +"-"+ date.d
   let ti = date.h+":"+date.mi
   if (dateInfo[obj]) {
    dateInfo[obj].end = ti
   } else {
    dateInfo[obj] = {}
    if (parseInt(date.h) > 13) {
     dateInfo[obj].end = ti
    } else {
     dateInfo[obj].start = ti
    }
   }
  }
  let data = JSON.stringify(dateInfo)
  let filepath = __dirname+ '/fingerscan/' +ID+ '.json'
  fs.writeFileSync(filepath,data)
  }
 }
}

function dateSolve(dateSplit) {
 let date = dateSplit[0]
 let times = dateSplit[1]
 let years = parseInt(date.substring(0,4))
 let months = parseInt(date.substring(5,7))
 let days = parseInt(date.substring(8,10))
 let hours = parseInt(times.substring(0,2))+7
 let mins = parseInt(times.substring(3,5))
 if (hours > 23) {
  hours = hours - 24
  days++ 
  switch (months) {
   case 1:
   case 3:
   case 5:
   case 7:
   case 8:
   case 10:
   case 12:
    if (days > 31) { 
     days = days - 31
     months++
     if (months > 12) {
      months = months - 12 
      years++
     }
    }
    break
   case 4:
   case 6:
   case 9:
   case 11:
    if (days > 30) { 
     days = days - 30
     months++
    }
    break
   case 2:
    if ((years % 4) == 0) {
     if (days > 29 ) {
      days = days - 29
      months++
     }
    } else {
     if (days > 28) {
      days = days - 28
      months++
     }
    }
    break
  }
 }
 months = (months < 10  ? "0"+months.toString() : months)
 days = (days < 10  ? "0"+days.toString() : days)
 hours = (hours < 10  ? "0"+hours.toString() : hours)
 mins = (mins < 10  ? "0"+mins.toString() : mins)
 return { y:years,mo:months,d:days,h:hours,mi:mins }
}

exports.fingerToJSON = fingerToJSON