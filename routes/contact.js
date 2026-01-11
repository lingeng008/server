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
  const { email } = req.body;
  const userId = req.userId;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    await db.query(
      'UPDATE users SET emergency_email = ? WHERE id = ?',
      [email, userId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Contact update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
