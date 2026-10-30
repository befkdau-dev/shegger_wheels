'use client';
// Browser-only Leaflet wrapper. Loaded via next/dynamic({ ssr: false }) from CarMap.jsx
// because Leaflet touches `window` on import. Tiles come from OpenStreetMap
// (external dependency - documented in README/BOUNDARY).
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';

function iconFor(kind) {
  if (kind === 'sim') return L.divIcon({ className: 'sw-sim', html: '', iconSize: [22, 22], iconAnchor: [11, 11] });
  return L.divIcon({ className: 'sw-pin', html: '', iconSize: [34, 34], iconAnchor: [8, 34] });
}

export default function LeafletMap({ center, zoom = 14, markers = [], route = null, ariaLabel = 'Map' }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);

  useEffect(() => {
    if (!el.current || map.current) return undefined;
    const m = L.map(el.current, { scrollWheelZoom: false, keyboard: true }).setView(center, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      layer.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    if (route && route.length > 1) {
      L.polyline(route, { color: '#2563a8', weight: 4, opacity: 0.7, dashArray: '8 8' }).addTo(layer.current);
    }
    markers.forEach((mk) => {
      L.marker([mk.lat, mk.lng], { icon: iconFor(mk.kind), title: mk.label, alt: mk.label, keyboard: true })
        .bindTooltip(mk.label, { direction: 'top', offset: [0, -24] })
        .addTo(layer.current);
    });
  }, [markers, route]);

  useEffect(() => {
    if (map.current) map.current.setView(center, map.current.getZoom());
  }, [center]);

  return <div ref={el} role="region" aria-label={ariaLabel} style={{ height: '100%', width: '100%' }} />;
}
