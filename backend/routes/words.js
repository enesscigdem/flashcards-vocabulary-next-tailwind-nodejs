// backend/routes/words.js
const express = require('express');
const router = express.Router();
const { sql, pool } = require('../db');

// 1) Öğrendi olarak işaretleme
router.post('/:id/learn', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`⏳ POST /api/words/${id}/learn`);
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE Words SET learned = 1 WHERE id = @id');

    console.log('▶️ rowsAffected:', result.rowsAffected);
    if (!result.rowsAffected[0]) {
      console.warn(`⚠️ Word ${id} bulunamadı.`);
      return res.status(404).json({ error: 'Word not found' });
    }
    console.log(`✅ Word ${id} öğrenildi olarak işaretlendi.`);
    return res.sendStatus(204);
  } catch (err) {
    console.error('❌ SQL Hatası (learn):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// 2) Tüm kelimeleri getir
router.get('/', async (req, res) => {
  console.log('GET /api/words');
  try {
    const result = await pool.request().query(`
      SELECT id, term, synonym, translation, example, exampleTranslation, learned
      FROM Words
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.error('❌ SQL Hatası (list):', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3) Tek bir kelimeyi getir
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`GET /api/words/${id}`);
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
        SELECT id, term, synonym, translation, example, exampleTranslation, learned
        FROM Words
        WHERE id = @id
      `);
    if (!result.recordset.length) {
      console.warn(`⚠️ Word ${id} bulunamadı.`);
      return res.status(404).json({ error: 'Word not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ SQL Hatası (get by id):', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
