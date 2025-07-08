// backend/index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const wordsRouter = require('./routes/words');

const app = express();

app.use(cors());
app.use(express.json());

// Tüm /api/words istekleri burada ele alınacak
app.use('/api/words', wordsRouter);

// 404 handler (diğer tüm isteklere)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
