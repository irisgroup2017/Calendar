var con = require('../bin/mysql')
const e = require('express')
log = require('../bin/logger')
const llt = ['ลาป่วย', 'ลากิจ', 'ลาพักร้อน', 'ลาฝึกอบรบ', 'ลาทำหมัน', 'ลาคลอด', 'ลาอุปสมบท', 'ลารับราชการทหาร'],
 lle = ['sick', 'personal', 'vacation', 'training', 'sterily', 'maternity', 'religious', 'military'],
 lld = ['sickd', 'personald', 'vacationd', 'trainingd', 'sterilyd', 'maternityd', 'religiousd', 'militaryd'],
 llr = ['sickr', 'personalr', 'vacationr', 'trainingr', 'sterilyr', 'maternityr', 'religiousr', 'militaryr']

async function getLar(userName, dataid, thisday) {
 a = new Date(thisday),
  LAR = [],
  start = new Date((a.getMonth() == 0 ? a.getFullYear() - 1 : a.getFullYear()), 0, 1, 7).getTime() / 1000,
  end = new Date((a.getMonth() == 0 ? a.getFullYear() - 1 : a.getFullYear()), (a.getMonth() == 0 ? 11 : a.getMonth()), (a.getMonth() == 0 ? 31 : a.getDate()), 7).getTime() / 1000,
  result = await con.q('SELECT * FROM lar_data WHERE userName = ? AND approve > 1 AND start BETWEEN ? AND ?', [userName, start, end]),
  resultr = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?', [dataid, a.getFullYear()])
 resultr = resultr[0]
 for (var i = 0; i < result.length; i++) {
  var duration = []
  if (result[i].end) {
   duration = getDuration(result[i].start, result[i].end)
  } else {
   duration.d = 1
  }
  j = result[i].className, k = result[i].title
  if (j == 'label-grey') {
   LAR.sick = (LAR.sick ? LAR.sick + 1 : 1)
   LAR.sickd = plusDuration(LAR.sickd, duration)
  } else if (j == 'label-success') {
   LAR.personal = (LAR.personal ? LAR.personal + 1 : 1)
   LAR.personald = plusDuration(LAR.personald, duration)
  } else if (j == 'label-warning') {
   LAR.vacation = (LAR.vacation ? LAR.vacation + 1 : 1)
   LAR.vacationd = plusDuration(LAR.vacationd, duration)
  } else {
   if (k == 'ลาฝึกอบรม') {
    LAR.training = (LAR.training ? LAR.training + 1 : 1)
    LAR.trainingd = plusDuration(LAR.trainingd, duration)
   } else if (k == 'ลาทำหมัน') {
    LAR.sterily = (LAR.sterily ? LAR.sterily + 1 : 1)
    LAR.sterilyd = plusDuration(LAR.sterilyd, duration)
   } else if (k == 'ลาคลอด') {
    LAR.maternity = (LAR.maternity ? LAR.maternity + 1 : 1)
    LAR.maternityd = plusDuration(LAR.meternityd, duration)
   } else if (k == 'ลาอุปสมบท') {
    LAR.religious = (LAR.religious ? LAR.religious + 1 : 1)
    LAR.religiousd = plusDuration(LAR.religiousd, duration)
   } else if (k == 'ลารับราชการทหาร') {
    LAR.military = (LAR.military ? LAR.military + 1 : 1)
    LAR.militaryd = plusDuration(LAR.militaryd, duration)
   }
  }
 }
 LAR.sickr = minusDuration(resultr[lle[0]], LAR.sickd)
 LAR.personalr = minusDuration(resultr[lle[1]], LAR.personald)
 LAR.vacationr = minusDuration(resultr[lle[2]], LAR.vacationd)
 LAR.trainingr = minusDuration(resultr[lle[3]], LAR.trainingd)
 LAR.sterilyr = minusDuration(resultr[lle[4]], LAR.sterilyd)
 LAR.maternityr = minusDuration(resultr[lle[5]], LAR.maternityd)
 LAR.religiousr = minusDuration(resultr[lle[6]], LAR.religiousd)
 LAR.militaryr = minusDuration(resultr[lle[7]], LAR.militaryd)
 if (!LAR.vacation && (resultr.vacationq != null)) {
  LAR.vacationq = await dhmtoarray(resultr.vacationq.toString())
  LAR.vacationr = plusDuration(LAR.vacationq, {
   d: resultr[lle[2]],
   h: 0,
   m: 0
  })
 } else {
  if (!LAR.vacation && (resultr.vacationp != null)) {
   LAR.vacationp = await dhmtoarray(resultr.vacationp.toString())
   LAR.vacationr = plusDuration(LAR.vacationp, {
    d: resultr[lle[2]],
    h: 0,
    m: 0
   })
  } else if (LAR.vacation && (resultr.vacationp != null)) {
   LAR.vacationp = await dhmtoarray(resultr.vacationp.toString())
   var x = plusDuration(LAR.vacationp, {
    d: resultr[lle[2]],
    h: 0,
    m: 0
   })
   LAR.vacationr = minusDuration(x, LAR.vacationd)
  }
 }
 return LAR
}
async function viewLar(userName, dataid, thisday) {
 thisday = new Date(thisday)
 var a = new Date((thisday.getMonth() == 0 ? thisday.getFullYear() - 1 : thisday.getFullYear()), (thisday.getMonth() == 0 ? 11 : thisday.getMonth()), (thisday.getMonth() == 0 ? 31 : thisday.getDate()), 7),
  LAR = await getLar(userName, dataid, a)
 LARS = [], saveLAR = []
 for (i = 0; i < llt.length; i++) {
  if (i == 4) {
   var s1, s2
   if (Number(LAR[lle[i]]) == 1) {
    s1 = '1 ครั้ง'
    s2 = '0 ครั้ง'
    LAR[llr[i]]['o'] = false
   } else if (Number(LAR[lle[i]]) > 1) {
    s1 = 'ใช้ ' + LAR[lle[i]] + ' ครั้ง'
    s2 = Number(LAR[lle[i]]) - 1 + ' ครั้ง'
    LAR[llr[i]]['o'] = true
   } else {
    s1 = '0 ครั้ง'
    s2 = '1 ครั้ง'
    LAR[llr[i]]['o'] = false
   }
  }
  if (LAR[lle[i]]) {
   saveLAR.push({
    a: lld[i],
    b: LAR[lld[i]],
    c: llr[i],
    d: LAR[llr[i]]
   })
   LARS.push({
    a: llt[i],
    b: LAR[lle[i]],
    c: (llt[i] == 'ลาทำหมัน' ? s1 : displayDuration(LAR[lld[i]])),
    d: (llt[i] == 'ลาทำหมัน' ? s2 : displayDuration(LAR[llr[i]])),
    e: LAR[llr[i]]['o']
   })
  } else {
   LARS.push({
    a: llt[i],
    b: 0,
    c: (llt[i] == 'ลาทำหมัน' ? s1 : '0 วัน'),
    d: (llt[i] == 'ลาทำหมัน' ? s2 : displayDuration(LAR[llr[i]])),
    e: LAR[llr[i]]['o']
   })
  }
 }
 saveDuration(saveLAR, dataid, a)
 return LARS
}

const option = {
 object: ['วัน', 'ชั่วโมง', 'นาที'],
 unit: ['d', 'h', 'm'],
 units: {
  d: 86400,
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

function minusDuration(remain, duration) {
 var Ans = [],
  chk = ['d', 'h', 'm']
 if (!Array.isArray(remain)) {
  remain = {
   d: Number(remain),
   h: 0,
   m: 0
  }
 }
 for (var i = 0; i < 3; i++) {
  if (duration === undefined || isNaN(duration)) {
   duration = {
    d: 0,
    h: 0,
    m: 0
   }
  }
  if (remain[chk[i]] == undefined || isNaN(remain[chk[i]])) {
   remain[chk[i]] = 0
  }
  if (duration[chk[i]] == undefined || isNaN(duration[chk[i]])) {
   duration[chk[i]] = 0
  }
  if ((remain.d == 0 && remain.h == 0 && remain.m == 0) && (duration.d > 0 || duration.h > 0 || duration.m > 0)) {
   Ans.o = true
   Ans.d = duration.d
   Ans.h = duration.h
   Ans.m = duration.m
  } else {
   if (duration.m > 0) {
    if (remain.m < duration.m) {
     if (remain.h == 0) {
      remain.d = remain.d - 1
      remain.h = 7
      remain.m = 60
     } else {
      remain.h = remain.h - 1
      remain.m = remain.m + 60
     }
    }
    Ans.m = remain.m - duration.m
   } else {
    Ans.m = remain.m
   }
 
   if (duration.h > 0) {
    if (remain.h < duration.h) {
      remain.d = remain.d - 1
      remain.h = remain.h + 8
    }
    Ans.h = remain.h - duration.h
   } else {
    Ans.h = remain.h
   }
 
   if (duration.d > 0) {
    Ans.d = remain.d - duration.d
   } else {
    Ans.d = remain.d
   }
 
   if (Ans.d < 0) {
    Ans.o = true
    Ans.d = Math.abs(Ans.d)
   } else {
    Ans.o = false
   }
  }
  
  return Ans
 }
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

exports.plusDuration = plusDuration
exports.displayDuration = displayDuration
exports.dhmtoarray = dhmtoarray
exports.getDuration = getDuration
exports.viewLar = viewLar
exports.getDayTime = getDayTime
exports.getDateValue = getDateValue