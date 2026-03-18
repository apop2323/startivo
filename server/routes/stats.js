const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/stats
router.get('/', async (req, res) => {
  try {
    const [totalEvents, totalRegions, sportCategories, eventsThisMonth] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM events WHERE status = 'published'`),
      db.query(`SELECT COUNT(DISTINCT voivodeship) FROM events WHERE status = 'published'`),
      db.query(`SELECT COUNT(DISTINCT sport_type) FROM events WHERE status = 'published'`),
      db.query(`SELECT COUNT(*) FROM events WHERE status = 'published' AND date_trunc('month', date_start) = date_trunc('month', CURRENT_DATE)`),
    ]);

    res.json({
      total_events: parseInt(totalEvents.rows[0].count),
      total_regions: parseInt(totalRegions.rows[0].count),
      sport_categories: parseInt(sportCategories.rows[0].count),
      events_this_month: parseInt(eventsThisMonth.rows[0].count),
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/by-sport
router.get('/by-sport', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT sport_type, COUNT(*) as count FROM events WHERE status = 'published' GROUP BY sport_type ORDER BY count DESC`
    );
    const bySport = {};
    result.rows.forEach((row) => {
      bySport[row.sport_type] = parseInt(row.count);
    });
    res.json(bySport);
  } catch (err) {
    console.error('GET /api/stats/by-sport error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/stats/admin (full stats for admin panel)
router.get('/admin', async (req, res) => {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [byStatus, bySport, byMonth, subscribers, inquiries] = await Promise.all([
      db.query(`SELECT status, COUNT(*) as count FROM events GROUP BY status`),
      db.query(`SELECT sport_type, COUNT(*) as count FROM events WHERE status = 'published' GROUP BY sport_type ORDER BY count DESC`),
      db.query(`SELECT DATE_TRUNC('month', date_start) as month, COUNT(*) as count FROM events WHERE status = 'published' GROUP BY month ORDER BY month DESC LIMIT 12`),
      db.query(`SELECT COUNT(*) FROM subscribers`),
      db.query(`SELECT COUNT(*) FROM contact_inquiries WHERE status = 'new'`),
    ]);

    res.json({
      by_status: byStatus.rows,
      by_sport: bySport.rows,
      by_month: byMonth.rows,
      total_subscribers: parseInt(subscribers.rows[0].count),
      new_inquiries: parseInt(inquiries.rows[0].count),
    });
  } catch (err) {
    console.error('GET /api/stats/admin error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
