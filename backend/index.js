const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');

const cors = require('cors');
const wordsRouter = require('./routes/words');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/words', wordsRouter);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
