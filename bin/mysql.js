var mysql = require('mysql2/promise')

exports.q = async function (sql,values) {

    const c = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'calendar'
    })
    if (Array.isArray(sql)) {
        result = []
        for (i=0; i<sql.length; i++) {
            var [rows,fields] = await c.query(sql[i], values)
            result.push(rows)
        }
        c.end()
        return result
    }
    else {
        const [rows,fields] = await c.query(sql, values)
        c.end()
        return rows
    }
}