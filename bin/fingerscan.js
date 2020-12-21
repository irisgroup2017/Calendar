const log = require('../bin/logger')
const ADODB = require('node-adodb')
const fs = require('fs')
const path = require('path')
const con = require('./mysql')
const moment = require('moment')
require("dotenv").config()

async function fingerToJSON() {
 let scanDb = process.env.DB_SCAN
 let userlist = await con.q('SELECT dataid,emid FROM user_data WHERE status = ? AND depart <> ?',[1,'BRI'])
 ADODB.debug = true
 const mdb = ADODB.open(scanDb,false)
 for (const id of userlist) {
  let ID = id.dataid
  let emid = id.emid
  let table = "em"+ ID.toString()
  let datesearch,dateend,datediff

  let tableexist = await con.q("SHOW TABLES FROM calendar LIKE 'machine_data'")
  if (tableexist.length == 0) {
   await con.q('CREATE TABLE machine_data (MachID tinyint(3) PRIMARY KEY,MachCode tinyint(3),MachName varchar(100))')
   machineSearch = 0
  } else {
   machineSearch = await con.q("SELECT MAX(MachID) AS MachID FROM machine_data")
   machineSearch = (machineSearch != undefined ? machineSearch[0].MachID : 0)
  }
  let machineList = await mdb.query("SELECT MachID,MachCode,MachName FROM FCM_Machine WHERE MachID > "+machineSearch+" ORDER BY MachID ASC")
  if (machineList.length) {
   for (const [index,item] of machineList.entries()) {
    con.q('INSERT INTO machine_data VALUES (?,?,?)',[item.MachID,item.MachCode,item.MachName])
   }
  }

  tableexist = await con.q('SHOW TABLES FROM calendar LIKE ?',[table])
  if (tableexist.length == 0) {
   console.log("CREATE TABLE ID: "+ID)
   await con.q('CREATE TABLE '+table+' (date date PRIMARY KEY,timestart time,timeend time,MachCodeStart tinyint(3),MachCodeEnd tinyint(3))',[])
   datesearch = "#2000/01/01#"
  } else {
   dateend = ((await con.q('SELECT DATE_FORMAT(MAX(date), "#%Y/%m/%d#") AS date FROM '+table))[0]).date
   datesearch = moment().subtract(1,"months").format("#YYYY/MM/20#")
   datediff = moment.duration(moment(datesearch,"#YYYY/MM/DD#").diff(moment(dateend,"#YYYY/MM/DD#")))
   datesearch = (datediff.asMinutes() > 0 ? dateend : datesearch)
  }
  let timelist = await mdb.query("SELECT TimeInout,MachCode FROM FCT_TimeFinger WHERE PersonCardID = '"+emid+"' AND TimeInout > "+datesearch+" ORDER BY TimeInout ASC")
  let max = timelist.length
  if (max != 0) {
   max = max - 1
   let dateFormat,dateSplit,date,ti
   let obj = objold = start = end = pstart = pend = false
   for (const [index,time] of timelist.entries()) {
    dateFormat = time.TimeInout
    place = time.MachCode
    dateSplit = dateFormat.split("T")
    date = dateSolve(dateSplit)
    dateobj = date.y +"-"+ date.mo +"-"+ date.d
    ti = date.h+":"+date.mi
    if (!obj) {
     obj = dateobj
     objold = dateobj
    } else {
     obj = dateobj
    }
    if (objold != obj) {
     if (start || end) {
      con.q('INSERT INTO '+table+' VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE timestart=VALUES(timestart),timeend=VALUES(timeend),MachCodeStart=VALUES(MachCodeStart),MachCodeEnd=VALUES(MachCodeEnd)',[objold,start,end,pstart,pend])
      start = false
      end = false
      pstart = false
      pend = false
     }
    }
    if (start) {
     end = ti
     pend = place
    } else {
     if (parseInt(date.h) > 12) {
      end = ti
      pend = place
     } else {
      start = ti
      pstart = place
     }
    }
    objold = obj
    if (max == index) {
     con.q('INSERT INTO '+table+' VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE timestart=VALUES(timestart),timeend=VALUES(timeend),MachCodeStart=VALUES(MachCodeStart),MachCodeEnd=VALUES(MachCodeEnd)',[objold,start,end,pstart,pend])
     log.logger("info","Updated: scan time ID "+ID+" have "+index+" record")
    }
   }
  }
 }
 console.log("Complete add finger scan")
 return "ok"
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