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
    var result = await con.q('SELECT * FROM lar_data WHERE ((start >= ? AND start <= ? OR end >= ? AND end <= ?) AND approve > 0) ORDER BY userName ASC , start ASC , end ASC',[tstart,tend,tstart,tend]),
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
        title = result[i].title
        if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
        else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
        else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน'} 
        else if (result[i].className == 'label-dark') { larType = 'ลากิจไม่รับค่าจ้าง'} 
        else if (result[i].className == 'label-danger') { larType = 'ลาสลับวันหยุด' , title = "สลับวันหยุดกับวันที่ "+moment(result[i].swapDate*1000-25200000).add(543,'year').format("DD/MM/YYYY") } 
        else { larType = result[i].title }

        start = new Date(result[i].start*1000-25200000)
        startShow = new Date(result[i].start*1000)
        end = (result[i].end ? new Date((result[i].end)*1000-25200000) : '-' )
        if (end == '-') {
            ws.cell(k,2).date(startShow).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
            ws.cell(k,3).string(larType)
            ws.cell(k,4).string(title)  
            ws.cell(k,5).string('1 วัน').style({alignment:{horizontal:'center'}}) 
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
                        ws.cell(k,2).date(moment(startShow).add(j,'d')).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
                        ws.cell(k,3).string(larType)
                        ws.cell(k,4).string(title)  
                        ws.cell(k,5).string('1 วัน').style({alignment:{horizontal:'center'}}) 
                        k++
                    }
                }
            } else {
                duration = durt(duration)
                if (duration == '8 ชั่วโมง ') { duration = '1 วัน'}
                ws.cell(k,2).date(startShow).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
                ws.cell(k,3).string(larType)
                ws.cell(k,4).string(title)  
                ws.cell(k,5).string(duration).style({alignment:{horizontal:'center'}}) 
                k++
            }
        }
    }
    ws.cell(3,1,k-1,5).style({ 
        border: {
            left: { style: 'thin' },
            right: { style: 'thin' },
            top: { style: 'thin' },
            bottom: { style: 'thin' }
        } 
    })
    workbook.write('excelexport'+starttime+'to'+endtime+' '+new Date().getTime()+'.xlsx',res)
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