require('dotenv').config();
const sql = require('mssql');

// Havuz oluştur ama connect’i burada başlatma, index.js’te başlatacağız
const pool = new sql.ConnectionPool(process.env.MSSQL_CONNECTION_STRING);
module.exports = { sql, pool };
