const express = require('express');
const router = express.Router();
const { sql, pool } = require('../db');

// 1) Öğrendi olarak işaretleme (önce tanımla!)
router.post('/:id/learn', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`⏳ POST /api/words/${id}/learn`);
  try {
    // Tek satır sorgu - multiline indent sorununu önler
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE dbo.Words SET learned = 1 WHERE id = @id');

    console.log('▶️ rowsAffected:', result.rowsAffected[0]);
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }
    return res.sendStatus(204);
  } catch (err) {
    console.error('❌ SQL Hatası (learn):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// 2) Tüm kelimeler
router.get('/', async (req, res) => {
  console.log('GET /api/words');
  try {
    const result = await pool.request()
        .query('SELECT id, term, synonym, translation, example, exampleTranslation, learned FROM dbo.Words');
    return res.json(result.recordset);
  } catch (err) {
    console.error('❌ SQL Hatası (list):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// 3) Tek kelime
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`GET /api/words/${id}`);
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT id, term, synonym, translation, example, exampleTranslation, learned FROM dbo.Words WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('❌ SQL Hatası (get by id):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
