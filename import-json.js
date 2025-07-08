// import-json.js
// Node 18+ ve mssql --legacy-peer-deps ile yüklü oldu varsayılır

const fs = require('fs/promises');
const path = require('path');
const { ConnectionPool, NVarChar } = require('mssql');

// MSSQL_CONNECTION_STRING ortam değişkeni setli olmalı
const connStr = process.env.MSSQL_CONNECTION_STRING;
if (!connStr) {
  console.error('⚠️  Lütfen MSSQL_CONNECTION_STRING ortam değişkenini ayarlayın.');
  process.exit(1);
}

async function main() {
  // JSON dosyasını oku
  const file = path.join(__dirname, 'backend', 'data', 'flashcards-100.json');
  const raw = await fs.readFile(file, 'utf-8');
  const cards = JSON.parse(raw);

  // MSSQL’e bağlan
  const pool = new ConnectionPool(connStr);
  await pool.connect();
  console.log(`🔄 Toplam ${cards.length} kart verisini ekliyor…`);

  for (let i = 0; i < cards.length; i++) {
    const { term, synonym, translation, example, exampleTranslation } = cards[i];

    // Her döngüde yeni request oluştur
    const req = pool.request()
        .input('term', NVarChar(100), term)
        .input('synonym', NVarChar(100), synonym)
        .input('translation', NVarChar(100), translation)
        .input('example', NVarChar(500), example)
        .input('exampleTranslation', NVarChar(500), exampleTranslation);

    await req.query(
        `INSERT INTO Words (term, synonym, translation, example, exampleTranslation)
       VALUES (@term, @synonym, @translation, @example, @exampleTranslation)`
    );

    process.stdout.write(`\r${i + 1}/${cards.length} eklendi`);
  }

  console.log('\n✅ Tüm kartlar başarıyla eklendi.');
  await pool.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
