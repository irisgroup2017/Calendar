var mysql = require('mysql2/promise'),
log = require('../bin/logger')

exports.q = async function (sql,values) {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
    })
    try {
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
    catch(err) {
        log.logger('error',err)
    }
}