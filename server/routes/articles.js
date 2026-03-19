const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/articles
router.get('/', async (req, res) => {
  try {
    const { sport_type, limit = 20, page = 1 } = req.query;
    const conditions = [`status = 'published'`];
    const params = [];
    let idx = 1;

    if (sport_type) {
      conditions.push(`sport_type = $${idx++}`);
      params.push(sport_type);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = conditions.join(' AND ');

    const [countResult, result] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM articles WHERE ${where}`, params),
      db.query(
        `SELECT id, title, slug, excerpt, author_name, sport_type, status, created_at
         FROM articles WHERE ${where} ORDER BY created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, parseInt(limit), offset]
      ),
    ]);

    res.json({
      articles: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
    });
  } catch (err) {
    console.error('GET /api/articles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/articles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    let result = await db.query(
      `SELECT * FROM articles WHERE slug = $1 AND status = 'published'`,
      [slug]
    );

    if (!result.rows.length && !isNaN(slug)) {
      result = await db.query(
        `SELECT * FROM articles WHERE id = $1 AND status = 'published'`,
        [parseInt(slug)]
      );
    }

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const article = result.rows[0];

    // Related events of same sport
    const related = await db.query(
      `SELECT id, name, slug, city, date_start, sport_type, difficulty, price
       FROM events WHERE sport_type = $1 AND status = 'published' AND date_start >= CURRENT_DATE
       ORDER BY date_start ASC LIMIT 3`,
      [article.sport_type]
    );

    res.json({ article, related: related.rows });
  } catch (err) {
    console.error('GET /api/articles/:slug error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
