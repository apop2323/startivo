const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const db = require('../db');

// ─── Rate limiter for login (5 attempts per 15 min per IP) ───────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.',
    code: 'RATE_LIMITED',
  },
  skipSuccessfulRequests: true,
});

// ─── Admin auth middleware ────────────────────────────────────────────────────
function checkAdmin(req, res, next) {
  const pw =
    req.headers['x-admin-password'] ||
    req.headers['authorization']?.replace('Bearer ', '');
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', loginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  if (password === process.env.ADMIN_PASSWORD) {
    // Return a simple token (the password itself, for MVP)
    res.json({ success: true, token: process.env.ADMIN_PASSWORD });
  } else {
    res.status(401).json({ error: 'Nieprawidłowe hasło' });
  }
});

// ─── GET /api/admin/events/pending ───────────────────────────────────────────
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

// ─── GET /api/admin/events/all ────────────────────────────────────────────────
router.get('/events/all', checkAdmin, async (req, res) => {
  try {
    const { search, sport_type } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search) {
      conditions.push(`(name ILIKE $${idx} OR city ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (sport_type) {
      conditions.push(`sport_type = $${idx}`);
      params.push(sport_type);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await db.query(
      `SELECT * FROM events ${where} ORDER BY created_at DESC LIMIT 200`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /api/admin/events/:id/approve ───────────────────────────────────────
router.put('/events/:id/approve', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE events SET status = 'published', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /api/admin/events/:id/reject ────────────────────────────────────────
router.put('/events/:id/reject', checkAdmin, async (req, res) => {
  try {
    const result = await db.query(
      `UPDATE events SET status = 'rejected', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PUT /api/admin/events/:id/featured ──────────────────────────────────────
router.put('/events/:id/featured', checkAdmin, async (req, res) => {
  try {
    const { featured } = req.body;
    const result = await db.query(
      `UPDATE events SET featured = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [!!featured, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Articles admin ───────────────────────────────────────────────────────────
router.get('/articles', checkAdmin, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/articles', checkAdmin, async (req, res) => {
  try {
    const { title, slug, content, excerpt, author_name, sport_type, status } = req.body;
    const result = await db.query(
      `INSERT INTO articles (title, slug, content, excerpt, author_name, sport_type, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, slug, content, excerpt, author_name, sport_type, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/articles/:id', checkAdmin, async (req, res) => {
  try {
    const fields = req.body;
    const keys = Object.keys(fields);
    if (!keys.length) return res.status(400).json({ error: 'No fields' });
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await db.query(
      `UPDATE articles SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map((k) => fields[k]), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/articles/:id', checkAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
