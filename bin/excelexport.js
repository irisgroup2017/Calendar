const express = require('express'),
xlsx = require('excel4node'),
con = require('../bin/mysql'),
workbook = new xlsx.Workbook()

async function xlCreate(res) {
    var ws , j=0 , userName , k=1
    var result = await con.q('SELECT * FROM lar_data ORDER BY userName')
    for (i = 0;i<result.length;i++) {
        if (userName != result[i].userName) {
            ws = workbook.addWorksheet(result[i].userName)
            j = j+1
            k = 1
            ws.cell(k,1).string('test1').style({alignment:{horizontal:'center'}})
            ws.cell(k,2).string('test2').style({alignment:{horizontal:'center'}})
            ws.cell(k,3).string('test3').style({alignment:{horizontal:'center'}})
            ws.cell(k,4).string('test4').style({alignment:{horizontal:'center'}})
            k++
        } else {
            k++
        }
        userName = result[i].userName
        if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
        else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
        else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน'} 
        else { larType = result[i].title }
        title = result[i].title
        start = new Date(result[i].start*1000)
        end = (result[i].end ? new Date((result[i].end-60)*1000) : '-' )
        ws.cell(k,1).string(larType)
        ws.cell(k,2).string(title)
        ws.cell(k,3).date(start).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}})
        if (end == '-') { ws.cell(k,4).string(end).style({alignment:{horizontal:'center'}}) } else { ws.cell(k,4).date(end).style({numberFormat: 'dd/mm/yyyy',alignment:{horizontal:'center'}}) }
    }
    workbook.write('excelexport.xlsx',res)
}

exports.xlCreate = xlCreate