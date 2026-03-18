-- Startivo Database Schema
-- Run: psql $DATABASE_URL -f server/db/schema.sql

CREATE TABLE IF NOT EXISTS events (
  id                    SERIAL PRIMARY KEY,
  name                  VARCHAR(255) NOT NULL,
  slug                  VARCHAR(300) UNIQUE,
  sport_type            VARCHAR(50),
  date_start            DATE NOT NULL,
  date_end              DATE,
  city                  VARCHAR(100) NOT NULL,
  voivodeship           VARCHAR(100) NOT NULL,
  description           TEXT,
  distance              VARCHAR(100),
  difficulty            VARCHAR(20),
  max_participants      INTEGER,
  price                 INTEGER,
  registration_url      VARCHAR(500),
  registration_deadline DATE,
  organizer_name        VARCHAR(255),
  organizer_email       VARCHAR(255),
  event_website         VARCHAR(500),
  image_url             VARCHAR(500),
  status                VARCHAR(20) DEFAULT 'pending',
  featured              BOOLEAN DEFAULT false,
  view_count            INTEGER DEFAULT 0,
  lat                   DECIMAL(10, 8),
  lng                   DECIMAL(11, 8),
  created_at            TIMESTAMP DEFAULT NOW(),
  updated_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_sport_type ON events(sport_type);
CREATE INDEX IF NOT EXISTS idx_events_date_start ON events(date_start);
CREATE INDEX IF NOT EXISTS idx_events_voivodeship ON events(voivodeship);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

CREATE TABLE IF NOT EXISTS subscribers (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR(255) UNIQUE NOT NULL,
  region              VARCHAR(100),
  confirmed           BOOLEAN DEFAULT false,
  unsubscribe_token   VARCHAR(64) UNIQUE,
  created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_alerts (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
  email       VARCHAR(255) NOT NULL,
  days_before INTEGER DEFAULT 7,
  created_at  TIMESTAMP DEFAULT NOW(),
  notified    BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255),
  company      VARCHAR(255),
  email        VARCHAR(255),
  inquiry_type VARCHAR(50),
  message      TEXT,
  created_at   TIMESTAMP DEFAULT NOW(),
  status       VARCHAR(20) DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS articles (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  slug        VARCHAR(300) UNIQUE,
  content     TEXT,
  excerpt     VARCHAR(500),
  author_name VARCHAR(255),
  sport_type  VARCHAR(50),
  status      VARCHAR(20) DEFAULT 'draft',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
