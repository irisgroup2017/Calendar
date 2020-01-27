const express = require('express'),
xlsx = require('excel4node'),
log = require('../bin/logger'),
con = require('../bin/mysql'),
moment = require("moment"),
exdata = require('../bin/exportdata'),
exportName = 'report excel',
momentDurationFormatSetup = require("moment-duration-format")

String.prototype.allReplace = function(obj) {
    var retStr = this
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
    }
    return retStr
}

async function xlCreate(tstart,tend,res) {
    const workbook = new xlsx.Workbook()
    tstart = parseInt(tstart)+21600
    tend = parseInt(tend)+108000
    let result = await con.q('SELECT * FROM lar_data WHERE ((start >= ? AND start <= ? OR end >= ? AND end <= ?) AND approve > 0) ORDER BY userName ASC , start ASC , end ASC',[tstart,tend,tstart,tend]),
    ws = workbook.addWorksheet('report') , userName , k=1,l=0,
    starttime = moment(tstart*1000).add(543,'years').format("DD/MM/YYYY"),
    endtime = moment((tend-25200)*1000).add(543,'years').format("DD/MM/YYYY")
    ws.cell(k,1,k,5,true).string('สรุปข้อมูลการลาระหว่างวันที่ '+starttime+' ถึง '+endtime+' ').style({ alignment:{horizontal:'center'} , font: {underline: true} })
    k=k+2
    ws.cell(k,1).string('ชื่อ').style({alignment:{horizontal:'center'}})
    ws.cell(k,2).string('รหัสอ้างอิง').style({alignment:{horizontal:'center'}})
    ws.cell(k,3).string('วันที่ลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,4).string('ประเภทลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,5).string('รายละเอียดการลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,6).string('จำนวนวันลา').style({alignment:{horizontal:'center'}})
    k++
    for (i = 0;i<result.length;i++) {
        if (userName != result[i].userName) {
            if (l > 1) {
                ws.cell(k-l,1,k-1,1,true).style({alignment:{vertical:'center'}})
            }
            l=0
            ws.cell(k,1).string(result[i].userName)
        }
        l++
        userName = result[i].userName
        title = result[i].title
        if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
        else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
        else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน'} 
        else if (result[i].className == 'label-dark') { larType = 'ลากิจไม่รับค่าจ้าง'} 
        else if (result[i].className == 'label-danger') { larType = 'ลาสลับวันหยุด' , title = "สลับวันหยุดกับวันที่ "+moment(result[i].swapDate*1000-25200000).add(543,'year').format("DD/MM/YYYY") } 
        else { larType = result[i].title }

        id = result[i].id
        start = new Date(result[i].start*1000-25200000)
        startShow = new Date(result[i].start*1000)
        end = (result[i].end ? new Date((result[i].end)*1000-25200000) : '-' )
        if (end == '-') {
            ws.cell(k,2).number(id).style({numberFormat: '#############'})
            ws.cell(k,3).date(startShow).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
            ws.cell(k,4).string(larType)
            ws.cell(k,5).string(title)  
            ws.cell(k,6).string('1 วัน').style({alignment:{horizontal:'center'}}) 
            k++
        } 
        else {
            //1 ชม 3600 , 1 วัน 86400
            duration = (result[i].end > tend ? tend : result[i].end) - (result[i].start < tstart ? tstart : result[i].start)
            duration = moment.duration(duration,'second').format("d,[d],h,[h],m,[m]")
            duration = duration.split(',')
            if (duration.indexOf('h') > 0 && duration.indexOf('d') == -1) {
                if (start.getHours() < 12 && end.getHours() > 13) {
                    fnum = duration.findIndex(num => num == 'h')
                    duration[fnum-1] = duration[fnum-1]-1
                }
            }
            if (duration.indexOf('d') > 0) {
                fnum = (duration.findIndex(num => num == 'd')-1)
                if (duration[fnum] > 1) {
                    for (var j=0;j<duration[fnum];j++) {
                        ws.cell(k,2).number(id).style({numberFormat: '#############'})
                        ws.cell(k,3).date(moment(startShow).add(j,'d')).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
                        ws.cell(k,4).string(larType)
                        ws.cell(k,5).string(title)  
                        ws.cell(k,6).string('1 วัน').style({alignment:{horizontal:'center'}}) 
                        k++
                    }
                }
            } else {
                duration = durt(duration)
                if (duration == '8 ชั่วโมง ') { duration = '1 วัน'}
                ws.cell(k,2).number(id).style({numberFormat: '#############'})
                ws.cell(k,3).date(startShow).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
                ws.cell(k,4).string(larType)
                ws.cell(k,5).string(title)  
                ws.cell(k,6).string(duration).style({alignment:{horizontal:'center'}}) 
                k++
            }
        }
    }
    ws.cell(3,1,k-1,6).style({ 
        border: {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin' }
        } 
    })
    workbook.write(exportName +' '+ starttime +' to '+ endtime+'.xlsx',res)
}

async function hrExport(tstart,tend,res) {
    const workbook = new xlsx.Workbook()
    let result = await con.q('select privacy_data.emid AS emid,lar_data.title AS title,lar_data.fname AS fname,lar_data.start AS start,lar_data.end AS end,lar_data.swapDate AS swapDate,lar_data.allDay AS allDay,lar_data.className AS className,privacy_data.swtime AS swtime,privacy_data.ewtime AS ewtime from (lar_data left join privacy_data on((lar_data.dataid = privacy_data.dataid))) WHERE ((start >= ? AND start <= ? OR end >= ? AND end <= ?) AND lar_data.approve > 0) ORDER BY emid ASC , start ASC , end ASC',[tstart,tend+86400,tstart,tend+86400]),
    ws = workbook.addWorksheet('report') , emid , k=1
    ws.cell(k,1).string('รหัสพนักงาน').style({alignment:{horizontal:'center'}})
    ws.cell(k,2).string('วันที่ลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,3).string('รหัสกะ').style({alignment:{horizontal:'center'}})
    ws.cell(k,4).string('รหัสผลข้อตกลงเงินหัก').style({alignment:{horizontal:'center'}})
    ws.cell(k,5).string('รหัสลักษณะการรูดบัตร').style({alignment:{horizontal:'center'}})
    ws.cell(k,6).string('วิธีลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,7).string('จำนวนที่ลา').style({alignment:{horizontal:'center'}})
    k++
    for (i = 0;i<result.length;i++) {
        let line = result[i]
        starttime = moment(line.start*1000).format("YYYYMMDD"),
        endtime = moment(line.end*1000).format("YYYYMMDD")
        title = line.title,
        larType = exdata.method(line),
        swtime = line.swtime
        ewtime = line.ewtime
        ws.cell(k,1).string(line.emid.toString())
        ws.cell(k,2).string(starttime)
        ws.cell(k,3).string(swtime.substring(0,2)+"."+swtime.substring(3,5)+"-"+ewtime.substring(0,2)+"."+ewtime.substring(3,5))
        ws.cell(k,4).string(larType)
        ws.cell(k,5).string("0")
        ws.cell(k,6).string("0")
        //userName = line.userName

        start = new Date(result[i].start*1000-25200000)
        end = (result[i].end ? new Date((result[i].end)*1000-25200000) : '-' )
        if (end == '-') {
            ws.cell(k,7).string("1") 
            k++
        }
        else {
            //1 ชม 3600 , 1 วัน 86400
            duration = (result[i].end > tend ? tend : result[i].end) - (result[i].start < tstart ? tstart : result[i].start)
            duration = moment.duration(duration,'second').format("d,[d],h,[h],m,[m]")
            duration = duration.split(',')
            if (duration.indexOf('h') > 0 && duration.indexOf('d') == -1) {
                if (start.getHours() < 12 && end.getHours() > 13) {
                    fnum = duration.findIndex(num => num == 'h')
                    duration[fnum-1] = duration[fnum-1]-1
                }
            }
            if (duration.indexOf('d') > 0) {
                fnum = (duration.findIndex(num => num == 'd')-1)
                if (duration[fnum] > 1) {
                    ws.cell(k,7).string(duration[fnum])
                }
            } else {
                let durt=0,day,hour,min
                duration = durtdata(duration)
                day = duration.d
                hour = duration.h
                min = duration.m
                if ((hour == '8' || hour == 8) && day==undefined && min==undefined) { duration = '1' }
                else {
                    for (let key in duration) {
                        if (typeof duration[key] != "number") { duration[key] = parseInt(duration[key]) }
                        if (key == "d") { durt += duration[key] }
                        if (key == "h") { durt += duration[key]/8 }
                        if (key == "m") { durt += duration[key]/480 }
                    }
                    ws.cell(k,7).string(durt.toString())
                    k++
                }
            }
        }
    }
    ws.cell(2,1,k-1,7).style({
        alignment: {
            horizontal: ['center']
        },
        border: {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin' }
        } 
    })
    workbook.write(exportName +'.xlsx',res)
}

function durtdata(obj) {
    var ans={}
    for (var i=0;i<=(obj.length/2);i=i+2) {
        ans[obj[i+1]] = obj[i]
    }
    return ans
}

function durt(obj) {
    var k = 0, ans=''
    for (var i in obj) {
        x = obj[i]
        if (k == 0) {
            if (x > 0) {
                ans = ans +''+ x + ' '
                k = 1
            }
        } else {
            ans = ans +''+ x + ' '
            k = 0
        }
    }
    return ans.allReplace({'d':'วัน','h':'ชั่วโมง','m':'นาที'})
}
exports.xlCreate = xlCreate
exports.hrExport = hrExport