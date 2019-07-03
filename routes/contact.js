var express = require('express'),
router = express.Router(),
con = require('../bin/mysql'),
log = require('../bin/logger')


function telFormat(number) {
    if (number) {
        let len = number.length
        if (len == 9) {
            number = number.substring(0,2) +"-"+ number.substring(2,6) +"-"+ number.substring(6)
        }
        else if (len == 10) {
            number = number.substring(0,3) +"-"+ number.substring(3,7) +"-"+ number.substring(7)
        }
        return number
    } 
}

/* GET home page. */
router.get('/',async function(req, res) {
    var userName = req.cookies.user_name,dataid = req.cookies.user_dataid,dataop = req.cookies.user_op,mail = req.cookies.user_mail
    if (userName) {
        log.logger('info',userName+' view contact')
        var result,
        nameLst = await con.q('SELECT dataid,name,lastName FROM user_data ORDER BY name ASC'),
        level = 0,
        depart = await con.q('SELECT * FROM depart_row ORDER BY row ASC,ID ASC')
        parms = { title: 'ข้อมูลติดต่อ', head1: 'ข้อมูลติดต่อ' }
        parms.data = {},parms.list = []
        for (const dep of depart) {
            level = dep.ID
            row = dep.row
            result = await con.q('SELECT * FROM contact_data WHERE level = ? ORDER BY line ASC',[level])
            if (result != undefined) {
                parms.data[row] = []
                for (const data of result) {
                    nameLst = nameLst.filter(object => object.dataid != data.dataid)
                    parms.data[row].push({
                        ID: data.dataid,
                        emid: data.emid,
                        level: level,
                        name: data.name,
                        line: data.line,
                        job: data.job,
                        nickname: data.nickname,
                        ext: data.ext,
                        private: telFormat(data.private),
                        work: telFormat(data.work),
                        email: data.email
                    })
                }
            } else {
                if (dataop > 3) {
                    parms.data[row] = []
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
    if (req.body.state == 'search-li') {
        let result = await con.q('SELECT * FROM contact_data WHERE emid = ?',[req.body.emid]),
        list = []
        if (result != "") {
            for (const data of result) {
                list.push({
                    ID: data.dataid +''+result.length,
                    emid: data.emid,
                    level: data.level,
                    name: data.name,
                    line: data.line,
                    job: data.job,
                    nickname: data.nickname,
                    ext: data.ext,
                    private: telFormat(data.private),
                    work: telFormat(data.work),
                    email: data.email
                })
            }
            res.json(list)
        } else {
            res.json('empty')
        }
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
        req.body.data.item[1] = parseInt(req.body.data.item[1])
        let query = ""
        for (var i=0;i<15;i+=2) {
            query = query + req.body.data.item[i] +" = "+ (i==0 ? req.body.data.item[i+1] : "'"+req.body.data.item[i+1]+"'") +","
        } query = query.slice(0,-1)
        log.logger('info',query)
        con.q('UPDATE contact_data SET '+query+ ' WHERE dataid = ?',[parseInt(req.body.data.ID)])
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
        let ID = req.body.ID.substring(5),
        result
        con.q('DELETE FROM contact_data WHERE dataid = ?',ID)
        ID = (ID.length == 13 ? ID : ID.substring(0,13))+'%'
        result = await con.q('SELECT * FROM contact_data WHERE dataid LIKE ?',[ID])
        if (result) {
            if (result.length > 0) {
                let i = 1,found = 1,loop = result.length
                for (const data of result) {
                    var id = data.dataid.toString()
                    if (--loop <= 0 && found) {
                        if (id.length != 13) {
                            await con.q('UPDATE contact_data SET dataid = ? WHERE dataid = ?',[id.substring(0,13),id])
                        }
                    } else {
                        if (id.length != 13) {
                            ID = id.substring(0,13) +''+ i++
                            await con.q('UPDATE contact_data SET dataid = ? WHERE dataid = ?',[ID,id])
                        } else {
                            found = 0
                        }
                    }
                }
            } else if (result.length == 1) {
                if (result[0].dataid.length > 13) {
                    con.q('UPDATE contact_data SET dataid = ? WHERE dataid = ?',[result[0].dataid.substring(0,13),result[0].dataid])
                }
            }
        }
    }
    if (req.body.state == "edit-de") {
        let ID = req.body.ID,
        depart = req.body.depart
        con.q('UPDATE depart_row SET depart = ? WHERE ID = ?',[depart,ID])
        res.json(req.body)
    }
    if (req.body.state == "move-li") {
        let order = req.body.order,dep,key,index
        order.forEach(row => {
            if (row.substring(0,4) == 'head') {
                index = 0
                dep = row.substring(5)
            } else {
                key = row.substring(5)
                con.q('UPDATE contact_data SET level = ?,line = ? WHERE dataid = ?',[dep,index++,key])
            }
        })
        res.end()
    }
    if (req.body.state == "move-de") {
        let order = req.body.order
        order.forEach(function (row,i) {
            con.q('UPDATE depart_row SET row = ? WHERE ID = ?',[i,row])
        })
        res.end()
    }
res.end()
})

module.exports = router