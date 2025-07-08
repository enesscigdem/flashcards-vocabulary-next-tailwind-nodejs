// backend/db.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const sql = require('mssql');

const pool = new sql.ConnectionPool(process.env.MSSQL_CONNECTION_STRING);
module.exports = { sql, pool };
