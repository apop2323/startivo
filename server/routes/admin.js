const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || 'startivo-secret';

// ─── In-memory rate limiter (5 attempts / 15 min per IP) ─────────────────────
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const now = Date.now();
  const WINDOW = 15 * 60 * 1000;
  const MAX = 5;

  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + WINDOW };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW;
  }

  if (record.count >= MAX) {
    const retryAfter = Math.ceil((record.resetAt - now) / 1000);
    return res.status(429).json({
      error: 'Zbyt wiele prób logowania. Spróbuj ponownie za 15 minut.',
      code: 'RATE_LIMITED',
      retryAfter,
    });
  }

  record.count++;
  loginAttempts.set(ip, record);
  next();
}

// ─── JWT auth middleware ──────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = auth.slice(7);
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

// ─── Multer: upload article images ───────────────────────────────────────────
const uploadDir = path.join(__dirname, '../../client/public/images/articles');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `article-${Date.now()}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// ─── POST /api/admin/login ────────────────────────────────────────────────────
router.post('/login', rateLimitLogin, (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password required' });

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Nieprawidłowe hasło' });
  }

  const ip = req.ip || 'unknown';
  loginAttempts.delete(ip); // clear on success

  const token = jwt.sign({ role: 'admin', iat: Date.now() }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, token });
});

// ─── POST /api/admin/upload ───────────────────────────────────────────────────
router.post('/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/images/articles/${req.file.filename}`;
  res.json({ url });
});

// ─── GET /api/admin/events/pending ───────────────────────────────────────────
router.get('/events/pending', requireAuth, async (req, res) => {
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
router.get('/events/all', requireAuth, async (req, res) => {
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
router.put('/events/:id/approve', requireAuth, async (req, res) => {
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
router.put('/events/:id/reject', requireAuth, async (req, res) => {
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
router.put('/events/:id/featured', requireAuth, async (req, res) => {
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

// ─── PUT /api/admin/events/:id ────────────────────────────────────────────────
router.put('/events/:id', requireAuth, async (req, res) => {
  try {
    const fields = req.body;
    const keys = Object.keys(fields).filter(k => k !== 'id');
    if (!keys.length) return res.status(400).json({ error: 'No fields' });
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const result = await db.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...keys.map((k) => fields[k]), req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── DELETE /api/admin/events/:id ────────────────────────────────────────────
router.delete('/events/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Articles admin ───────────────────────────────────────────────────────────
router.get('/articles', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM articles ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/articles', requireAuth, async (req, res) => {
  try {
    const { title, slug, content, excerpt, author_name, sport_type, status, image_url } = req.body;
    const result = await db.query(
      `INSERT INTO articles (title, slug, content, excerpt, author_name, sport_type, status, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, slug, content, excerpt, author_name, sport_type, status || 'draft', image_url || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/articles/:id', requireAuth, async (req, res) => {
  try {
    const fields = req.body;
    const keys = Object.keys(fields).filter(k => k !== 'id');
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

router.delete('/articles/:id', requireAuth, async (req, res) => {
  try {
    await db.query('DELETE FROM articles WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Settings admin ───────────────────────────────────────────────────────────
router.get('/settings', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach((r) => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/settings', requireAuth, async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.query(
        `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, value]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [events, pending, articles, subscribers] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM events WHERE status = 'published'`),
      db.query(`SELECT COUNT(*) FROM events WHERE status = 'pending'`),
      db.query(`SELECT COUNT(*) FROM articles WHERE status = 'published'`),
      db.query(`SELECT COUNT(*) FROM subscribers`),
    ]);
    res.json({
      published_events: parseInt(events.rows[0].count),
      pending_events: parseInt(pending.rows[0].count),
      published_articles: parseInt(articles.rows[0].count),
      subscribers: parseInt(subscribers.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Subscribers ──────────────────────────────────────────────────────────────
router.get('/subscribers', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM subscribers ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── Contact inquiries ────────────────────────────────────────────────────────
router.get('/inquiries', requireAuth, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM contact_inquiries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/inquiries/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    await db.query('UPDATE contact_inquiries SET status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
