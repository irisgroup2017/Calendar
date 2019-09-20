var mysql = require('mysql2/promise'),
log = require('../bin/logger')

exports.q = async function (sql,values) {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
    })
    /*if (values.indexOf(NaN)) {
        return
    }
    */
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
        switch (err.errno) {
            case 1064:
                log.logger('error','syntax error')
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                break
            case 1062:
                log.logger('error','duplicate entry')
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                break
            default:
                log.logger('error',err)
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                break
        }
        c.end()
    }
}