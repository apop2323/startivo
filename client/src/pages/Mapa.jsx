import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { SPORT_TYPES, getSportInfo } from '../utils/sports';

export default function Mapa() {
  const [events, setEvents] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllEvents();
  }, []);

  const fetchAllEvents = async () => {
    try {
      const data = await api.get('/events?limit=500');
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [52.0, 19.5],
      zoom: 6,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapInstanceRef.current = map;
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    // Clear existing markers
    if (markersRef.current) {
      mapInstanceRef.current.removeLayer(markersRef.current);
    }

    const filtered = selectedSport
      ? events.filter((e) => e.sport_type === selectedSport)
      : events;

    const eventsWithCoords = filtered.filter((e) => e.lat && e.lng);

    if (!L.markerClusterGroup) {
      // Fallback without clustering
      const group = L.layerGroup();
      eventsWithCoords.forEach((event) => addMarker(L, group, event, navigate));
      group.addTo(mapInstanceRef.current);
      markersRef.current = group;
    } else {
      const cluster = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
      });
      eventsWithCoords.forEach((event) => addMarker(L, cluster, event, navigate));
      cluster.addTo(mapInstanceRef.current);
      markersRef.current = cluster;
    }
  }, [events, selectedSport]);

  function addMarker(L, layer, event, navigate) {
    const sport = getSportInfo(event.sport_type);
    const marker = L.circleMarker([parseFloat(event.lat), parseFloat(event.lng)], {
      radius: 10,
      fillColor: sport.color,
      color: 'rgba(0,0,0,0.5)',
      weight: 1.5,
      opacity: 1,
      fillOpacity: 0.85,
    });

    const date = new Date(event.date_start).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    const popupContent = `
      <div style="font-family: DM Sans, sans-serif; min-width: 180px;">
        <div style="background: ${sport.color}20; color: ${sport.color}; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; display: inline-block; margin-bottom: 8px; border: 1px solid ${sport.color}40;">
          ${sport.emoji} ${sport.label}
        </div>
        <div style="font-weight: 700; font-size: 14px; color: rgba(255,255,255,0.88); margin-bottom: 4px; line-height: 1.3;">
          ${event.name}
        </div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px;">
          📅 ${date}<br>
          📍 ${event.city}
        </div>
        <a href="/event/${event.slug || event.id}"
           style="background: #FF5C00; color: white; padding: 5px 14px; border-radius: 20px; text-decoration: none; font-size: 12px; font-weight: 500; display: inline-block;">
          Zobacz →
        </a>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 240 });
    marker.addTo(layer);
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', background: '#0C0C0E' }}>
      {/* Filter bar */}
      <div style={{
        background: '#141416',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '12px 16px',
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap',
        alignItems: 'center',
        zIndex: 10,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginRight: 4 }}>Filtruj:</span>
        <button
          onClick={() => setSelectedSport('')}
          style={{
            background: !selectedSport ? '#FF5C00' : '#1C1C1F',
            color: !selectedSport ? 'white' : 'rgba(255,255,255,0.6)',
            border: `1px solid ${!selectedSport ? '#FF5C00' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 100,
            padding: '5px 14px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'DM Sans',
            transition: 'all 0.2s',
          }}
        >
          Wszystkie
        </button>
        {Object.entries(SPORT_TYPES).filter(([k]) => k !== 'other').map(([key, sport]) => (
          <button
            key={key}
            onClick={() => setSelectedSport(key === selectedSport ? '' : key)}
            style={{
              background: selectedSport === key ? `${sport.color}20` : '#1C1C1F',
              color: selectedSport === key ? sport.color : 'rgba(255,255,255,0.6)',
              border: `1px solid ${selectedSport === key ? sport.color : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 100,
              padding: '5px 14px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontFamily: 'DM Sans',
              transition: 'all 0.2s',
            }}
          >
            {sport.emoji} {sport.label}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
          {events.filter(e => e.lat && e.lng && (!selectedSport || e.sport_type === selectedSport)).length} wydarzeń na mapie
        </span>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ flex: 1 }} />
    </div>
  );
}
