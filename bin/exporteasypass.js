const express = require('express')
const xlsx = require('excel4node')
const log = require('../bin/logger')
const con = require('../bin/mysql')
const util = require('util')
const moment = require("moment")
const exportName = "report_easypass.xlsx"

function calCash (cash,topup) {
    if (topup > cash) {
        num = topup - cash
        num = (Math.floor(num/500)+(num%500 > 350 ? 1 : 0))*500
        return num
    }
    return 0
}

option = {
    margins: {
        bottom: 0.4,
        footer: 0.1,
        header: 0.1,
        left: 0.4,
        right: 0.6,
        top: 0.6
    },
    pageSetup: {
        orientation: 'landscape',
        scale: 85,
    }
}

async function exportEasypass(res) {
    const compid = "0105549022418"
    const result = await con.q("SELECT * FROM licenseplate_data JOIN easypass_data ON licenseplate_data.unixid = easypass_data.unixid")
    const wb = new xlsx.Workbook()
    const ws = wb.addWorksheet("EasypassList",option)
    const priceFormatWithBorderBody = wb.createStyle({ numberFormat: "#,##0.00; (#,##0.00); -", border: { left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "dotted" } } })
    const priceFormatWithBorderFooter = wb.createStyle({ numberFormat: "#,##0.00; (#,##0.00); -", border: { left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } } })
    const borderHead = wb.createStyle({ border: { left: { style: "thin" }, right: { style: "thin" }, top: { style: "thin" }, bottom: { style: "thin" } } })
    const borderBody = wb.createStyle({ border: { left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "dotted" } } })
    const borderFooter = wb.createStyle({ border: { left: { style: "thin" }, right: { style: "thin" }, bottom: { style: "thin" } } })
    let row=10
    let col=1
    ws.cell(1,1).string("ข้อมูลผู้ใช้")
    ws.cell(1,2).string("เลขภาษี 0105549022418")
    ws.cell(1,4,1,5,true).string("เลขภาษี 0105549022418").style({ fill: { type: "pattern", patternType: 'solid', fgColor: "F9F908" } })
    ws.cell(2,1).string("เลขบัตรประชาชน/เลขทะเบียนพาณิชย์")
    ws.cell(2,4).string(compid)
    ws.cell(3,1).string("ชื่อ - นามสกุล")
    ws.cell(3,4).string("บริษัท ไอริส กรุ๊ป จำกัด")
    ws.cell(4,1).string("ที่อยู่ติดต่อ")
    ws.cell(4,4).string("710 ถนนประดิษฐ์มนูธรรม แขวงคลองเจ้าคุณสิงห์ เขตวังทองหลาง กรุงเทพมหานคร 10310")
    ws.cell(5,1).string("ที่อยู่ออกใบกำกับภาษี")
    ws.cell(5,4).string("710 ถนนประดิษฐ์มนูธรรม แขวงคลองเจ้าคุณสิงห์ เขตวังทองหลาง กรุงเทพมหานคร 10310")
    ws.cell(7,1).string("รายการบัตร Easy Pass")

    ws.cell(9,1).string("ลำดับ").style(borderHead)
    ws.cell(9,2).string("หมายเลข OBU").style(borderHead)
    ws.cell(9,3).string("เลขสมาร์ทการ์ด (S/N)").style(borderHead)
    ws.cell(9,4).string("เลขบัตรประชาชน / เลขทะเบียนพาณิชย์").style(borderHead)
    ws.cell(9,5).string("จำนวนเงิน").style(borderHead)
    ws.cell(9,6).string("ทะเบียนรถ").style(borderHead)
    ws.cell(9,7).string("จำนวนเงินที่เติม").style(borderHead)

    var num,obu,smid,plate,balance,cash,topup

    result.forEach(item => {
        num = (row-9).toString()
        obu = item.id
        smid = item.unixid
        plate = item.license +" "+ item.province
        balance = parseInt(item.amount.replace(",",""))
        topup = item.top
        cash = calCash(balance,topup)

        ws.cell(row,col++).string(num).style(borderBody)
        ws.cell(row,col++).string(obu).style(borderBody)
        ws.cell(row,col++).string(smid).style(borderBody)
        ws.cell(row,col++).string(compid).style(borderBody)
        ws.cell(row,col++).number(balance).style(priceFormatWithBorderBody)
        ws.cell(row,col++).string(plate).style(borderBody)
        ws.cell(row,col++).number(cash).style(priceFormatWithBorderBody)
        row++
        col=1
    })

    ws.cell(row,col,row,6,true).style(borderFooter)
    ws.cell(row,7).formula("SUM(G"+10+":G"+(row-1)+")").style(priceFormatWithBorderFooter)

    //Truncate(((256*8.7109375+Truncate(128/7))/256)*7)
    ws.column(1).setWidth(10.71)
    ws.column(2).setWidth(21.43)
    ws.column(3).setWidth(20)
    ws.column(4).setWidth(35.57)
    ws.column(5).setWidth(10.57)
    ws.column(6).setWidth(23.57)
    ws.column(7).setWidth(16.14)
    ws.setPrintArea(1, 1, row, 7)

    wb.writeP = util.promisify(wb.write)
    await wb.writeP(exportName)
    res.download(exportName)
}

module.exports.exp = exportEasypass