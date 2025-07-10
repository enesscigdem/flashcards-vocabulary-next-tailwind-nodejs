// routes/words.js
const express = require('express');
const router = express.Router();
const { sql, pool } = require('../db');

// 1) Toggle favorite
router.post('/:id/favorite', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { isFavourite } = req.body;
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('fav', sql.Bit, isFavourite)
        .query('UPDATE dbo.Words SET IsFavourite = @fav WHERE id = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Word not found' });
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2) Toggle learned
router.post('/:id/learn', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { learned } = req.body; // true/false
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('val', sql.Bit, learned)
        .query('UPDATE dbo.Words SET learned = @val WHERE id = @id');
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Word not found' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('❌ SQL Hatası (learn toggle):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// 3) Record time spent
router.post('/:id/time', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { seconds } = req.body;
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('sec', sql.Int, seconds)
        .query(`
        UPDATE dbo.Words
        SET TimeSpent = TimeSpent + @sec
        WHERE id = @id
      `);
    if (result.rowsAffected[0] === 0) return res.status(404).json({ error: 'Word not found' });
    return res.sendStatus(204);
  } catch (err) {
    console.error('❌ SQL Hatası (time):', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 4) List all
router.get('/', async (req, res) => {
  try {
    const result = await pool.request()
        .query(`
        SELECT 
          id, term, synonym, translation, example, exampleTranslation,
          learned, IsFavourite, TimeSpent
        FROM dbo.Words
      `);
    const payload = result.recordset.map(r => ({
      id:           r.id,
      term:         r.term,
      synonym:      r.synonym,
      translation:  r.translation,
      example:      r.example,
      exampleTranslation: r.exampleTranslation,
      learned:      Boolean(r.learned),
      isFavourite:  Boolean(r.IsFavourite),
      timeSpent:    r.TimeSpent
    }));
    return res.json(payload);
  } catch (err) {
    console.error('❌ SQL Hatası (list):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

// 5) Single word
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
        SELECT 
          id, term, synonym, translation, example, exampleTranslation,
          learned, IsFavourite, TimeSpent
        FROM dbo.Words
        WHERE id = @id
      `);
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }
    const r = result.recordset[0];
    return res.json({
      id:           r.id,
      term:         r.term,
      synonym:      r.synonym,
      translation:  r.translation,
      example:      r.example,
      exampleTranslation: r.exampleTranslation,
      learned:      Boolean(r.learned),
      isFavourite:  Boolean(r.IsFavourite),
      timeSpent:    r.TimeSpent
    });
  } catch (err) {
    console.error('❌ SQL Hatası (get by id):', err.message);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
});

module.exports = router;
