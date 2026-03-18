const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// POST /api/subscribe
router.post('/', async (req, res) => {
  try {
    const { email, region } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' });
    }

    const token = crypto.randomBytes(32).toString('hex');

    await db.query(
      `INSERT INTO subscribers (email, region, unsubscribe_token) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET region = EXCLUDED.region`,
      [email.toLowerCase().trim(), region || null, token]
    );

    res.json({ success: true, message: 'Zapisano! Będziesz pierwszy/a o nowych startach.' });
  } catch (err) {
    console.error('POST /api/subscribe error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/subscribers (admin only)
router.get('/', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await db.query('SELECT id, email, region, confirmed, created_at FROM subscribers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
