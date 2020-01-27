const express = require('express')
const xlsx = require('excel4node')
const log = require('../bin/logger')
const con = require('../bin/mysql')
const moment = require("moment")
const exportName = 'report excel'
const thai = ['ลาป่วย','ลากิจ','ลาพักร้อน','ลาฝึกอบรบ','ลาทำหมัน','ลาคลอด','ลาอุปสมบท','รารับราชการทหาร']
const base = ['sick','personal','vacation','training','sterily','maternity','religious','military']
const over = ['vacationr','vacationp','vacationq']
const lcon = base.concat(over)
const _ = require("lodash")
const columnHead = ["ชื่อ-นามสกุล","วันที่บันทึก","วันเริ่มต้น","เวลาเริ่มต้น","วันสิ้นสุด","เวลาสิ้นสุด","ประเภทการลา","เหตุผลการลา","วันที่ขอสลับวัน","สิทธิวันลาปีนี้","สิทธิคงค้างปีที่แล้ว","สิทธิคงค้างปีที่แล้ว","รวมสิทธิวันลาที่ใช้ได้","รวมสิทธิวันลาที่ใช้ได้","จำนวนวันลา","จำนวนวันลา","คงเหลือวันลา","คงเหลือวันลา","สถานะการลา","ผู้อนุมัติ","วันที่อนุมัติ"]
const keys = ["name","insert","start","startTime","end","endTime","type","title","swap","thisyear","lastyear","totalyear","used","remain","status","approver","approved"]
const borderStyle = ['none', 'thin', 'medium', 'dashed', 'dotted', 'thick', 'double', 'hair', 'mediumDashed', 'dashDot', 'mediumDashDot', 'dashDotDot', 'mediumDashDotDot', 'slantDashDot']
async function managerExport(split,time,res) {
    const data = await listUser(parseInt(time))
    let workbook = new xlsx.Workbook()
    const splitpage = split
    if (splitpage) {
        let index = workbook.addWorksheet("สารบัญ") 
        let users = []
        let linkname
        data.forEach(table => {
            if (table != [] && table[0]) {
                let ws = workbook.addWorksheet(table[0].name) 
                users.push(table[0].name)
                let col=1 
                let row=1
                let firstpage = "'สารบัญ'!B"+(users.length+1)
                columnHead.forEach(head => {
                    ws.cell(row,col++).string(head).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},top:{style:'thin'},bottom:{style:'thin'}}})
                })
                table.forEach(item => {
                    col=1
                    row++
                    keys.forEach(key => {
                        if (key == 'lastyear' || key == 'totalyear' || key == 'used' || key == 'remain')  {
                            if (item[key]) {
                                let day = (item[key].d ? item[key].d.toString() : "-")
                                let hr = (item[key].h ? pad2(item[key].h) : "00")
                                let min = (item[key].m ? pad2(item[key].m) : "00")
                                let hm  = hr+":"+min
                                if (item[key].o) {
                                    ws.cell(row,col++).string(day).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}},font:{color:'#ff0000'}})
                                    ws.cell(row,col++).string((hm == "00:00" ? "-" : hm)).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}},font:{color:'#ff0000'}})
                                } else {
                                    ws.cell(row,col++).string(day).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                    ws.cell(row,col++).string((hm == "00:00" ? "-" : hm)).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                }
                            } else {
                                ws.cell(row,col++).string("-").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                ws.cell(row,col++).string("-").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                            }
                        } else {
                            ws.cell(row,col++).string((item[key] ? item[key] :"-")).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                        }
                    })
                })
                ws.cell(++row,1,row,columnHead.length).style({border:{top:{style:'thin'}}})
                ws.cell(++row,1).formula('=HYPERLINK(CONCATENATE("#",CELL("Address",'+firstpage+')),"ไปยังหน้าสารบัญ")').style({font:{color:'#4885ea'}})
            }
        })
        col=1
        row=1
        index.cell(row,col++).string("ลำดับ").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},top:{style:'thin'},bottom:{style:'thin'}}})
        index.cell(row++,col).string("รายชื่อพนักงาน").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},top:{style:'thin'},bottom:{style:'thin'}}})
        users.forEach((user,i) => {
            col=1
            linkname = "'"+user+"'!A1"
            index.cell(row,col++).number(i+1).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
            index.cell(row++,col).formula('=HYPERLINK(CONCATENATE("#",CELL("Address",'+linkname+')),"'+user+'")').style({border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
        })
        index.cell(row,1,row,2).style({border:{top:{style:'thin'}}})
    } else {
        let ws = workbook.addWorksheet("report") 
        let col=1 
        let row=1
        columnHead.forEach(head => {
            ws.cell(row,col++).string(head).style({alignment:{horizontal:'center'}})
        })
        data.forEach(table => {
            if (table != [] && table[0]) {
                table.forEach(item => {
                    col=1
                    row++
                    keys.forEach(key => {
                        if (key == 'lastyear' || key == 'totalyear' || key == 'used' || key == 'remain')  {
                            if (item[key]) {
                                let day = (item[key].d ? item[key].d.toString() : "-")
                                let hr = (item[key].h ? pad2(item[key].h) : "00")
                                let min = (item[key].m ? pad2(item[key].m) : "00")
                                let hm  = hr+":"+min
                                if (item[key].o) {
                                    ws.cell(row,col++).string(day).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}},font:{color:'#ff0000'}})
                                    ws.cell(row,col++).string((hm == "00:00" ? "-" : hm)).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}},font:{color:'#ff0000'}})
                                } else {
                                    ws.cell(row,col++).string(day).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                    ws.cell(row,col++).string((hm == "00:00" ? "-" : hm)).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                }
                            } else {
                                ws.cell(row,col++).string("-").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                                ws.cell(row,col++).string("-").style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                            }
                        } else {
                            ws.cell(row,col++).string((item[key] ? item[key] :"-")).style({alignment:{horizontal:'center'},border:{left:{style:'thin'},right:{style:'thin'},bottom:{style:'dotted'}}})
                        }
                    })
                })
            }
        })
    }
    workbook.write(exportName +'.xlsx',res)
}

function pad2(num) {
    return (num < 10 ? "0"+num : num)
}

async function listUser(time) {
    let query = "SELECT dataid,userName FROM user_data WHERE status = 1 ORDER BY name ASC"
    let users = await con.q(query)
    let data = []
    let check
    if (users) {
        await Promise.all(users.map(async (user) => {
            check = await listLar(user.dataid,time)
            if (check) {
                data.push(check)
            }
        }))
    }
    return data
}

async function listLar(dataid,time) {
    let a = new Date(time)
    let LAR = []
    let start = new Date(a.getFullYear(),0,1,7).getTime()/1000
    let end = new Date(a.getFullYear(),11,31,7).getTime()/1000
    const worktime = (await con.q('SELECT swtime,ewtime FROM privacy_data WHERE dataid = ?',[dataid]))[0]
    var lardata = await con.q('SELECT * FROM lar_data WHERE dataid = ? AND approve > 1 AND start BETWEEN ? AND ?',[dataid,start,end])
    const lartotal = await con.q('SELECT ?? FROM lar_status WHERE dataid = ? AND year = ?',[lcon,dataid,a.getFullYear()])
    const dataTime = {}
    const newtotal = (lartotal ? {...lartotal[0]} : "")
    if (lardata == []) {
        return null
    }
    Object.keys(newtotal).map(key => {
        dataTime[key] = numtoarray(key, newtotal[key])
    }, {})
    const testdata = {...dataTime}
    let saveTime = calculateTime(testdata)
    let calTime = _.cloneDeep(saveTime)
    const vacationtime = vacationRemain(testdata)
    await Promise.all(lardata.map(function(item,index) {
        if (item.approve != 0 && item.approve != 1) {
            calTime = updateTime(item,calTime)
            LAR.push(pushItem(item,dataTime,calTime,saveTime,vacationtime,worktime))
        }
    }))
    return LAR
}

function pushItem(item,dataTime,calTime,time,vacationtime,worktime) {
    let LAR = {}
    let ctime = item.cTime
    let recday,remday,totalday,thisremain,typeis,remain
    let type = larType(item.className,item.title)[0]
    let used = getDuration(item.start,item.end,item.allDay)
    let typenum = (thai.indexOf(type) != -1 ? thai.indexOf(type) : -1)
    let approve = function(item) {
        if (item.delreq) { return "แจ้งยกเลิก" }
        else if (item.approve==2) { return "รออนุมัติ" }
        else { return "อนุมัติ" }
    }

    ctime = (ctime > 99999999999 ? moment(ctime).unix() : ctime )
    if (typenum > -1) {
        typeis = base[typenum]
        recday = dataTime[typeis]
        remday = (typeis == "vacation" ? vacationtime : { d:0, h:0, m:0 })
        totalday = time[typeis]
        thisremain = _.get(calTime,typeis)
    } else {
        recday = ""
        remday = ""
        totalday = ""
        thisremain = ""
    }
    LAR = {
        name: item.userName,
        insert: moment((ctime-25200)*1000).add(543,'years').format("DD/MM/YYYY"),
        start: moment((item.start)*1000).add(543,'years').format("DD/MM/YYYY"),
        end: (item.end ? moment((item.end-25300)*1000).add(543,'years').format("DD/MM/YYYY") : ""),
        startTime: ( item.allDay ? worktime.swtime.substring(0,5) : moment((item.start-25200)*1000).add(543,'years').format("HH:mm") ),
        endTime: ( item.allDay ? worktime.ewtime.substring(0,5) : moment((item.end-25200)*1000).add(543,'years').format("HH:mm") ),
        type: type,
        title: (item.swapDate ? "" : larType(item.className,item.title)[1]),
        swap: (item.swapDate ? moment((item.swapDate-25200)*1000).add(543,'years').format("DD/MM/YYYY") : ""),
        thisyear: (recday ? recday.d.toString() : recday),
        lastyear: remday,
        totalyear: totalday,
        used: used,
        remain: thisremain,
        status: approve(item),
        approver: item.approver,
        approved: moment((item.approvedate-25200)*1000).add(543,'years').format("DD/MM/YYYY")
    }
    return LAR
}

function updateTime(item,calTime) {
    let time = {...calTime}
    let type = larType(item.className,item.title)[0]
    let used = getDuration(item.start,item.end,item.allDay)
    let typenum = (thai.indexOf(type) != -1 ? thai.indexOf(type) : -1)
    if (typenum > -1) {
        typeis = base[typenum]
        time[typeis] = minusDuration(time[typeis],used)
    }
    return time
}

function vacationRemain(remaindata) {
    let data = {...remaindata}
    var neverlogin = (data.vacationq ? data.vacationq : {d:0,h:0,m:0})
    var everlogin = (data.vacationp ? data.vacationp : {d:0,h:0,m:0})
    if (neverlogin.d || neverlogin.h || neverlogin.m) {
        return neverlogin
    } else if (everlogin.d || everlogin.h || everlogin.m) {
        return everlogin
    } else {
        return { d:0, h:0, m:0 }
    }
}

function calculateTime(calculatedata) {
    let data = {...calculatedata}
    let ans = {}
    base.map(item => {
        if (item == "vacation") {
            if (data[item + "p"]) {
                ans[item] = plusDuration(data[item], data[item + "p"])
            }
            else if (data[item + "q"]) {
                ans[item] = plusDuration(data[item], data[item + "q"])
            } else {
                ans[item] = data[item]
            }
        }
        else {
            ans[item] = data[item]
        }
    })
    return ans
}

function larType (type,title) {
    switch (type) {
        case "label-grey":
            return ["ลาป่วย",title]
        case "label-dark":
            return ["ลากิจไม่รับค่าจ้าง",title]
        case "label-success":
            return ["ลากิจ",title]
        case "label-warning":
            return ["ลาพักร้อน",title]
        case "label-danger":
            return ["ลาสลับวันหยุด",title]
        case "label-info":
            return [title,title]
        case "default":
            return ""
    }
}

function numtoarray(key,num) {
    if (num && num > 0) {
        if ((['p','q','r'].indexOf(key.slice(-1)) != -1) && (num != null)) {
            return dhmtoarray(num.toString())
        } else {
            return { d:Number(num), h:0, m:0 }
        }
    }
    return { d:0, h:0, m:0 }
}

function dhmtoarray(ov) {
    var lov = ov.length,iov = 0,rov
    if (lov == 1 || lov == 3 || lov == 5) { iov = 1 }
    if (lov+iov == 6) {
        rov = {
            d: parseInt(ov.substring(0,2-iov),10),
            h: parseInt(ov.substring(2-iov,4-iov),10),
            m: parseInt(ov.substring(4-iov,6-iov),10)
        }
    }
    if (lov+iov == 4) {
        rov = {
            d: 0,
            h: parseInt(ov.substring(0,2-iov),10),
            m: parseInt(ov.substring(2-iov,4-iov),10)
        }
    }
    if (lov+iov == 2) {  
        rov = { 
            d: 0,
            h: 0,
            m: parseInt(ov.substring(0,2-iov),10)
        }
    }
    return rov
}

option = {
    object: ['วัน','ชั่วโมง','นาที'],
    unit: ['d','h','m'],
    units: {
    d: 86400,//86400:24h
    h: 3600,//3600:60m
    m: 60//60:1m
    }
}

function getDuration(start,end,use) {
    if (use && !end) { return {d:1,h:0,m:0} }
    else {
        duration = end-start
        Ans = []
        for (var i=0;i<option.unit.length;i++) {
            unitBase = option.unit[i]
            unitValue = option.units[unitBase]
            if (unitValue <= duration) {
                Ans[unitBase] = Math.floor(duration / unitValue)
                duration = duration % unitValue
            }
        }
        if  (Ans.h > 8) {
            Ans.h = 0
            Ans.d = (Ans.d ? Ans.d+1 : 1)
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
    if (Ans == '') { Ans = '' }
    return Ans
}

function plusDuration(old,add) {
    let Ans,o,a
    o = dhmToS(old)
    a = dhmToS(add)
    Ans = o+a
    Ans = sToDhm(Ans)
    return Ans
}

function minusDuration(remain,duration) {
    let Ans,rem,dur,over
    if (!remain) { return "" }
    else if (remain.o) { over = true }
    rem = dhmToS(remain)
    dur = dhmToS(duration)

    if (dur > rem) { 
        Ans = dur-rem
        Ans = sToDhm(Ans)
        Ans.o = true
    } else if (over) {
        Ans = rem+dur
        Ans = sToDhm(Ans)
        Ans.o = true
    } else {
        Ans = rem-dur
        Ans = sToDhm(Ans)
    }
    return Ans
}

function dhmToS(time) {
    let s,m=0,h=0,d=0
    if (time.m) { m = parseInt(time.m) * 60 }
    if (time.h) { h = parseInt(time.h) * 3600 }
    if (time.d) { d = parseInt(time.d) * 28800 }
    s = m+h+d
    return s
}

function sToDhm(s) {
    let time,d=0,h=0,m=0
    if (s >= 28800) {
        d = Math.floor(s/28800)
        s = s % 28800
    }
    if (s >= 3600) {
        h = Math.floor(s/3600)
        s = s % 3600
    }
    if (s >= 60) {
        m = Math.floor(s/60)
        s = s % 60
    }
    return { d: d , h:h , m:m }
}

exports.managerExport = managerExport