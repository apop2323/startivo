import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Kalendarz from './pages/Kalendarz';
import EventDetail from './pages/EventDetail';
import Mapa from './pages/Mapa';
import DodajEvent from './pages/DodajEvent';
import MojeStarty from './pages/MojeStarty';
import Wspolpraca from './pages/Wspolpraca';
import PolitykaPrywatnosci from './pages/PolitykaPrywatnosci';
import Admin from './pages/Admin';
import Artykuly from './pages/Artykuly';
import ArtykulDetail from './pages/ArtykulDetail';
import { ToastProvider } from './context/ToastContext';

function Layout({ children, noFooter = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/kalendarz" element={<Layout><Kalendarz /></Layout>} />
        <Route path="/event/:slug" element={<Layout><EventDetail /></Layout>} />
        <Route path="/mapa" element={<Layout noFooter><Mapa /></Layout>} />
        <Route path="/dodaj" element={<Layout><DodajEvent /></Layout>} />
        <Route path="/moje-starty" element={<Layout><MojeStarty /></Layout>} />
        <Route path="/wspolpraca" element={<Layout><Wspolpraca /></Layout>} />
        <Route path="/polityka-prywatnosci" element={<Layout><PolitykaPrywatnosci /></Layout>} />
        <Route path="/artykuly" element={<Layout><Artykuly /></Layout>} />
        <Route path="/artykuly/:slug" element={<Layout><ArtykulDetail /></Layout>} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={
          <Layout>
            <div style={{
              minHeight: '70vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              padding: '40px 24px',
              textAlign: 'center',
              background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,92,0,0.05) 0%, transparent 70%)',
            }}>
              <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(80px, 20vw, 160px)',
                color: '#FF5C00',
                lineHeight: 1,
                textShadow: '0 0 60px rgba(255,92,0,0.25)',
                letterSpacing: '-0.05em',
              }}>
                404
              </div>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', marginTop: 8 }}>
                Ups! Ta strona nie istnieje.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.40)', fontSize: '1rem', maxWidth: 360 }}>
                Ale mamy dla Ciebie mnóstwo startów do odkrycia.
              </p>
              <a href="/" className="btn-primary" style={{ marginTop: 8, fontSize: '0.95rem' }}>
                Wróć na stronę główną
              </a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}
