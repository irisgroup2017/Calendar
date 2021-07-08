const express = require('express'),
con = require('../bin/mysql'),
router = express.Router(),
dateFormat = require('dateformat'),
larlist = require('../bin/larlist'),
ll = ['sick','personal','vacation','training','sterily','maternity','religious','military'],
lle = ['sicke','personale','vacatione','traininge','sterilye','maternitye','religiouse','militarye'],
thisyear = new Date().getFullYear(),
log = require('../bin/logger')
const api = require('../bin/api')

router.get('/', async function(req, res) {
	var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		parms = { title: 'แก้ไขสิทธิการลา', head1: 'Edit Leave Entitlement' }
        parms.user = userName
        parms.operator = dataop
        if (dataop < 3) { res.redirect('/') }
	} else {
		res.redirect('/')
    }
    var result = await con.q('SELECT dataid,userName,sick,personal,vacation,training,sterily,maternity,religious,military FROM lar_status WHERE year = ? ORDER BY userName ASC',thisyear)
    var result2
    parms.objs = []
    for (var i = 0; i < result.length; i++) {
        //result2 = await larlist.viewLar(result[i].userName,result[i].dataid,new Date().getTime())
        parms.objs.push({
            'dataid': result[i].dataid,
            'user': result[i].userName,
            'sick': result[i][ll[0]],
            'personal': result[i][ll[1]],
            'vacation': result[i][ll[2]],
            'training': result[i][ll[3]],
            'sterily': result[i][ll[4]],
            'maternity': result[i][ll[5]],
            'religious': result[i][ll[6]],
            'military': result[i][ll[7]]/*,
            'vacationa': result2[2].d*/
        })
    }
    parms.tbl = parms.objs.length
    res.render('editentitle', parms)
})

router.post('/',async function(req,res) {
    const data = req.body,lp = ['si','pe','va','tr','st','ma','re','mi']
    var ans = [],
    result = await con.q('SELECT sick,personal,vacation,training,sterily,maternity,religious,military,sicke,personale,vacatione,traininge,sterilye,maternitye,religiouse,militarye FROM lar_status WHERE dataid = ? AND year = ?',[data.dataid,thisyear])
    info = result[0]
    for (var i=0;i<ll.length;i++) {
        if (info[ll[i]] == data[lp[i]]) {
            if (info[lle[i]] !== 0) { ans[lp[i]] = info[lle[i]] }
            else { ans[lp[i]] = 0 }
        }
        else {
            if (info[lle[i]] !== 0) { ans[lp[i]] = info[lle[i]] + ( info[ll[i]] - data[lp[i]] ) }
            else { ans[lp[i]] = info[ll[i]] - data[lp[i]] }
        }
    }
    await con.q('UPDATE lar_status SET sicke = ?,personale = ?,vacatione = ?,traininge = ?,sterilye = ?,maternitye = ?,religiouse = ?,militarye = ? WHERE dataid = ? AND year = ?',[ans.si,ans.pe,ans.va,ans.tr,ans.st,ans.ma,ans.re,ans.mi,data.dataid,thisyear])
    api.send('GET','/lardata','')
    log.logger('info','Edit Entitle: '+ req.cookies.user_name +' Data ID '+data.dataid)
    res.end('data')
})

module.exports = router