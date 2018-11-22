const con = require('../bin/mysql'),
larlist = require('../bin/larlist'),
llt = ['ลาป่วย','ลากิจ','ลาพักร้อน','ลาฝึกอบรบ','ลาทำหมัน','ลาคลอด','ลาอุปสมบท','รารับราชการทหาร'],
ll = ['sick','personal','vacation','training','sterily','maternity','religious','military'],
llc = ['sickc','personalc','vacationc','trainingc','sterilyc','maternityc','religiousc','militaryc'],
lld = ['sickd','personald','vacationd','trainingd','sterilyd','maternityd','religiousd','militaryd'],
lle = ['sicke','personale','vacatione','traininge','sterilye','maternitye','religiouse','militarye'],
llr = ['sickr','personalr','vacationr','trainingr','sterilyr','maternityr','religiousr','militaryr']

async function setLar(userName,dataid,state,now) {
    /*
    1.ลาป่วย 30 วันต่อปี
    2.ลากิจ 6 วันต่อปี เพิ่มทุก 2 เดือน
    3.ลาพักร้อน 6 วันต่อปี เพิ่มทุก 2 เดือน สะสมไว้ใช้ในปีถัดไปได้ 6 วัน
    4.ลาฝึกอบรม 30 วัน
    5.ลาทำหมัน ตามใบรับรองแพทย์
    6.ลาคลอด 90 วัน ต่อ 1 ครรภ์
    7.ลาอุปสมบท อายุงาน 2 ปี 15 วัน และ อายุงาน 3 ปี ขึ้นไป 30 วัน 1 ครั้ง
    8.ลารับราชการทหาร 60 วัน 1 ครั้ง
    */
    si=30,pe=0,va=0,tr=30,st=1,ma=90,re=0,mi=60,dvinsert=0
    swdate = await con.q('SELECT cdate FROM privacy_data WHERE dataid = ?',dataid),
    x = gd(new Date(swdate[0].cdate*1000)),
    y = gd(new Date(now)),
    w = y[2]-x[2],
    ov = await con.q('SELECT vacation,vacationp,vacationr,sterily,sterilyd,religiousd,religious,militaryd,military FROM lar_status WHERE dataid = ? AND year = ?',[dataid,y[2]-1])
    if (!ov[0]) { 
        ov = 0 
    }
    else {
        if (ov[0].sterilyd) {
            if (ov[0].sterilyd > 0) { st=0 }
        } else if (ov[0].sterily) {
            if (ov[0].sterily == 0) { st=0 }
        }

        if (ov[0].religiousd) {
            if (ov[0].religiousd > 0) { re=0 }
        } else if (ov[0].religious) {
            if (ov[0].religious == 0) { re=0 }
        }

        if (ov[0].militaryd) {
            if (ov[0].militaryd > 0) { mi=0 }
        } else if (ov[0].military) {
            if (ov[0].military == 0) { mi=0 }
        }
        ovr = ov[0].vacationr
        ovp = ov[0].vacationp
        if (ovr) {
            ovb = await dhmtonum(ovr.toString())
            if (ovb >= 6) { ovr = '060000' }
            con.q('UPDATE lar_status SET userName = ?,vacationp = ? WHERE dataid = ? AND year = ?',[userName,ovr,dataid,y[2]])
        } else if (ovp) {
            ovm = ov[0].vacation + "0000"
            ovp2 = await plusdhm(ovm,ovp.toString())
            ovb = await dhmtonum(ovp2.toString())
            if (ovb >= 6) { ovp = '060000' }
            con.q('UPDATE lar_status SET userName = ?,vacationq = ? WHERE dataid = ? AND year = ?',[userName,ovp,dataid,y[2]])
        } 
    }
    
    va = Math.floor((y[1]+(y[0]==31 && y[1]==11?1:0))/2)
    pe = Math.floor((y[1]+(y[0]==31 && y[1]==11?1:0))/2)
    if (w == 2) {
        if (x[1] > y[1]) { re = 15 }
        if (x[1] == y[1]) {
            if (x[0] >= y[0]) { re = 15 }
        }
    }
    else if (w == 3) {
        if (x[1] > y[1]) { re = 30 }
        if (x[1] == y[1]) {
            if (x[0] >= y[0]) { re = 30 }
            else { re = 15 }
        }
    } else if (w > 3) { re = 30 }
    if (state == 'insert') {
        await con.q('INSERT INTO lar_status\
        (dataid,userName,year,sick,personal,vacation,training,sterily,maternity,religious,military)\
        VALUES (?,?,?,?,?,?,?,?,?,?,?)',[dataid,userName,y[2],si,pe,va+ovr,tr,st,ma,re,mi])
    }
    if (state == 'update') {
        var daisuki = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?',[dataid,y[2]])
        await con.q('UPDATE lar_status SET\
        userName = ?,sick = ?,personal = ?,vacation = ?,training = ?,sterily = ?,maternity = ?,religious = ?,military = ?\
        WHERE dataid = ? AND year = ?',[userName,si-daisuki[0][lle[0]],pe-daisuki[0][lle[1]],va-daisuki[0][lle[2]],tr-daisuki[0][lle[3]],st-daisuki[0][lle[4]],ma-daisuki[0][lle[5]],re-daisuki[0][lle[6]],mi-daisuki[0][lle[7]],dataid,y[2]])
    }
}

async function updateLar(userName,dataid,now) {
    var a = new Date(now),
    now = new Date((a.getMonth()==0 ? a.getFullYear()-1 : a.getFullYear()),(a.getMonth()==0 ? 11 : a.getMonth()),(a.getMonth()==0 ? 31 :a.getDate()),7).getTime()
    var checkdate = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?',[dataid,new Date(now).getFullYear()])
    if (checkdate == '') { await setLar(userName,dataid,'insert',now) }
    else { await setLar(userName,dataid,'update',now) }
}

async function dhmtonum(ov) {
    var lov = ov.length,iov = 0,dov,hov,mov,rov
    if (lov == 1 || lov == 3 || lov == 5) { iov = 1 }
    if (lov+iov == 6) {
        dov = parseInt(ov.substring(0,2-iov),10)
        hov = parseInt(ov.substring(2-iov,4-iov),10)
        mov = parseInt(ov.substring(4-iov,6-iov),10)
        rov = dov + Math.round(hov/24*100)/100 + ((mov/60)/10)
    }
    if (lov+iov == 4) {  
        hov = parseInt(ov.substring(0,2-iov),10)
        mov = parseInt(ov.substring(2-iov,4-iov),10)
        rov = (hov/24) + ((mov/60)/10)
    }
    if (lov+iov == 2) {  
        mov = parseInt(ov.substring(0,2-iov),10)
        rov = ((mov/60)/10)
    }
    return rov
}

function plusdhm(a,b) {
    ov = [a,b],aov=[]
    for (i=0;i<2;i++) {
        iov=0
        lov = ov[i].length
        if (lov == 1 || lov == 3 || lov == 5) { iov = 1 }
        if (lov+iov == 6) {
            aov.push({
               d: parseInt(ov[i].substring(0,2-iov),10),
               h: parseInt(ov[i].substring(2-iov,4-iov),10),
               m: parseInt(ov[i].substring(4-iov,6-iov),10)
            })
        }
        if (lov+iov == 4) {
            aov.push({
                d: 0,
                h: parseInt(ov[i].substring(0,2-iov),10),
                m: parseInt(ov[i].substring(2-iov,4-iov),10)
            })
        }
        if (lov+iov == 2) {
            aov.push({
                d: 0,
                h: 0,
                m: parseInt(ov[i].substring(0,2-iov),10)
            })
        }
    }
    ov = [aov[0].d+aov[1].d,aov[0].h+aov[1].h,aov[0].m+aov[1].m]
    if (ov[2] >= 60) { 
        ov[1] = ov[1]+ (ov[2] / 60)
        ov[2] = ov[2] % 60
    }
    if (ov[1] >= 8) {
        ov[0] = ov[0] + (ov[1] / 8)
        ov[1] = ov[1] % 8
    }
    var ans=''
    for (var i=0;i<ov.length;i++) {
        if (ov[i]>9) {
            ans = ans +''+ ov[i]
        } else if (ov[i]>1) {
            ans = ans + '0' + ov[i]
        } else { ans = ans + '00' }
    }
    return ans
}

function gd(a) {
    ans = [a.getDate(),a.getMonth(),a.getFullYear()]
    return ans
}
exports.setLar = setLar
exports.updateLar = updateLar