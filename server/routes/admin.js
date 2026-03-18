const express = require('express');
const router = express.Router();
const db = require('../db');

function checkAdmin(req, res, next) {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// GET /api/admin/events/pending
router.get('/events/pending', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM events WHERE status = 'pending' ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/events/all
router.get('/events/all', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM events ORDER BY created_at DESC LIMIT 100`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/events/:id/approve
router.put('/events/:id/approve', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE events SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/events/:id/reject
router.put('/events/:id/reject', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE events SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
