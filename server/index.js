require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { pool } = require('./db');

// ─── Environment validation ───────────────────────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'ADMIN_PASSWORD'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[Startivo] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[Startivo] Copy .env.example to .env and fill in all values.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(compression());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/events', require('./routes/events'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/subscribe', require('./routes/subscribe'));
app.use('/api/subscribers', require('./routes/subscribe'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/articles', require('./routes/articles'));

// ─── Sitemap ──────────────────────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT slug, updated_at FROM events WHERE status = 'published' ORDER BY date_start ASC`
    );
    const articles = await pool.query(
      `SELECT slug, created_at FROM articles WHERE status = 'published'`
    );

    const baseUrl = 'https://startivo.pl';
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: '1.0' },
      { url: '/kalendarz', changefreq: 'daily', priority: '0.9' },
      { url: '/mapa', changefreq: 'weekly', priority: '0.7' },
      { url: '/artykuly', changefreq: 'weekly', priority: '0.8' },
      { url: '/dodaj', changefreq: 'monthly', priority: '0.6' },
      { url: '/wspolpraca', changefreq: 'monthly', priority: '0.6' },
    ];

    const eventUrls = result.rows.map((e) => ({
      url: `/event/${e.slug}`,
      lastmod: new Date(e.updated_at).toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const articleUrls = articles.rows.map((a) => ({
      url: `/artykuly/${a.slug}`,
      lastmod: new Date(a.created_at).toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.7',
    }));

    const today = new Date().toISOString().split('T')[0];
    const allUrls = [
      ...staticPages.map((p) => ({ ...p, lastmod: today })),
      ...eventUrls,
      ...articleUrls,
    ];

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

// ─── Settings API (public read) ───────────────────────────────────────────────
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value FROM settings');
    const settings = {};
    result.rows.forEach((r) => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (err) {
    res.json({
      hero_image: '/images/hero-ocr.jpg',
      hero_headline_1: 'ZNAJDŹ SWÓJ',
      hero_headline_2: 'NASTĘPNY START.',
      hero_subtitle: 'Największy agregator wydarzeń sportowych w Polsce.',
    });
  }
});

// ─── Robots.txt ───────────────────────────────────────────────────────────────
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

// ─── LLMs.txt ─────────────────────────────────────────────────────────────────
app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# Startivo

> Największy agregator wydarzeń sportowych w Polsce.

Startivo to platforma łącząca sportowców-amatorów z wydarzeniami sportowymi w całej Polsce. Agregujemy biegi uliczne, zawody OCR, Hyrox, triathlon, kolarstwo, trail running i wiele więcej.

## Strony

- [Strona główna](https://startivo.pl/) - Przegląd nadchodzących wydarzeń sportowych
- [Kalendarz startów](https://startivo.pl/kalendarz) - Pełny kalendarz z filtrami
- [Mapa wydarzeń](https://startivo.pl/mapa) - Mapa interaktywna
- [Artykuły](https://startivo.pl/artykuly) - Poradniki i artykuły sportowe
- [Dodaj event](https://startivo.pl/dodaj) - Formularz dodawania wydarzeń
- [Współpraca](https://startivo.pl/wspolpraca) - Informacje dla organizatorów

## Dyscypliny

Bieganie, OCR / Przeszkody, Hyrox, Triathlon, Kolarstwo, Trail Running

## API

- GET /api/events - Lista wydarzeń (parametry: sport_type, voivodeship, page, limit)
- GET /api/events/:slug - Szczegóły wydarzenia
- GET /api/articles - Lista artykułów
- GET /sitemap.xml - Mapa strony XML
`);
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve React build in production ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath, { maxAge: '1y', etag: true, lastModified: true }));
  app.get('*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
}

// ─── DB initialization ────────────────────────────────────────────────────────
async function initDB() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db/schema.sql'), 'utf8');
    // Split on statement boundaries and run each
    const statements = schema.split(';').map((s) => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await pool.query(stmt).catch(() => {}); // ignore "already exists" errors
    }
    console.log('[Startivo] Database schema verified.');
  } catch (err) {
    console.error('[Startivo] DB init error:', err.message);
  }
}

async function seedArticlesIfEmpty() {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO articles (title, slug, excerpt, author_name, sport_type, status, content) VALUES
        (
          'Jak przygotować się do pierwszego Hyrox?',
          'jak-przygotowac-sie-do-hyrox',
          'Hyrox to jedno z najtrudniejszych wyzwań fitness. Oto kompletny plan przygotowań na 12 tygodni.',
          'Redakcja Startivo', 'hyrox', 'published',
          'Hyrox to globalny format zawodów fitness, który zdobywa Polskę w błyskawicznym tempie. Format składa się z 8 stacji ćwiczeń funkcjonalnych, każda poprzedzona kilometrowym biegiem — łącznie 8 km biegu i 8 stacji.\n\nJak przygotować się do pierwszego Hyrox?\n\n1. Zacznij od podstaw biegowych — powinieneś swobodnie przebiegać 10 km przed startem w Hyrox. Treningi biegowe 3x w tygodniu to minimum.\n\n2. Ćwicz stacje funkcjonalne — SkiErg, Sandbag Lunges, Wall Balls, Burpee Broad Jumps, Rowing, Farmer Carry, Sled Push/Pull. Każda z nich wymaga specyficznej techniki.\n\n3. Trenuj zmęczony — kluczem do Hyrox jest umiejętność wykonywania ćwiczeń siłowych po biegu. Łącz treningi: bieg + stacja.\n\n4. Zaplanuj tempo — wielu debiutantów startuje zbyt szybko i kończy ze "ścianą" na ostatnich stacjach.\n\n5. Dieta i regeneracja — w ostatnich 2 tygodniach przed startem skup się na regeneracji. Dobry sen, odpowiednie nawodnienie i węglowodany przed wyścigiem.\n\nCzas ukończenia dla debiutantów: 1:30–2:00h. Nie przejmuj się wynikiem — skończenie pierwszego Hyrox to samo w sobie ogromny sukces!'
        ),
        (
          'OCR dla początkujących — Runmageddon',
          'ocr-dla-poczatkujacych-runmageddon',
          'Błoto, przeszkody, adrenalina. Sprawdź jak przygotować się do pierwszego biegu OCR.',
          'Redakcja Startivo', 'ocr', 'published',
          'Obstacle Course Racing — bieganie z przeszkodami — to jeden z najszybciej rosnących sportów w Polsce. Runmageddon, największa polska seria OCR, przyciąga co roku dziesiątki tysięcy uczestników.\n\nCzego się spodziewać na pierwszym Runmageddon?\n\nTrasa: od 3 km (Rekrut) do 15 km (Open). Przeszkody: wspinaczki na linach, ściany, błotne kanały, druty kolczaste, przenoszenie ciężarów i wiele więcej.\n\nJak się przygotować?\n\n1. Siła ramion i barków — to kluczowe do pokonywania przeszkód. Pull-upy, wiosłowanie, dips.\n\n2. Ogólna wytrzymałość — powinieneś swobodnie biegać na dystansie wybranej trasy.\n\n3. Oswój się z zimną wodą — przeszkody wodne mogą szokować. Zimne prysznice przed startem pomagają.\n\n4. Ubiór — ciemne, przylegające do ciała ubrania. Rękawiczki (opcjonalnie). Buty z dobrą przyczepnością w błocie.\n\n5. Nie bój się pomagać i przyjmować pomocy — OCR to sport drużynowy. Społeczność OCR jest wyjątkowo przyjazna.\n\nKary: za każdą nieukończoną przeszkodę 30 burpees (w kategoriach elitarnych). W open można po prostu ominąć przeszkodę.\n\nPamiętaj: skończenie trasy to sukces. Czas i pozycja są drugorzędne dla debiutantów.'
        ),
        (
          'Triathlon — od czego zacząć?',
          'triathlon-od-czego-zaczac',
          'Pływanie, rower, bieganie — triathlon to kompletne wyzwanie dla amatorów.',
          'Redakcja Startivo', 'triathlon', 'published',
          'Triathlon łączy trzy dyscypliny sportu w jedno nieprzerwane wyzwanie. Na pozór brzmi to niedostępnie, ale każdego roku tysiące amatorów z Polski staje na starcie po raz pierwszy.\n\nDystanse triathlonu:\n\n• Sprint: 750m pływania + 20km rower + 5km bieg — idealny start\n• Olimpijski: 1500m + 40km + 10km\n• Half Ironman (70.3): 1900m + 90km + 21km\n• Ironman: 3800m + 180km + 42km — cel zaawansowanych\n\nJak zaplanować pierwszy sezon?\n\n1. Wybierz dystans Sprint — realistyczny cel na debiut przy 4–6 miesiącach przygotowań.\n\n2. Zadbaj o sprzęt — rower szosowy lub triatlonowy (wystarczy zwykły rower na początek), kombinezon triathlonowy lub strój kąpielowy, kask, okulary pływackie.\n\n3. Naucz się techniki pływackiej — to najważniejsza inwestycja. Lekcje pływania dla dorosłych.\n\n4. Trening "cegła" (brick training) — trenuj rower + bieg bezpośrednio po sobie. Uczysz nogi przechodzenia między dyscyplinami.\n\n5. Strefa zmian (T1, T2) — warto przećwiczyć zmianę ze stroju pływackiego na rower i z roweru na bieg.\n\nW Polsce mamy świetne warunki do triathlonu — jeziora Mazur, zatoka gdańska, zbiorniki wodne po całym kraju. Startivo pomoże Ci znaleźć idealne zawody!'
        )
      `);
      console.log('[Startivo] Articles seeded.');
    }
  } catch (err) {
    console.error('[Startivo] Article seeding error:', err.message);
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`[Startivo] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  await initDB();
  await seedArticlesIfEmpty();
});

module.exports = app;
