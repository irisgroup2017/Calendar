const moment = require('moment')
var con = require('../bin/mysql')
const e = require('express')
log = require('../bin/logger')
const llt = ['ลาป่วย', 'ลากิจ', 'ลาพักร้อน', 'ลาฝึกอบรบ', 'ลาทำหมัน', 'ลาคลอด', 'ลาอุปสมบท', 'ลารับราชการทหาร'],
 lle = ['sick', 'personal', 'vacation', 'training', 'sterily', 'maternity', 'religious', 'military'],
 lld = ['sickd', 'personald', 'vacationd', 'trainingd', 'sterilyd', 'maternityd', 'religiousd', 'militaryd'],
 llr = ['sickr', 'personalr', 'vacationr', 'trainingr', 'sterilyr', 'maternityr', 'religiousr', 'militaryr']

async function getLar(userName, dataid, thisday) {
 let a = new Date(thisday)
 let b = []
 result = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?', [dataid, a.getFullYear()])
 type = (await con.q('SELECT * FROM lar_type')).reduce((acc,it) => (acc[it.type_key] = it,acc),{})

 lle.map(it => {
  let ans = {
   a: type[it],
   c: convertSecToDate(result[it]),
   d: convertSecToDate(result[it]+'d'),
   e: (result[it]+'d' < 0 ? true : false)
  }
  b.push(ans)
 })
 return b
}

function convertSecToDate(secs) {
    let d = secs / 28800 | 0;
    let H = (secs % 28800) / 3600 | 0;
    let m = (secs % 3600)  / 60 | 0;
    let t = 'วัน ,ชั่วโมง ,นาที'.split(',')
    let z = n => n.map((N,i) => (N > 0 ? `${N} ${t[i]}` : "")).join("")
    return z([d,H,m])
}

async function viewLar(dataid, thisday) {
 let a = new Date(parseInt(thisday))
 let b = []
 result = (await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?', [dataid, a.getFullYear()]))[0]
 type = (await con.q('SELECT * FROM lar_type')).reduce((acc,it) => (acc[it.type_key] = it,acc),{})
 lle.map(it => {
  let ans = {
   a: type[it].type_title,
   c: convertSecToDate(result[it+'d'] || 0),
   d: convertSecToDate(result[it+'r']),
   e: (result[it]+'r' < 0 ? true : false)
  }
  b.push(ans)
 })
 return b
}

const option = {
 object: ['วัน', 'ชั่วโมง', 'นาที'],
 unit: ['d', 'h', 'm'],
 units: {
  d: 28800,
  h: 3600,
  m: 60
 }
}

function getDuration(start, end) {
 duration = end - start
 Ans = []
 for (var i = 0; i < option.unit.length; i++) {
  unitBase = option.unit[i]
  unitValue = option.units[unitBase]
  if (unitValue <= duration) {
   Ans[unitBase] = Math.floor(duration / unitValue)
   duration = duration % unitValue
  }
 }
 return Ans
}

async function dhmtoarray(ov) {
 var lov = ov.length,
  iov = 0,
  rov
 if (lov == 1 || lov == 3 || lov == 5) {
  iov = 1
 }
 if (lov + iov == 6) {
  rov = {
   d: parseInt(ov.substring(0, 2 - iov), 10),
   h: parseInt(ov.substring(2 - iov, 4 - iov), 10),
   m: parseInt(ov.substring(4 - iov, 6 - iov), 10)
  }
 }
 if (lov + iov == 4) {
  rov = {
   h: parseInt(ov.substring(0, 2 - iov), 10),
   m: parseInt(ov.substring(2 - iov, 4 - iov), 10)
  }
 }
 if (lov + iov == 2) {
  rov = {
   m: parseInt(ov.substring(0, 2 - iov), 10)
  }
 }
 return rov
}

function displayDuration(duration) {
 var Ans = ''
 for (var i = 0; i < option.unit.length; i++) {
  unitBase = option.unit[i]
  if (duration[unitBase] > 0) {
   Ans = Ans + duration[unitBase] + ' ' + option.object[i] + ' '
  }
 }
 if (Ans == '') {
  Ans = '0 วัน'
 }
 return Ans
}

function saveDuration(duration, dataid, thisday) {
 if (duration.length > 0) {
  var query = '',
   Ans = []
  for (var d = 0; d < duration.length; d++) {
   var q = duration[d],
    qd = '',
    qr = ''
   if (query == '') {
    query = q.a + ' = ?'
   } else {
    query = query + ',' + q.a + ' = ?'
   }
   query = query + ',' + q.c + ' = ?'

   for (var i = 0; i < option.unit.length; i++) {
    unitBase = option.unit[i]
    if (q.b[unitBase] > 9) {
     qd = qd + q.b[unitBase]
    } else if (q.b[unitBase] < 10) {
     qd = qd + '0' + q.b[unitBase]
    } else {
     qd = qd + '00'
    }

    if (q.d[unitBase] > 9) {
     qr = qr + q.d[unitBase]
    } else if (q.d[unitBase] < 10) {
     qr = qr + '0' + q.d[unitBase]
    } else {
     qr = qr + '00'
    }
   }
   Ans.push(qd)
   Ans.push(qr)
  }
  Ans.push(dataid)
  Ans.push(new Date(thisday).getFullYear())
  con.q('UPDATE lar_status SET ' + query + ' WHERE dataid = ? AND year = ?', Ans)
 }
}

function plusDuration(old, new1) {
 Ans = []
 if ((new1.h % 9) == 0) {
  new1.h = new1.h - (new1.h / 9)
 }
 for (var i = 0; i < option.unit.length; i++) {
  unitBase = option.unit[i]
  if (old) {
   if (old[unitBase] != undefined && !isNaN(old[unitBase])) {
    if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) {
     Ans[unitBase] = old[unitBase] + new1[unitBase]
    } else {
     Ans[unitBase] = old[unitBase]
    }
   } else if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) {
    Ans[unitBase] = new1[unitBase]
   }
  } else if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) {
   Ans[unitBase] = new1[unitBase]
  }
 }
 if (Ans.m >= 60) {
  Ans.h = Ans.h + Math.floor(Ans.m / 60)
  Ans.m = Ans.m % 60
 }
 if (Ans.h >= 8) {
  if (Ans.d == undefined) {
   Ans.d = 0
  }
  Ans.d = Ans.d + Math.floor(Ans.h / 8)
  Ans.h = Ans.h % 8
 }
 return Ans
}
/*
gDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
	gMonth = ['January','February','March','April','May','June','July','August','September','October','November','December']

gDay = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์']
	gMonth = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม']
*/
function getDateValue(timeParse) {
 gDay = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
 gMonth = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
 if (timeParse > 99999999999) {
  timeParse = new Date(timeParse)
 } else {
  timeParse = new Date((timeParse - 25200) * 1000)
 }
 datevalues = {
  y: timeParse.getFullYear() + 543,
  mo: gMonth[timeParse.getMonth()],
  dy: gDay[timeParse.getDay()],
  da: timeParse.getDate(),
  h: timeParse.getHours(),
  mi: timeParse.getMinutes()
 }
 if (datevalues.h < 0) {
  datevalues.h = datevalues.h + 24
 }
 if (datevalues.mi < 10) {
  datevalues.mi = '0' + datevalues.mi
 }
 if (datevalues.h < 10) {
  datevalues.h = '0' + datevalues.h
 }
 return datevalues
}

function returnDate(y, mo, dy, da, sAnde) {
 return {
  date: dy + ', ' + da + ' ' + mo + ' ' + y,
  time: sAnde
 }
}

function getDaysInMonth(mo, ye) {
 return new Date(ye, mo, 0).getDate()
}

function getMonthFromString(mo) {
 return new Date(Date.parse(mo + "1, 2012")).getMonth() + 1
}

function getDayTime(inTime, outTime, allDay) {
    let times = moment.unix(inTime).subtract(7,'h')
    let timee = (outTime ? moment(outTime) : false)
    let onlyStart = !timee
    let dateS = times.locale('th').format('dddd, DD MMM YYYY')
    let dateE = (onlyStart ? times.locale('th').format('dddd, DD MMM YYYY') : (allDay ? timee.clone().subtract(1,'m').locale('th').format('dddd, DD MMM YYYY') : timee.clone().locale('th').format('dddd, DD MMM YYYY') ) )
    return {
        dateStart: dateS,
        dateEnd: dateE,
        timeStart: (allDay ? 'ทั้งวัน' : times.format('HH:mm')),
        timeEnd: (allDay || onlyStart ? '' : (dateS == dateE ? timee.format('HH:mm') : times.format('HH:mm'))),
        daylength: (onlyStart ? `1 วัน` : (dateS == dateE ? `${timee.diff(times,'h')} ชั่วโมง` : `${timee.diff(times,'d')} วัน`))
    }
}

exports.getLar = getLar
exports.plusDuration = plusDuration
exports.displayDuration = displayDuration
exports.dhmtoarray = dhmtoarray
exports.getDuration = getDuration
exports.viewLar = viewLar
exports.getDayTime = getDayTime
exports.getDateValue = getDateValue