const con = require('../bin/mysql'),
larlist = require('../bin/larlist'),
now = new Date(),
llt = ['ลาป่วย','ลากิจ','ลาพักร้อน','ลาฝึกอบรบ','ลาทำหมัน','ลาคลอด','ลาอุปสมบท','รารับราชการทหาร'],
ll = ['sick','personal','vacation','training','sterily','maternity','religious','military'],
llc = ['sickc','personalc','vacationc','trainingc','sterilyc','maternityc','religiousc','militaryc'],
lld = ['sickd','personald','vacationd','trainingd','sterilyd','maternityd','religiousd','militaryd'],
lle = ['sicke','personale','vacatione','traininge','sterilye','maternitye','religiouse','militarye'],
llr = ['sickr','personalr','vacationr','trainingr','sterilyr','maternityr','religiousr','militaryr']

async function setLar(userName,dataid,state) {
    /*
    ลาป่วย 30 วันต่อปี
    ลากิจ 6 วันต่อปี เพิ่มทุก 2 เดือน
    ลาพักร้อน 6 วันต่อปี เพิ่มทุก 2 เดือน สะสมไว้ใช้ในปีถัดไปได้ 6 วัน
    ลาฝึกอบรม 30 วัน
    ลาทำหมัน ตามใบรับรองแพทย์
    ลาคลอด 90 วัน ต่อ 1 ครรภ์
    ลาอุปสมบท อายุงาน 2 ปี 15 วัน และ อายุงาน 3 ปี ขึ้นไป 30 วัน 1 ครั้ง
    ลารับราชการทหาร 60 วัน 1 ครั้ง
    */
    var si=30,pe=0,va=0,tr=30,st=1,ma=90,re=0,mi=60,
    swdate = await con.q('SELECT cdate FROM privacy_data WHERE dataid = ?',dataid),
    x = gd(new Date(swdate[0].cdate*1000)),
    y = gd(now),
    w = y[2]-x[2],
    ov = await con.q('SELECT vacationr FROM lar_status WHERE dataid = ? AND year = ?',[dataid,y[2]-1])
    if (ov == '') { ov = 0 }
    else { 
        
    }
    if (w >= 2) {
        va = 6
        pe = 6
    } else {
        va = Math.floor((y[1]+1)/2)
        pe = Math.floor((y[1]+1)/2)
    }
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
        con.q('INSERT INTO lar_status\
        (dataid,userName,year,sick,personal,vacation,training,sterily,maternity,religious,military,vacationp)\
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',[dataid,userName,y[2],si,pe,va,tr,st,ma,re,mi,ov])
    }
    if (state == 'update') {
        console.log(userName)
        var daisuki = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?',[dataid,y[2]])
        con.q('UPDATE lar_status SET\
        userName = ?,sick = ?,personal = ?,vacation = ?,training = ?,sterily = ?,maternity = ?,religious = ?,military = ?,vacationp = ?\
        WHERE dataid = ? AND year = ?',[userName,si-daisuki[0][lle[0]],pe-daisuki[0][lle[1]],va-daisuki[0][lle[2]],tr-daisuki[0][lle[3]],st-daisuki[0][lle[4]],ma-daisuki[0][lle[5]],re-daisuki[0][lle[6]],mi-daisuki[0][lle[7]],ov,dataid,y[2]])
    }
}

async function updateLar(userName,dataid) {
    var checkdate = await con.q('SELECT * FROM lar_status WHERE dataid = ? AND year = ?',[dataid,now.getFullYear()])
    if (checkdate == '') { setLar(userName,dataid,'insert') }
    else { setLar(userName,dataid,'update') }
}

function gd(a) {
    ans = [a.getDate(),a.getMonth(),a.getFullYear()]
    return ans
}
exports.setLar = setLar
exports.updateLar = updateLar