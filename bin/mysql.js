const mysql = require('mysql2')
const log = require('../bin/logger')
require("dotenv").config()
const dbconfig = {
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASSWORD,
 database: process.env.DB_NAME,
 waitForConnections: false,
 connectionLimit: 10,
 queueLimit: 0
}

const pool = mysql.createPool(dbconfig)
const getConnection = () => {
 return new Promise((resolve, reject) => {
 pool.getConnection((err, connection) => {
   if (err) reject(err)
   //console.log("MySQL pool connected: threadId " + connection.threadId)
   const query = (sql, binding) => {
     return new Promise((resolve, reject) => {
        connection.query(sql, binding, (err, result) => {
          if (err) reject(err)
          resolve(result)
          })
        })
      }
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err)
          //console.log("MySQL pool released: threadId " + connection.threadId)
          resolve(connection.release())
        })
      }
      resolve({ query, release })
    })
  })
}
const query = (sql, binding) => {
 return new Promise((resolve, reject) => {
   pool.query(sql, binding, (err, result, fields) => {
     if (err) reject(err)
     resolve(result)
   })
 })
}

//direct query
exports.e = query
//pool query
exports.q = async function (sql,values) {
 const conn = await getConnection()
    try {
        if (Array.isArray(sql)) {
            result = []
            for (i=0; i<sql.length; i++) {
                let rows = await conn.query(sql[i], values)
                result.push(rows)
            }
            await conn.release()
            return result
        }
        else {
            const result = await conn.query(sql, values)
            await conn.release()
            return result
        }
    }
    catch(err) {
        switch (err.errno) {
            case 1064:
                log.logger('error','syntax error')
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                log.logger('error',err.sqlMessage)
                break
            case 1062:
                log.logger('error','duplicate entry')
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                log.logger('error',err.sqlMessage)
                break
            default:
                log.logger('error',err)
                log.logger('error','query: '+ sql)
                log.logger('error','value: '+ values)
                break
        }
    }
    await conn.release()
}