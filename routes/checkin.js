const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/mysql');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

router.post('/', authMiddleware, async (req, res) => {
  const userId = req.userId;
  const today = new Date().toISOString().split('T')[0];

  try {
    // SQLite 使用 INSERT OR IGNORE 代替 ON DUPLICATE KEY UPDATE
    await db.query(
      'INSERT OR IGNORE INTO checkin_records (user_id, checkin_date) VALUES (?, ?)',
      [userId, today]
    );

    await db.query(
      'UPDATE users SET last_checkin_date = ? WHERE id = ?',
      [today, userId]
    );

    res.json({ success: true, message: '签到成功' });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const [records] = await db.query(
      'SELECT checkin_date, created_at FROM checkin_records WHERE user_id = ? ORDER BY checkin_date DESC LIMIT 30',
      [userId]
    );

    res.json({ records });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
