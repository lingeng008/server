const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

let db = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: path.join(__dirname, 'alive.db'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        openid TEXT UNIQUE NOT NULL,
        nickname TEXT,
        emergency_email TEXT,
        last_checkin_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS checkin_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        checkin_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, checkin_date)
      );

      CREATE INDEX IF NOT EXISTS idx_last_checkin ON users(last_checkin_date);
      CREATE INDEX IF NOT EXISTS idx_emergency_email ON users(emergency_email);
      CREATE INDEX IF NOT EXISTS idx_checkin_date ON checkin_records(checkin_date);
    `);
  }
  return db;
}

module.exports = { query: async (sql, params) => {
  const db = await getDb();
  if (sql.trim().toUpperCase().startsWith('SELECT')) {
    const rows = await db.all(sql, params);
    return [rows];
  } else {
    const result = await db.run(sql, params);
    return [result];
  }
}};
