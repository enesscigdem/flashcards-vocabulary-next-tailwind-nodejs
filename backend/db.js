require('dotenv').config();
const sql = require('mssql');

const pool = new sql.ConnectionPool(process.env.MSSQL_CONNECTION_STRING);

pool.connect()
  .then(() => {
    console.log('Connected to MSSQL');
  })
  .catch((err) => {
    console.error('MSSQL connection error:', err);
  });

module.exports = { sql, pool };
