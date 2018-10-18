var express = require('express'),
router = express.Router(),
authHelper = require('../bin/auth'),
con = require('../bin/mysql')

router.get('/',async function(req, res) {
    var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
    parms = { title: userName, head1: 'Profile' }
	if (userName) {
		data = {
			'username': userName,
			'dataid': dataid,
			'operator': dataop,
			'mail': mail
		}
		authHelper.fortuneCookies(data,res)
        parms.user = userName
        parms.operator = dataop
    }
    sql = 'SELECT * FROM user_data WHERE name = ? AND lastName = ?'
    con.q(sql,[userName.split(" ")[0],userName.split(" ")[1]])
    .then(result => {
        parms.objs = []
        parms.objs.push({
            emid: result[0].emid,
            depart: result[0].depart,
            jobPos: result[0].jobPos,
            mail: result[0].mail,
            userName: result[0].userName
        })
        res.render('profile', parms)
    })
})

router.post('/',async function(req,res){
    dataid = req.cookies.user_dataid
    sql = 'SELECT * FROM user_data WHERE dataid = ?'
    con.q(sql,dataid)
    .catch(err => {
        throw err
    })
    .then(result => {
        r = result[0]
        if (r.password == req.body.oldpass) {
            if (req.body.oldpass !== req.body.newpass1) {
                con.q('UPDATE user_data SET password = ? WHERE dataid = ?',[req.body.newpass1,dataid])
                res.end("D")
            }
            else { res.end("SP") }
        } else { res.end("WP") }
    })
})

module.exports = router