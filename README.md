# Startivo — Instrukcja wdrożenia na Hostinger VPS

**Startivo** — największy agregator wydarzeń sportowych w Polsce.
Tagline: *Jedno miejsce. Wszystkie starty.*

---

## Wymagania

- Ubuntu 24.04 LTS (VPS)
- Node.js 18+
- PostgreSQL 14+
- PM2
- Nginx
- Certbot (SSL)
- Domena startivo.pl skierowana na IP serwera

---

## Krok 1 — Połączenie z VPS

Zaloguj się przez terminal Hostingera (lub SSH):

```bash
ssh root@TWOJE_IP_VPS
```

---

## Krok 2 — Instalacja Node.js, PostgreSQL, PM2, Nginx

```bash
# Aktualizacja systemu
apt update && apt upgrade -y

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Sprawdź wersje
node -v   # powinno być 20.x
npm -v

# PM2 globalnie
npm install -g pm2

# PostgreSQL
apt install -y postgresql postgresql-contrib

# Nginx
apt install -y nginx

# Certbot (SSL)
apt install -y certbot python3-certbot-nginx

# Sprawdź status PostgreSQL
systemctl status postgresql
systemctl enable postgresql
systemctl start postgresql
```

---

## Krok 3 — Klonowanie repozytorium z GitHub

```bash
# Zainstaluj git (jeśli nie ma)
apt install -y git

# Sklonuj repo
git clone https://github.com/TWOJ_USERNAME/startivo.git /var/www/startivo
cd /var/www/startivo
```

---

## Krok 4 — Konfiguracja bazy danych PostgreSQL

```bash
# Przełącz się na użytkownika postgres
sudo -u postgres psql

# W konsoli psql:
CREATE DATABASE startivo_db;
CREATE USER startivo_user WITH ENCRYPTED PASSWORD 'SILNE_HASLO_TUTAJ';
GRANT ALL PRIVILEGES ON DATABASE startivo_db TO startivo_user;
ALTER DATABASE startivo_db OWNER TO startivo_user;
\q
```

---

## Krok 5 — Konfiguracja .env

```bash
cp .env.example .env
nano .env
```

Uzupełnij zmienne:

```env
DATABASE_URL=postgresql://startivo_user:SILNE_HASLO_TUTAJ@localhost:5432/startivo_db
ADMIN_PASSWORD=TWOJE_BEZPIECZNE_HASLO_ADMINA
PORT=3001
NODE_ENV=production
```

---

## Krok 6 — Tworzenie bazy danych i uruchomienie migracji

```bash
# Załaduj zmienne środowiskowe
export $(cat .env | xargs)

# Utwórz tabele
npm run db:schema

# Załaduj dane przykładowe (opcjonalnie)
npm run db:seed
```

---

## Krok 7 — Instalacja zależności i build frontendu

```bash
# Zainstaluj zależności root
npm install

# Zbuduj frontend React
npm run build
```

Build trwa ok. 2-3 minut. Wynik znajdziesz w `client/build/`.

---

## Krok 8 — Uruchomienie z PM2

```bash
# Utwórz katalog logów
mkdir -p logs

# Uruchom aplikację z PM2
pm2 start ecosystem.config.js --env production

# Sprawdź status
pm2 status

# Zapisz konfigurację PM2 (autostart po reboocie)
pm2 save
pm2 startup
```

Wykonaj polecenie, które wypisze PM2 po `pm2 startup` (zaczyna się od `sudo env PATH=...`).

```bash
# Sprawdź logi
pm2 logs startivo
```

---

## Krok 9 — Konfiguracja Nginx

```bash
# Skopiuj konfigurację Nginx
cp /var/www/startivo/nginx.conf /etc/nginx/sites-available/startivo

# Edytuj domenę (jeśli potrzeba)
nano /etc/nginx/sites-available/startivo

# Aktywuj konfigurację
ln -s /etc/nginx/sites-available/startivo /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default   # usuń domyślny

# Sprawdź poprawność konfiguracji
nginx -t

# Przeładuj Nginx
systemctl reload nginx
systemctl enable nginx
```

---

## Krok 10 — SSL przez Certbot

Upewnij się, że domena startivo.pl wskazuje na IP serwera (propagacja DNS może trwać do 24h).

```bash
# Uzyskaj certyfikat SSL
certbot --nginx -d startivo.pl -d www.startivo.pl

# Podaj email, zaakceptuj regulamin
# Certbot automatycznie zaktualizuje konfigurację Nginx

# Sprawdź automatyczne odnowienie
certbot renew --dry-run
```

---

## Krok 11 — Podpięcie domeny startivo.pl

W panelu Hostingera:
1. Przejdź do **DNS / Strefa DNS** dla domeny startivo.pl
2. Dodaj rekord A:
   - **Nazwa**: `@` (lub puste)
   - **Typ**: A
   - **Wartość**: IP_TWOJEGO_VPS
3. Dodaj rekord CNAME:
   - **Nazwa**: `www`
   - **Typ**: CNAME
   - **Wartość**: `startivo.pl`

Propagacja DNS: 1-24 godziny.

---

## Zarządzanie aplikacją

```bash
# Restart po zmianach kodu
cd /var/www/startivo
git pull
npm run build
pm2 restart startivo

# Zatrzymanie
pm2 stop startivo

# Logi na żywo
pm2 logs startivo --lines 100

# Status
pm2 status
```

---

## Zmienne środowiskowe (.env)

| Zmienna | Opis |
|---------|------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `ADMIN_PASSWORD` | Hasło do panelu /admin |
| `PORT` | Port serwera (domyślnie 3001) |
| `NODE_ENV` | Środowisko (production/development) |

---

## Struktura projektu

```
startivo/
├── client/               ← React frontend (SPA)
│   ├── src/
│   │   ├── pages/        ← Strony aplikacji
│   │   ├── components/   ← Komponenty wielokrotnego użytku
│   │   └── utils/        ← Narzędzia (API, stałe)
│   └── build/            ← Zbudowany frontend (po npm run build)
├── server/               ← Express backend
│   ├── routes/           ← Endpointy API
│   ├── db/               ← Schema i seed SQL
│   └── index.js          ← Punkt wejścia serwera
├── ecosystem.config.js   ← Konfiguracja PM2
├── nginx.conf            ← Przykładowa konfiguracja Nginx
├── .env.example          ← Szablon zmiennych środowiskowych
└── README.md             ← Ta instrukcja
```

---

## API Endpoints

| Metoda | URL | Opis |
|--------|-----|------|
| GET | `/api/events` | Lista wydarzeń z filtrami |
| GET | `/api/events/featured` | Wyróżnione wydarzenia |
| GET | `/api/events/:slug` | Szczegóły wydarzenia |
| POST | `/api/events` | Dodaj nowe wydarzenie |
| PUT | `/api/events/:id` | Aktualizuj (admin) |
| DELETE | `/api/events/:id` | Usuń (admin) |
| POST | `/api/events/:id/view` | Inkrementuj licznik wyświetleń |
| POST | `/api/events/:id/alert` | Ustaw powiadomienie e-mail |
| GET | `/api/stats` | Statystyki ogólne |
| GET | `/api/stats/by-sport` | Statystyki wg dyscypliny |
| POST | `/api/subscribe` | Subskrypcja newslettera |
| POST | `/api/contact` | Formularz kontaktowy |
| GET | `/sitemap.xml` | Mapa witryny XML |
| GET | `/robots.txt` | Plik robots.txt |

---

## Panel administracyjny

Dostępny pod adresem `/admin`. Hasło ustawione w zmiennej `ADMIN_PASSWORD`.

Funkcje:
- Przeglądanie i moderacja oczekujących wydarzeń
- Lista wszystkich wydarzeń
- Statystyki (wg statusu, dyscypliny, miesiąca)
- Lista subskrybentów newslettera
- Zarządzanie zapytaniami kontaktowymi

---

## Wsparcie techniczne

W razie problemów:
- Sprawdź logi: `pm2 logs startivo`
- Sprawdź logi Nginx: `tail -f /var/log/nginx/error.log`
- Sprawdź status bazy: `sudo -u postgres psql -c "\l"`
