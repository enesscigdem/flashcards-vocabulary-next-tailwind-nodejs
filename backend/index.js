const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const wordsRouter = require('./routes/words');

async function start() {
  try {
    // MSSQL’e bağlanmayı bekle
    await pool.connect();
    console.log('✅ MSSQL connected');

    const app = express();
    app.use(cors());
    app.use(express.json());

    // /api/words rotası
    app.use('/api/words', wordsRouter);

    // 404 handler
    app.use((req, res) => res.status(404).json({ error: 'Not found' }));

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Backend listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server start error:', err);
  }
}

start();
