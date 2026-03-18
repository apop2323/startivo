const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, company, email, inquiry_type, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    await db.query(
      `INSERT INTO contact_inquiries (name, company, email, inquiry_type, message) VALUES ($1, $2, $3, $4, $5)`,
      [name, company, email, inquiry_type, message]
    );

    res.json({ success: true, message: 'Wiadomość została wysłana. Odpowiemy w ciągu 24 godzin.' });
  } catch (err) {
    console.error('POST /api/contact error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/contact (admin only)
router.get('/', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const result = await db.query(
      'SELECT * FROM contact_inquiries ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/contact/:id (admin only - update status)
router.put('/:id', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { status } = req.body;
    await db.query('UPDATE contact_inquiries SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
