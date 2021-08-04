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

function convertSecToDate(sec) {
 this.day = this.hour = this.minute = 0
 this.sec = parseInt(sec) || 0
 const day = () => {
  if (this.sec >= 28800) {
   this.day = Math.round(this.sec / 28800) + ' วัน '
   this.sec %= 28800;
  }
  return this.day || ''
 }
 const hour = () => {
  if (this.sec >= 3600) {
   this.hour = Math.round(this.sec / 3600) +' ชั่วโมง '
   this.sec %= 3600;
  }
  return this.hour || ''
 }
 const minute = () => {
  if (this.sec >= 60) {
   this.minute = Math.round(this.sec / 60) +' นาที'
   this.sec %= 60;
  }
  return this.minute || ''
 }
 let dateString = day() + hour() + minute()
 return (dateString == '' ? '-' : dateString)
}

async function viewLar(dataid, thisday) {
 let a = new Date(parseInt(thisday))
 let b = []
 result = (await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?', [dataid, a.getFullYear()]))[0]
 type = (await con.q('SELECT * FROM lar_type')).reduce((acc,it) => (acc[it.type_key] = it,acc),{})
 lle.map(it => {
  let ans = {
   a: type[it].type_title,
   c: convertSecToDate(result[it+'d']),
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
 ds = getDateValue(inTime)
 if (allDay) {
  if (outTime) { // more days
   de = getDateValue(outTime)
   gDay = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
   de.dy = gDay[(gDay.indexOf(de.dy) - 1 < 0 ? 6 : gDay.indexOf(de.dy) - 1)]
   dStart = returnDate(ds.y, ds.mo, ds.dy, ds.da, 'ทั้งวัน')
   dEnd = returnDate(de.y, de.mo, de.dy, de.da - 1)
   if (ds.mo == de.mo) {
    dlength = (de.da - ds.da) + " วัน"
   } else {
    j = getMonthFromString(ds.mo)
    k = getMonthFromString(de.mo)
    for (i = j; i <= k; i++) {
     if (i == j) {
      dlength = getDaysInMonth(i, ds.y) - ds.da
     } else if (i == k) {
      dlength += de.da
     } else {
      dlength += getDaysInMonth(i, ds.y)
     }
    }
    dlength = dlength + ' วัน'
   }
  } else { // all 1 day
   dStart = returnDate(ds.y, ds.mo, ds.dy, ds.da, 'ทั้งวัน')
   dEnd = returnDate(ds.y, ds.mo, ds.dy, ds.da)
   dlength = 1 + " วัน"
  }
 } else {
  if (outTime) { // 1 day fix
   de = getDateValue(outTime)
   var miTime = 0,
    sTime = 0,
    eTime = 0,
    dStart = returnDate(ds.y, ds.mo, ds.dy, ds.da, ds.h + ':' + ds.mi),
    dEnd = returnDate(de.y, de.mo, de.dy, de.da, de.h + ':' + de.mi)
   if (de.da - ds.da == 0) {
    sTime = parseInt(ds.h + '.' + ds.mi)
    eTime = parseInt(de.h + '.' + de.mi)
    if ((((de.h - ds.h) > 6) && (de.h - ds.h) % 4) >= 1) {
     minush = 1
    } else {
     minush = 0
    }
    if (de.mi - ds.mi != 0) {
     miTime = 30
    }
    if (miTime && (de.mi - ds.mi) < 30) {
     minush = 1
    }
    dlength = eTime - sTime - minush + ' ชั่วโมง ' + (miTime == 0 ? "" : miTime + ' นาที')
   } else {
    sTime = ds.h + '.' + ds.mi
    eTime = de.h + '.' + de.mi
    if ((((de.h - ds.h) > 6) && (de.h - ds.h) % 4) >= 1) {
     minush = 1
    } else {
     minush = 0
    }
    dlength = de.da - ds.da + ' วัน ' + eTime - sTime - minush + ' ชั่วโมง'
   }
  }
 }
 return {
  dateStart: dStart.date,
  dateEnd: dEnd.date,
  timeStart: dStart.time,
  timeEnd: dEnd.time,
  daylength: dlength
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