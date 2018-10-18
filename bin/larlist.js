var con = require('../bin/mysql')

const llt = ['ลาป่วย','ลากิจ','ลาพักร้อน','ลาฝึกอบรบ','ลาทำหมัน','ลาคลอด','ลาอุปสมบท','ลารับราชการทหาร'],
lle = ['sick','personal','vacation','training','sterily','maternity','religious','military'],
lld = ['sickd','personald','vacationd','trainingd','sterilyd','maternityd','religiousd','militaryd'],
llr = ['sickr','personalr','vacationr','trainingr','sterilyr','maternityr','religiousr','militaryr']

function remodule(d) {
	var i,a=[],d=d.toString()
	if (d.length < 5) {i=1} else {i=0}
	if (d.length == 3) {i=1} else {i=0}
	if (d.length == 1) {i=1} else {i=0}
	if (d.length+i == 6) { a.a= Number(d.substring(0,2-i)) , a.b= Number((Number(d.substring(2-i,2)) == 0 ? 0 : d.substring(2-i,2))) , a.c= Number((Number(d.substring(4-i,2)) == 0 ? 0 : d.substring(4-i,2))) }
	if (d.length+i == 4) { a.a = 0 , a.b= Number(d.substring(0,2-i)) , a.c = Number((Number(d.substring(2-i,2)) == 0 ? d.substring(2-i,2) : d.substring(2-i,2))) }
	if (d.length+i == 2) { a.a = 0 , a.b = 0 , a.c = Number(d.substring(0,2-i)) }
	return a
}

async function getLar(userName,dataid) {
    var a = new Date(),
    LAR = [],
    start = new Date(a.getFullYear(),1,1,7).getTime()/1000,
    end = new Date(a.getFullYear(),12,31,7).getTime()/1000,
    result = await con.q('SELECT * FROM lar_data WHERE userName = ? AND approve > 1 AND start BETWEEN ? AND ?',[userName,start,end]),
    resultr = await con.q('SELECT * FROM lar_status WHERE dataid = ?',dataid) 
    resultr = resultr[0]
    for (var i = 0; i < result.length; i++) {
        var duration = []
        if (result[i].end) { 
            duration = getDuration(result[i].start,result[i].end)
        } else { duration.d = 1 }
        j = result[i].className , k = result[i].title
        if (j == 'label-grey') { 
            LAR.sick = (LAR.sick ? LAR.sick+1 : 1)
            LAR.sickd = plusDuration(LAR.sickd,duration)
        }
        else if (j == 'label-success') { 
            LAR.personal = (LAR.personal ? LAR.personal+1 : 1)
            LAR.personald = plusDuration(LAR.personald,duration)
        }
        else if (j == 'label-warning') { 
            LAR.vacation = (LAR.vacation ? LAR.vacation+1 : 1)
            LAR.vacationd = plusDuration(LAR.vacationd,duration)
        }
        else {
            if (k == 'ลาฝึกอบรม') {
                LAR.training = (LAR.training ? LAR.training+1 : 1)
                LAR.trainingd = plusDuration(LAR.trainingd,duration)
            }
            else if (k == 'ลาทำหมัน') { 
                LAR.sterily = (LAR.sterily ? LAR.sterily+1 : 1)
                LAR.sterilyd = plusDuration(LAR.sterilyd,duration)
            }
            else if (k == 'ลาคลอด') { 
                LAR.maternity = (LAR.maternity ? LAR.maternity+1 : 1)
                LAR.maternityd = plusDuration(LAR.meternityd,duration)
            }
            else if (k == 'ลาอุปสมบท') { 
                LAR.religious = (LAR.religious ? LAR.religious+1 : 1)
                LAR.religiousd = plusDuration(LAR.religiousd,duration)
            }
            else if (k == 'ลารับราชการทหาร') {
                LAR.military = (LAR.military ? LAR.military+1 : 1)
                LAR.militaryd = plusDuration(LAR.militaryd,duration)
            }
        }
    }
    LAR.sickr = minusDuration(resultr[lle[0]],LAR.sickd)
    LAR.personalr = minusDuration(resultr[lle[1]],LAR.personald)
    LAR.vacationr = minusDuration(resultr[lle[2]],LAR.vacationd)
    LAR.trainingr = minusDuration(resultr[lle[3]],LAR.trainingd)
    LAR.sterilyr = minusDuration(resultr[lle[4]],LAR.sterilyd)
    LAR.maternityr = minusDuration(resultr[lle[5]],LAR.maternityd)
    LAR.religiousr = minusDuration(resultr[lle[6]],LAR.religiousd)
    LAR.militaryr = minusDuration(resultr[lle[7]],LAR.militaryd)
    return LAR
}

async function viewLar(userName,dataid) {
    var LAR = await getLar(userName,dataid)
    LARS = [] , saveLAR = []
		for (i=0;i<llt.length;i++) {
            if (i == 4) {
                var s1,s2
                if (Number(LAR[lle[i]]) == 1) {
                    s1 = '1 ครั้ง'
                    s2 = '0 ครั้ง'
                    LAR[llr[i]]['o'] = false
                }
                else if (Number(LAR[lle[i]]) > 1) {
                    s1 = 'ใช้ '+ LAR[lle[i]] +' ครั้ง'
                    s2 = Number(LAR[lle[i]])-1 +' ครั้ง'
                    LAR[llr[i]]['o'] = true
                }
                else {
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
                    d: (llt[i] == 'ลาทำหมัน' ? s2 : LAR[llr[i]]['d']+' วัน'),
                    e: LAR[llr[i]]['o']
                })
            }
        }
        saveDuration(saveLAR,dataid)
    return LARS
}

option = {
    object: ['วัน','ชั่วโมง','นาที'],
    unit: ['d','h','m'],
    units: {
    d: 86400,
    h: 3600,
    m: 60
    }
}

function getDuration(start,end) {
    duration = end-start
    Ans = []
    for (var i=0;i<option.unit.length;i++) {
        unitBase = option.unit[i]
        unitValue = option.units[unitBase]
        if (unitValue < duration) {
            Ans[unitBase] = Math.floor(duration / unitValue)
            duration = duration % unitValue
        }
    }
    return Ans
}

function displayDuration(duration) {
    var Ans = ''
    for (var i=0;i<option.unit.length;i++) {
        unitBase = option.unit[i]
        if (duration[unitBase]>0) {
            Ans = Ans + duration[unitBase] + ' ' + option.object[i] + ' '
        }
    }
    if (Ans == '') { Ans = '0 วัน' }
    return Ans
}

function displayDurations(duration) {
    var Ans = ''
    for (var i=0;i<option.unit.length;i++) {
        unitBase = option.unit[i]
        if (duration[unitBase]>0) {
            Ans = Ans + duration[unitBase] + ' ' + option.object[i] + ' '
        }
    }
    return Ans
}

function saveDuration(duration,dataid) {
    if (duration.length > 0) {
        var query = '' , Ans = [] 
        for (var d=0;d<duration.length;d++) {
            var q = duration[d] , qd = '' , qr = ''
            if (query == '') { query = q.a + ' = ?' } else { query = query + ',' + q.a + ' = ?'  }
            query = query + ',' + q.c + ' = ?'

            for (var i=0;i<option.unit.length;i++) {
                unitBase = option.unit[i]
                if (q.b[unitBase]>9) {
                    qd = qd + q.b[unitBase]
                } else if (q.b[unitBase]<10) {
                    qd = qd + '0' + q.b[unitBase]
                } else { qd = qd + '00' }

                if (q.d[unitBase]>9) {
                    qr = qr + q.d[unitBase]
                } else if (q.d[unitBase]<10) {
                    qr = qr + '0' + q.d[unitBase]
                } else { qr = qr + '00' }
            }
            Ans.push(qd)
            Ans.push(qr)
        }
        Ans.push(dataid)
        Ans.push(new Date().getFullYear())
        con.q('UPDATE lar_status SET '+query+' WHERE dataid = ? AND year = ?',Ans)
    }
}

function plusDuration(old,new1) {
    Ans = []
    for (var i=0;i<option.unit.length;i++) {
        unitBase = option.unit[i]
        if (old) {
            if (old[unitBase] != undefined && !isNaN(old[unitBase])) {
                if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) {
                Ans[unitBase] = old[unitBase] + new1[unitBase]
                }
                else { 
                    Ans[unitBase] = old[unitBase] 
                }
            }
            else if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) {
                Ans[unitBase] = new1[unitBase]    
            }
        }
        else if (new1[unitBase] != undefined && !isNaN(new1[unitBase])) { 
            Ans[unitBase] = new1[unitBase]
        } 
    }
    if (Ans.m > 60) { 
        Ans.h = Ans.h+ (Ans.m / 60)
        Ans.m = Ans.m % 60
    }
    if (Ans.h > 8) {
        Ans.d = Ans.d + (Ans.h / 8)
        Ans.h = Ans.h % 8
    }
    return Ans
}

function minusDuration(remain,duration) {
    var Ans = [],chk=['d','h','m']
    remain = {
        'd':Number(remain),
        'h':0,
        'm':0
    }
    for (var i=0;i<3;i++) {
        if (duration === undefined || isNaN(duration)) { duration = {'d':0,'h':0,'m':0} }
        if (remain[chk[i]] == undefined || isNaN(remain[chk[i]])) { remain[chk[i]] = 0 }
        if (duration[chk[i]] == undefined || isNaN(duration[chk[i]])) { duration[chk[i]] = 0 }
    }
    if (duration.d == remain.d) {
        if (duration.h > 0 || duration.m > 0) { 
            Ans.o = true
            Ans.d = duration.d - remain.d
            Ans.h = (duration.h>0?duration.h:0)
            Ans.m = (duration.m>0?duration.m:0)
            return Ans
        } else {
            Ans.o = false
            Ans.d = duration.d - remain.d
            Ans.h = (duration.h>0?duration.h:0)
            Ans.m = (duration.m>0?duration.m:0)
            return Ans
        }
    }
    else if (duration.d > remain.d) {
        Ans.o = true
        Ans.d = duration.d - remain.d
        Ans.h = (duration.h>0?duration.h:0)
        Ans.m = (duration.m>0?duration.m:0)
        return Ans
    }
    else {
        if (duration.m > 60) {
            remain.h = duration.m/60
            Ans.m = 60-(duration.m % 60)
            duration.m = 0
        }
        if (duration.m > 0) {
            remain.d = remain.d - 1
            remain.h = 7+remain.h           
            Ans.m = (60+remain.m)-duration.m
        }
        if (duration.h > 8) {
            remain.d = remain.d - duration.h/8
            Ans.h = 8-(Ans.h % 8)
            duration.h = 0
        }
        if (duration.h > 0 && remain.h < duration.h) {
            remain.d = remain.d-1
            remain.h = 8+remain.h
            Ans.h = (8+remain.d)-duration.d
        }
        if (duration.h > 0 && remain.h > duration.h) {
            Ans.h = remain.h-duration.h
        }
        if (duration.d > 0) {
            remain.d = remain.d-duration.d
        }
        if (remain.h > 8) { 
            remain.d = remain.d-(remain.h/8) 
            remain.h = remain.h % 8
        }
        Ans.o = false
        Ans.d = remain.d
        return Ans
    }
}

function getDateValue(timeParse) {
	gDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
	gMonth = ['January','February','March','April','May','June','July','August','September','October','November','December']
	if (timeParse > 99999999999) { timeParse = new Date(timeParse) } 
	else { timeParse = new Date((timeParse-25200)*1000) }
	datevalues = {
		y: timeParse.getFullYear(),
		mo: gMonth[timeParse.getMonth()],
		dy: gDay[timeParse.getDay()],
		da: timeParse.getDate(),
		h: timeParse.getHours(),
		mi: timeParse.getMinutes()
	}
	if (datevalues.h < 0) { datevalues.h = datevalues.h + 24 }
	if (datevalues.mi < 10) { datevalues.mi = '0'+ datevalues.mi }
	if (datevalues.h < 10) { datevalues.h = '0'+ datevalues.h }
	 return datevalues
}

function returnDate(y,mo,dy,da,sAnde) {
	return { 
		date: dy+', '+da+' '+mo+' '+y,
		time: sAnde
	}
}

function getDaysInMonth(mo,ye) {
   return new Date(ye, mo, 0).getDate()
}
function getMonthFromString(mo){
    return new Date(Date.parse(mo +"1, 2012")).getMonth()+1
 }

function getDayTime (inTime,outTime,allDay) {
    ds = getDateValue(inTime)
	if (allDay) {
		if (outTime) { // more days
			de = getDateValue(outTime)
			gDay = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
			de.dy = gDay[(gDay.indexOf(de.dy)-1<0?6:gDay.indexOf(de.dy)-1)]
			dStart = returnDate(ds.y,ds.mo,ds.dy,ds.da,'ทั้งวัน')
            dEnd = returnDate(de.y,de.mo,de.dy,de.da-1)
            if (ds.mo == de.mo) {
                dlength = (de.da-ds.da) + " วัน"
            } else {
                j = getMonthFromString(ds.mo)
                k = getMonthFromString(de.mo)
                for (i=j;i<=k;i++) {
                    if (i == j) { dlength = getDaysInMonth(i,ds.y)-ds.da }
                    else if (i == k) { dlength += de.da }
                    else { dlength += getDaysInMonth(i,ds.y) }
                }
                dlength = dlength + ' วัน'
            }
		}
		else { // all 1 day
			dStart = returnDate(ds.y,ds.mo,ds.dy,ds.da,'ทั้งวัน')
			dEnd = returnDate(ds.y,ds.mo,ds.dy,ds.da)
			dlength = 1 + " วัน"
		}
	}
	else {
		if (outTime) { // 1 day fix
			de = getDateValue(outTime)
			var miTime = 0,
			sTime = 0,
			eTime = 0,
			dStart = returnDate(ds.y,ds.mo,ds.dy,ds.da,ds.h+':'+ds.mi),
			dEnd = returnDate(de.y,de.mo,de.dy,de.da,de.h+':'+de.mi)
			if (de.da-ds.da == 0) {
				sTime = parseInt(ds.h+'.'+ds.mi)
				eTime = parseInt(de.h+'.'+de.mi)
				if (((de.h-ds.h) % 4) >= 1) { minush = 1 }
				else { minush = 0 }
				if (de.mi-ds.mi != 0) { miTime = 30 }
				dlength = eTime-sTime-minush +' ชั่วโมง '+ (miTime == 0 ? "" : miTime +' นาที')
			}
			else {
				sTime = ds.h+'.'+ds.mi
				eTime = de.h+'.'+de.mi
				if (((de.h-ds.h) % 4) >= 1) { minush = 1 }
				else { minush = 0 }
				dlength = de.da-ds.da+' วัน '+eTime-sTIme-minush +' ชั่วโมง'
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
exports.getDuration = getDuration
exports.viewLar = viewLar
exports.getDayTime = getDayTime
exports.getDateValue = getDateValue