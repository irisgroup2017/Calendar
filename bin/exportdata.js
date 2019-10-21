exports.method = function (line) {
    let way,cn=line.className,tt=line.title
    switch (cn) {
        case "label-grey": if (line.fname) { way = "sds" } else { way = "swds" } break
        case "label-dark": way = "dl"; break
        case "label-danger": way = "sd"; break
        case "label-warning": way = "va"; break
        case "label-success": way = "pe"; break
        case "label-info": 
            switch (tt) {
                case "ลาฝึกอบรม": way = "tr"
                case "ลาทำหมัน": way = "me"
                case "ลาคลอด": way = "ma"
                case "ลารับราชการทหาร": way = "mi"
                case "ลาอุปสมบท": way = "re"
            }
        case "default": way = "nothave"
    }

    switch (way) {
        case "": return "000000"
        case "": return "000001"//ไม่ใช่งาน
        case "": return "000002"//ไม่ใช่งาน
        case "": return "000003"//ไม่ใช่งาน
        case "": return "020001"//ขาดงาน
        case "": return "020002"//หักมาสาย
        case "swds": return "020003"//ป่วยไม่มีใบรับรอง
        case "sds": return "020004"//ป่วยมีใบรับรอง
        case "dl": return "020005"//ลากิจหักค่าจ้าง
        case "va": return "020006"//ลาพักร้อน
        case "ma": return "020007"//ลาคลอด
        case "re": return "020008"//ลาบวช
        case "": return "020009"//หักอื่นๆ
        case "": return "020010"//หักไม่บันทึกเวลาเข้า
        case "": return "020011"//หักไม่บันทึกเวลาออก
        case "": return "020012"//หักกลับก่อนเวลา
        case "": return "020013"//หักทำงานไม่ครบข้อตกลง
        case "": return "020014"//หักบันทึกเวลาไม่ครบข้อตกลง
        case "": return "020015"//หักชั่วโมงพักเกิน
        case "": return "020016"//มาสายหักเบี้ยขยัน
        case "pe": return "020017"//ลากิจ
        case "mi": return "020018"//ลาทหาร
        case "": return "020019"//ลาอุบัติเหตุในเวลางาน
        case "": return "020020"//ลาสมรส
        case "me": return "020021"//ลาทำหมัน
        case "": return "020022"//กลับก่อนหักเบี้ยขยัน
        case "sd": return "020023"//สลับวันหยุด
        case "tr": return "020024"//ลาฝึกอบรม
        case "default": return "0"
    }
}
/*
'ลาป่วย': (result[0].sickr ? remodule(result[0].sickr) : result[0].sick+' วัน'),
			'ลากิจ': (result[0].personalr ? remodule(result[0].personalr) : result[0].personal+' วัน'),
			'ลาพักร้อน': (result[0].vacationr ? remodule(result[0].vacationr) : result[0].vacation+' วัน'),
			'ลาฝึกอบรม': (result[0].trainingr ? remodule(result[0].trainingr) : result[0].training+' วัน'),
			'ลาทำหมัน':'ตามใบรับรองแพทย์',
			'ลาคลอด':'90 วันต่อครรภ์',
			'ลาอุปสมบท': (result[0].religiousr ? remodule(result[0].religiousr) : result[0].religious+' วัน'),
			'ลารับราชการทหาร': (result[0].militaryr ? remodule(result[0].militaryr) : result[0].military+' วัน')

if (result[i].className == 'label-grey') { larType = 'ลาป่วย' }
			else if (result[i].className == 'label-success') { larType = 'ลากิจ' }
			else if (result[i].className == 'label-warning') { larType = 'ลาพักร้อน' } 
			else { larType = result[i].title }
*/
function choose(use) {

}