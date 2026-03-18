import React from 'react';

const sections = [
  {
    id: 'administrator',
    title: '1. Administrator danych',
    content: `Administratorem Twoich danych osobowych jest właściciel serwisu Startivo, dostępnego pod adresem startivo.pl (dalej „Administrator"). Możesz skontaktować się z Administratorem za pośrednictwem formularza kontaktowego dostępnego na stronie lub pod adresem e-mail: kontakt@startivo.pl.`
  },
  {
    id: 'zakres',
    title: '2. Zakres przetwarzanych danych',
    content: `Przetwarzamy następujące kategorie danych osobowych:
• Dane podane dobrowolnie — adres e-mail w formularzu newslettera, imię, adres e-mail i wiadomość w formularzu kontaktowym, dane organizatora przy dodawaniu wydarzenia.
• Dane techniczne — adres IP, identyfikatory sesji, dane przeglądarki i systemu operacyjnego zbierane automatycznie podczas korzystania z serwisu.
• Dane lokalizacyjne — przybliżona lokalizacja zbierana za Twoją zgodą (po akceptacji komunikatu w przeglądarce) wyłącznie w celu wyświetlenia lokalnych wydarzeń.`
  },
  {
    id: 'podstawa',
    title: '3. Podstawa prawna i cel przetwarzania',
    content: `Dane przetwarzamy na następujących podstawach prawnych:
• Art. 6 ust. 1 lit. a RODO — Twoja zgoda (newsletter, geolokalizacja, powiadomienia e-mail).
• Art. 6 ust. 1 lit. b RODO — wykonanie umowy lub podjęcie działań na żądanie osoby, której dane dotyczą (dodanie wydarzenia, formularz kontaktowy).
• Art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes administratora (analityka, bezpieczeństwo serwisu, statystyki).`
  },
  {
    id: 'okres',
    title: '4. Okres przechowywania danych',
    content: `• Dane subskrybentów newslettera — do momentu rezygnacji z subskrypcji.
• Dane kontaktowe z formularza — przez 2 lata od ostatniego kontaktu lub do czasu wniesienia sprzeciwu.
• Dane zdarzeń sportowych — przez cały okres funkcjonowania serwisu lub do żądania usunięcia.
• Logi systemowe — przez 90 dni.`
  },
  {
    id: 'prawa',
    title: '5. Twoje prawa',
    content: `Zgodnie z RODO przysługują Ci następujące prawa:
• Prawo dostępu do danych (art. 15 RODO)
• Prawo do sprostowania danych (art. 16 RODO)
• Prawo do usunięcia danych („prawo do bycia zapomnianym", art. 17 RODO)
• Prawo do ograniczenia przetwarzania (art. 18 RODO)
• Prawo do przenoszenia danych (art. 20 RODO)
• Prawo do wniesienia sprzeciwu (art. 21 RODO)
• Prawo do wycofania zgody w dowolnym momencie

Aby skorzystać z powyższych praw, skontaktuj się z nami: kontakt@startivo.pl`
  },
  {
    id: 'cookies',
    title: '6. Pliki cookie i localStorage',
    content: `Serwis korzysta z localStorage przeglądarki wyłącznie do przechowywania lokalnych preferencji użytkownika (lista ulubionych wydarzeń). Nie używamy tradycyjnych plików cookie do celów śledzenia. W przyszłości możemy wdrożyć analitykę opartą na plikach cookie — w takim przypadku poinformujemy Cię i poprosimy o zgodę.`
  },
  {
    id: 'podmioty',
    title: '7. Odbiorcy danych',
    content: `Twoje dane mogą być przekazywane:
• Dostawcom infrastruktury IT (serwery VPS, backup) — wyłącznie w zakresie niezbędnym do działania serwisu.
• Organom publicznym — wyłącznie na podstawie przepisów prawa.

Nie sprzedajemy danych osobowych podmiotom trzecim.`
  },
  {
    id: 'kontakt',
    title: '8. Kontakt i skargi',
    content: `W przypadku pytań dotyczących przetwarzania Twoich danych osobowych skontaktuj się z nami pod adresem: kontakt@startivo.pl.

Masz prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO), jeśli uznasz, że przetwarzanie Twoich danych osobowych narusza przepisy RODO.

Urząd Ochrony Danych Osobowych
ul. Stawki 2, 00-193 Warszawa
uodo.gov.pl`
  },
];

export default function PolitykaPrywatnosci() {
  return (
    <div style={{ background: '#0C0C0E', minHeight: '100vh', padding: '40px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 8 }}>
          Polityka prywatności
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40, fontSize: '0.875rem' }}>
          Ostatnia aktualizacja: styczeń 2026
        </p>

        {/* TOC */}
        <div style={{ background: '#141416', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24, marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1rem', color: 'rgba(255,255,255,0.6)', marginBottom: 16 }}>
            SPIS TREŚCI
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ color: '#FF5C00', textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
                onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {sections.map((s) => (
            <div key={s.id} id={s.id} style={{ scrollMarginTop: 80 }}>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.2rem', color: 'rgba(255,255,255,0.88)', marginBottom: 12 }}>
                {s.title}
              </h2>
              <div style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-line' }}>
                {s.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
