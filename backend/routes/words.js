const express = require('express');
const router = express.Router();
const { sql, pool } = require('../db');

// GET /api/words - retrieve all words
router.get('/', async (req, res) => {
  try {
    const result = await pool.request().query('SELECT * FROM Words');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching words:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/words/:id - retrieve a single word by id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT * FROM Words WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Word not found' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Error fetching word by id:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
