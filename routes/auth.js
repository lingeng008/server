const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('../db/mysql');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

router.post('/login', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  try {
    let openid;

    // 测试模式：如果没有配置微信 AppID，使用模拟登录
    if (!process.env.WECHAT_APPID || !process.env.WECHAT_SECRET) {
      console.log('Test mode: Using simulated login');
      openid = 'test_user_fixed'; // 固定的测试用户ID
    } else {
      // 正式模式：调用微信接口
      const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: process.env.WECHAT_APPID,
          secret: process.env.WECHAT_SECRET,
          js_code: code,
          grant_type: 'authorization_code'
        }
      });

      const { openid: wxOpenid, errcode } = response.data;

      if (errcode) {
        return res.status(400).json({ error: 'WeChat login failed', errcode });
      }

      openid = wxOpenid;
    }

    const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);

    let user;
    if (rows.length === 0) {
      const [result] = await db.query(
        'INSERT INTO users (openid) VALUES (?)',
        [openid]
      );
      user = { id: result.lastID, openid, nickname: null, emergency_email: null };
    } else {
      user = rows[0];
    }

    const token = jwt.sign({ userId: user.id, openid }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        emergency_email: user.emergency_email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
