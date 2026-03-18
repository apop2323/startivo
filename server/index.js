require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const { pool } = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/subscribe', require('./routes/subscribe'));
app.use('/api/subscribers', require('./routes/subscribe'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));

// Sitemap
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT slug, updated_at FROM events WHERE status = 'published' ORDER BY date_start ASC`
    );

    const baseUrl = 'https://startivo.pl';
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/kalendarz', changefreq: 'daily', priority: '0.9' },
      { url: '/mapa', changefreq: 'weekly', priority: '0.7' },
      { url: '/dodaj', changefreq: 'monthly', priority: '0.6' },
      { url: '/wspolpraca', changefreq: 'monthly', priority: '0.6' },
      { url: '/polityka-prywatnosci', changefreq: 'yearly', priority: '0.3' },
    ];

    const eventUrls = result.rows.map((e) => ({
      url: `/event/${e.slug}`,
      lastmod: new Date(e.updated_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const allUrls = [...staticPages.map(p => ({ ...p, lastmod: new Date().toISOString().split('T')[0] })), ...eventUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((u) => `  <url>
    <loc>${baseUrl}${u.url}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error:', err);
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://startivo.pl/sitemap.xml`);
});

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath, {
    maxAge: '1y',
    etag: true,
    lastModified: true,
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Startivo server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
