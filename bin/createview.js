const con = require('../bin/mysql')
var log = require('../bin/logger')
var ll = ['sick','personal','vacation','withoutpay','training','sterily','maternity','religious','military']
var cl = ['label-grey','label-success','label-warning','label-dark','label-info']
var ci = ['ลาฝึกอบรม','ลาทำหมัน','ลาคลอด','ลาอุปสมบท','ลารับราชการทหาร']
var depart = ['บริหารงานก่อสร้าง','ทรัพยากรบุคคล','ผู้บริหาร','ขาย','สำนักบริหาร','นิติกรรม','การเงิน','พัฒนาธุรกิจ','บัญชี','เทคโนโลยีสารสนเทศ','การตลาด','จัดซื้อ']
var dpn = ['construct','hr','manager','sale','adminoffice','law','finance','businessdev','account','it','market','purchase']
var dpns = ['con','hr','mgr','sale','ao','law','fin','bd','acc','it','mkt','pur']


/*
//เพิ่มสถิติการลาแยกตามฝ่ายรายปี (manual กำหนด time range (start&end time of year) ใน where clause)

function ctvcy() {
    var name,nameas
    for (var i=0;i<dpn.length;i++) {
        for (var j=0;j<9;j++) {
            name = 'tv_' + dpns[i] + ll[j] + '2019' 
            nameas = dpn[i] + ll[j] + '2019'
            if (j <= 3) {
                con.q('CREATE OR REPLACE VIEW '+name+' AS SELECT count(lar_data.dataid) AS '+nameas+' FROM (user_data left join lar_data on((lar_data.dataid = user_data.dataid))) WHERE ((user_data.depart = "'+depart[i]+'") and (lar_data.start >= 1546300800) and (lar_data.start < 1577836800) and (lar_data.className = "'+cl[j]+'"))')
            }
            else {
                con.q('CREATE OR REPLACE VIEW '+name+' AS SELECT count(lar_data.dataid) AS '+nameas+' FROM (user_data left join lar_data on((lar_data.dataid = user_data.dataid))) WHERE ((user_data.depart = "'+depart[i]+'") and (lar_data.start >= 1546300800) and (lar_data.start < 1577836800) and (lar_data.className = "'+cl[4]+'") AND (lar_data.title = "'+ci[j-4]+'"))')
            }
        }
    }
}
ctvcy()
*/

/*
//เพิ่มสถิติการลาแยกตามฝ่าย ต่อเดือน

function ctvcm() {
    var name,nameas,month,nmonth,year=2019
    for (var i=0;i<dpn.length;i++) {
        for (var j=0;j<12;j++) {
            month = new Date(year,j,1).getTime()+25200000
            nmonth = new Date(2019,j+1,1).getTime()+25200000
            name = 'tv_' + dpns[i] + (new Date(month).getMonth()+1) + '2019'
            nameas = dpn[i] + (new Date(nmonth).getMonth()+1) + '2019'
            con.q('CREATE OR REPLACE VIEW '+name+' AS SELECT count(lar_data.dataid) AS '+nameas+' FROM (user_data left join lar_data on((lar_data.dataid = user_data.dataid))) WHERE ((user_data.depart = "'+depart[i]+'") and (lar_data.start >= '+month/1000+') and (lar_data.start < '+nmonth/1000+'))')
        }
    }
}
ctvcm()
*/
