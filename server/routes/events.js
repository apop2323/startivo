const express = require('express');
const router = express.Router();
const db = require('../db');

// Slugify Polish text
function slugify(text) {
  const map = {
    ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n',
    ó: 'o', ś: 's', ź: 'z', ż: 'z',
    Ą: 'a', Ć: 'c', Ę: 'e', Ł: 'l', Ń: 'n',
    Ó: 'o', Ś: 's', Ź: 'z', Ż: 'z',
  };
  return text
    .split('')
    .map((c) => map[c] || c)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const {
      sport_type, voivodeship, date_from, date_to,
      search, page = 1, limit = 20, status = 'published'
    } = req.query;

    const conditions = ['e.status = $1'];
    const params = [status];
    let paramIdx = 2;

    if (sport_type) {
      conditions.push(`e.sport_type = $${paramIdx++}`);
      params.push(sport_type);
    }
    if (voivodeship) {
      conditions.push(`e.voivodeship = $${paramIdx++}`);
      params.push(voivodeship);
    }
    if (date_from) {
      conditions.push(`e.date_start >= $${paramIdx++}`);
      params.push(date_from);
    }
    if (date_to) {
      conditions.push(`e.date_start <= $${paramIdx++}`);
      params.push(date_to);
    }
    if (search) {
      conditions.push(`(e.name ILIKE $${paramIdx} OR e.city ILIKE $${paramIdx} OR e.description ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const where = conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await db.query(
      `SELECT COUNT(*) FROM events e WHERE ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      `SELECT * FROM events e WHERE ${where} ORDER BY e.date_start ASC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      events: result.rows,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('GET /api/events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/featured
router.get('/featured', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM events WHERE featured = true AND status = 'published' AND date_start >= CURRENT_DATE ORDER BY date_start ASC LIMIT 6`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/events/featured error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let result;

    // Try slug first
    result = await db.query(
      `SELECT * FROM events WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    // Fallback to id if numeric
    if (result.rows.length === 0 && !isNaN(slug)) {
      result = await db.query(
        `SELECT * FROM events WHERE id = $1 AND status = 'published'`,
        [parseInt(slug)]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = result.rows[0];

    // Get similar events
    const similar = await db.query(
      `SELECT * FROM events WHERE sport_type = $1 AND id != $2 AND status = 'published' AND date_start >= CURRENT_DATE ORDER BY date_start ASC LIMIT 3`,
      [event.sport_type, event.id]
    );

    res.json({ event, similar: similar.rows });
  } catch (err) {
    console.error('GET /api/events/:slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const {
      name, sport_type, date_start, date_end, city, voivodeship,
      description, distance, difficulty, max_participants, price,
      registration_url, registration_deadline, organizer_name,
      organizer_email, event_website, image_url
    } = req.body;

    if (!name || !date_start || !city || !voivodeship) {
      return res.status(400).json({ error: 'Missing required fields: name, date_start, city, voivodeship' });
    }

    // Generate unique slug
    let baseSlug = slugify(name + '-' + new Date(date_start).getFullYear());
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.query('SELECT id FROM events WHERE slug = $1', [slug]);
      if (existing.rows.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const result = await db.query(
      `INSERT INTO events (name, slug, sport_type, date_start, date_end, city, voivodeship, description, distance, difficulty, max_participants, price, registration_url, registration_deadline, organizer_name, organizer_email, event_website, image_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,'pending') RETURNING *`,
      [name, slug, sport_type, date_start, date_end || null, city, voivodeship, description, distance, difficulty, max_participants || null, price || null, registration_url, registration_deadline || null, organizer_name, organizer_email, event_website, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/events/:id (admin only)
router.put('/:id', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { id } = req.params;
    const fields = req.body;
    const keys = Object.keys(fields);
    if (keys.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const values = keys.map((k) => fields[k]);

    const result = await db.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('PUT /api/events/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/events/:id (admin only)
router.delete('/:id', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/events/:id error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events/:id/view
router.post('/:id/view', async (req, res) => {
  try {
    await db.query('UPDATE events SET view_count = view_count + 1 WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/events/:id/alert
router.post('/:id/alert', async (req, res) => {
  try {
    const { email, days_before = 7 } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    await db.query(
      'INSERT INTO event_alerts (event_id, email, days_before) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [req.params.id, email, days_before]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('POST /api/events/:id/alert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
