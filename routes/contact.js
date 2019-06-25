var express = require('express'),
router = express.Router(),
con = require('../bin/mysql')

/* GET home page. */
router.get('/',async function(req, res) {
    var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
    if (userName) {
        var result = await con.q('SELECT * FROM contact_data ORDER BY level ASC'),
        nameLst = await con.q('SELECT dataid,name,lastName FROM user_data ORDER BY name ASC'),
        level = 0
        depart = await con.q('SELECT * FROM depart_row ORDER BY ID ASC,row ASC')
        mlevel = depart.reduce((max,line) => (line.row > max ? line.row : max),depart[0].row)
        parms = { title: 'ข้อมูลติดต่อ', head1: 'ข้อมูลติดต่อ' }
        if (result != undefined) {
            parms.data = {},parms.data[level] = [],parms.list = []
            for (var i=0;i<result.length;i++) {
                if (level < result[i].level) { 
                    level++
                    parms.data[level] = []
                }
                nameLst = nameLst.filter(object => object.dataid != result[i].dataid)
                parms.data[level].push({
                    ID: result[i].dataid,
                    emid: result[i].emid,
                    level: result[i].level,
                    name: result[i].name,
                    line: result[i].line,
                    job: result[i].job,
                    nickname: result[i].nickname,
                    ext: result[i].ext,
                    private: result[i].private,
                    work: result[i].work,
                    email: result[i].email
                })
            }
            if (level < mlevel) {
                while (level < mlevel) {
                    level++
                    parms.data[level] = []
                }
            }
        }
        parms.depart=depart
        parms.user = userName
        parms.list = nameLst
        parms.operator = dataop
        res.render('contact', parms)
    } else {
		res.redirect('login')
	}
})

router.post('/',async function(req,res){
    if (req.body.state == "load") {
        let depart = await con.q('SELECT ID,depart FROM depart_row ORDER BY row ASC')
        req.body.depart = depart
        res.json(req.body)
    }
    if (req.body.state == "loado") {
        let 
        depart = await con.q('SELECT ID,depart FROM depart_row ORDER BY row ASC'),
        result = await con.q('SELECT emid,name,lastName,mail,jobPos FROM user_data WHERE dataid = ?',req.body.ID)
        req.body.depart = depart
        result = result[0]
        req.body.emid = result.emid
        req.body.name = result.name +' '+result.lastName
        req.body.mail = result.mail
        req.body.job = result.jobPos
        res.json(req.body)
    }
    if (req.body.state == "cdata") {
        let ID = req.body.ID,
        emid = req.body.data.emid,
        level = req.body.depart,
        name = req.body.data.name,
        job = req.body.data.job,
        nname = req.body.data.nname,
        ext = req.body.data.ext,
        com = req.body.data.com,
        pri = req.body.data.pri,
        mail = req.body.data.mail,
        line = await con.q('SELECT Max(line) line from contact_data WHERE level = ?',[level])

        if (line[0].line == null) {
            line = 0
        } else {
            line = line[0].line+1
        }
        con.q('INSERT INTO contact_data (dataid,emid,level,line,name,job,nickname,ext,private,work,email) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[ID,emid,level,line,name,job,nname,ext,pri,com,mail])
        req.body.data.line = line
        res.json(req.body)
    }
    if (req.body.state == "save") {

    }
    if (req.body.state == "add") {
        let
        ID = await con.q('SELECT MAX(ID) ID FROM depart_row'),
        line = await con.q('SELECT MAX(row) row FROM depart_row'),
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
        let ID = req.body.ID,
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