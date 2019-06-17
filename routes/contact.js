var express = require('express'),
router = express.Router(),
con = require('../bin/mysql')

/* GET home page. */
router.get('/',async function(req, res) {
    var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
    if (userName) {
        var result = await con.q('SELECT * FROM contact_data ORDER BY level ASC'),
        nameLst = await con.q('SELECT dataid,name,lastName FROM user_data ORDER BY name ASC'),
        index,
        depart = await con.q('SELECT * FROM depart_row ORDER BY ID ASC,row ASC')
        parms = { title: 'ข้อมูลติดต่อ', head1: 'ข้อมูลติดต่อ' }
        result = result[0]
        if (result != undefined) {
            parms.data = []
            for (var i=0;i<result.length;i++) {
                index = nameLst.indexOf(result[i])
                nameLst = nameLst.splice(index,1)
                parms.data.push({
                    emid: result.emid,
                    level: result.level,
                    name: result.name,
                    line: result.line,
                    job: result.job,
                    nickname: result.nickname,
                    ext: result.ext,
                    private: result.private,
                    work: result.work,
                    email: result.email
                })
            }
        }
        parms.depart=depart
        parms.user = userName
		parms.operator = dataop
        parms.list = nameLst
        res.render('contact', parms)
    } else {
		res.redirect('login')
	}
})

router.post('/',async function(req,res){
    var depart,ID,line
    if (req.body.state == "load") {
        depart = await con.q('SELECT ID,depart FROM depart_row ORDER BY row ASC')
        req.body.depart = depart
        res.json(req.body)
    }
    if (req.body.state == "loado") {
        let result
        depart = await con.q('SELECT ID,depart FROM depart_row ORDER BY row ASC')
        req.body.depart = depart
        result = await con.q('SELECT emid,name,lastName,mail,jobPos FROM user_data WHERE dataid = ?',req.body.ID)
        result = result[0]
        req.body.emid = result.emid
        req.body.name = result.name +' '+result.lastName
        req.body.mail = result.mail
        req.body.job = result.jobPos
        res.json(req.body)
    }
    if (req.body.state == "save") {

    }
    if (req.body.state == "add") {
        ID = await con.q('SELECT MAX(ID) ID FROM depart_row')
        line = await con.q('SELECT MAX(row) row FROM depart_row')
        depart = req.body.depart
        ID = ID[0].ID+1
        line = line[0].row+1
        con.q('INSERT INTO depart_row (ID,depart,row) VALUES (?,?,?)',[ID,depart,line])
        req.body.ID = ID
        req.body.line = line
        res.json(req.body)
    }
    if (req.body.state == "del") {

    }
    if (req.body.state == "edit") {
        ID = req.body.ID
        depart = req.body.depart
        con.q('UPDATE depart_row SET depart = ? WHERE ID = ?',[depart,ID])
        res.json(req.body)
    }
    if (req.body.state == "move-li") {

    }
    if (req.body.state == "move-de") {

    }
    res.end()
})

module.exports = router