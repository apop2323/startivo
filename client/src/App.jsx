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
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={
          <Layout>
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: '4rem' }}>🏁</div>
              <h1 style={{ fontFamily: 'Syne', fontWeight: 800, color: 'rgba(255,255,255,0.6)' }}>404 — Strona nie istnieje</h1>
              <a href="/" style={{ color: '#FF5C00', textDecoration: 'none' }}>← Wróć na start</a>
            </div>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
