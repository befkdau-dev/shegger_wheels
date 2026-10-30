'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { IconPin } from '@/components/ui/Icons';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="skeleton" style={{ height: '100%' }} role="status" aria-label="Loading map" />
  ),
});

/**
 * Map + always-visible text fallback (neighbourhood and sample coordinates).
 * The marker is a SEEDED SAMPLE LOCATION - the vehicle is not GPS-tracked.
 */
export default function CarMap({ car }) {
  const center = useMemo(() => [car.latitude, car.longitude], [car.latitude, car.longitude]);
  const markers = useMemo(
    () => [{ id: car.id, lat: car.latitude, lng: car.longitude, label: `${car.make} ${car.model} pick-up area`, kind: 'car' }],
    [car],
  );
  return (
    <div className="stack">
      <div className="map-fallback">
        <IconPin width={26} height={26} style={{ color: 'var(--blue-600)', flex: 'none' }} />
        <div>
          <strong>Pick-up area: {car.neighbourhood}, {car.city}</strong>
          <div className="small muted">
            Sample coordinates {car.latitude.toFixed(4)}, {car.longitude.toFixed(4)}. The exact address is shared after the owner confirms.
          </div>
        </div>
      </div>
      <div className="map-box">
        <LeafletMap center={center} markers={markers} ariaLabel={`Map showing the ${car.neighbourhood} pick-up area`} />
      </div>
      <p className="xsmall muted mb-0">
        Map tiles load from OpenStreetMap. The pin shows a seeded sample location for this demo, not a live vehicle position.
      </p>
    </div>
  );
}
