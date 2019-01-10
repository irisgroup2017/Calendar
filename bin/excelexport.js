const express = require('express'),
xlsx = require('excel4node'),
con = require('../bin/mysql'),
workbook = new xlsx.Workbook(),
moment = require("moment"),
fs = require('fs')
momentDurationFormatSetup = require("moment-duration-format")

String.prototype.allReplace = function(obj) {
    var retStr = this
    for (var x in obj) {
        retStr = retStr.replace(new RegExp(x, 'g'), obj[x])
    }
    return retStr
}

async function xlCreate(tstart,tend,res) {
    var result = await con.q('SELECT * FROM lar_data WHERE start >= ? AND start <= ? OR end >= ? AND end <= ? ORDER BY userName ASC , start ASC , end ASC',[tstart,tend,tstart,tend]),
    ws = workbook.addWorksheet('report') , userName , k=1,
    starttime = moment(tstart*1000).add(543,'year').format("DD/MM/YYYY"),
    endtime = moment(tend*1000).add(543,'year').format("DD/MM/YYYY")
    ws.cell(k,1,k,5,true).string('สรุปข้อมูลการลาระหว่างวันที่ '+starttime+' ถึง '+endtime+' ').style({ alignment:{horizontal:'center'} , font: {underline: true} })
    k=k+2
    ws.cell(k,1).string('ชื่อ').style({alignment:{horizontal:'center'}})
    ws.cell(k,2).string('วันที่ลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,3).string('ประเภทลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,4).string('รายละเอียดการลา').style({alignment:{horizontal:'center'}})
    ws.cell(k,5).string('จำนวนวันลา').style({alignment:{horizontal:'center'}})
    k++
    for (i = 0;i<result.length;i++) {
        if (userName != result[i].userName) {
            ws.cell(k,1).string(result[i].userName)
        }
        userName = result[i].userName
        if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
        else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
        else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน'} 
        else { larType = result[i].title }
        title = result[i].title
        start = new Date(result[i].start*1000)
        end = (result[i].end ? new Date((result[i].end)*1000) : '-' )
        ws.cell(k,2).date(start).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
        ws.cell(k,3).string(larType)
        ws.cell(k,4).string(title)
        if (end == '-') { 
            ws.cell(k,5).string('1 วัน').style({alignment:{horizontal:'center'}}) } 
        else {
            //1 ชม 3600 , 1 วัน 86400
            duration = (result[i].end > tend ? tend : result[i].end) - (result[i].start < tstart ? tstart : result[i].start)
            duration = moment.duration(duration,'second').format("d,[d],h,[h],m,[m]")
            duration = duration.split(',')
            duration = durt(duration)
            if (duration.replace(' ','') == '9ชั่วโมง') { ws.cell(k,5).string('1 วัน').style({alignment:{horizontal:'center'}}) }
            else { ws.cell(k,5).string(duration).style({alignment:{horizontal:'center'}}) }
        }
        k++
    }
    ws.cell(3,1,k-1,5).style({ 
        border: {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin' }
        } 
    })
    //if (fs.existsSync('excelexport.xlsx')) { fs.unlinkSync('excelexport.xlsx') }
    workbook.write('excelexport'+starttime+'to'+endtime+'.xlsx',res)
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