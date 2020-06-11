const log = require('../bin/logger')
const ADODB = require('node-adodb')
const fs = require('fs')
const path = require('path')
const con = require('./mysql')

async function fingerToJSON() {
 let userlist = await con.q('SELECT dataid,emid FROM user_data WHERE status = ?',[1])
 //let dbfile = path.join(__basedir,"DB_FingerScan.mdb").replace(/\\/g,"\\\\")
 ADODB.debug = true
 const mdb = ADODB.open("Provider=Microsoft.Jet.OLEDB.4.0;Data Source='D:\\clone\\Calendar\\DB_FingerScan.mdb';",false)
 for (const id of userlist) {
  let ID = id.dataid
  let emid = id.emid
  let table = "em"+ ID.toString()
  let datesearch
  let tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
  if (!tableexist) { 
   await con.q('CREATE TABLE '+table+' (date date PRIMARY KEY,timestart time,timeend time)')
   datesearch = "#01/01/2000#"
  } else {
   datesearch = await con.q('SELECT DATE_FORMAT(MAX(date), "#%d/%m/%Y#") AS date FROM '+table,"")
   datesearch = (datesearch ? datesearch.date : "#01/01/2000#")
   console.log(datesearch)
  }
  //let stime = "#3/21/2020#"
  //let etime = "#4/20/2020#"
  //TimeInout 19/9/2016 22:18:00
  let timelist = await mdb.query("SELECT TimeInout FROM FCT_TimeFinger WHERE PersonCardID = '"+emid+"' AND TimeInout > '"+datesearch+"'")
  //let timelist = await mdb.query("SELECT TimeInout FROM FCT_TimeFinger WHERE (PersonCardID = '"+emid+"' AND ((TimeInout) Between "+stime+" And "+etime+"))")
  log.logger('info',timelist)
  /*
  if (timelist != undefined) {
   let dateInfo = {}
   let dateFormat,dateSplit,date,obj,objold,ti,start,end
   for (const time of timelist) {
    dateFormat = time.TimeInout
    dateSplit = dateFormat.split("T")
    date = dateSolve(dateSplit)
    obj = date.y +"-"+ date.mo +"-"+ date.d
    ti = date.h+":"+date.mi

    if (oldobj != obj) {
     con.q('INSERT INTO')
    }
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
   objold = obj
  }
  let data = JSON.stringify(dateInfo)
  let filepath = __dirname+ '\\fingerscan\\' +ID+ '.json'
  fs.writeFileSync(filepath,data,{ flag: "w" })
  }*/
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