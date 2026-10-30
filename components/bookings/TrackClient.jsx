'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Alert, ErrorState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { getMyBooking } from '@/lib/bookings';
import { formatDateRange } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { SIMULATION_OFFSETS } from '@/lib/places';
import { carTitle } from '@/lib/selectors';

const LeafletMap = dynamic(() => import('@/components/cars/LeafletMap'), {
  ssr: false,
  loading: () => <div className="skeleton" style={{ height: '100%' }} role="status" aria-label="Loading map" />,
});

const LABELS = ['Pick-up', 'Leaving the area', 'On the main road', 'Highway section', 'Heading back', 'Return point'];

/** Simulated trip: a marker steps through predefined sample points. Not GPS. */
export default function TrackClient({ id }) {
  const { user } = useSession();
  const { cars, bookings, isLoading } = useAppData();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  const access = useMemo(() => (isLoading || !user ? null : getMyBooking(id)), [isLoading, user, id, bookings]);
  const booking = access && access.ok ? access.booking : null;
  const car = booking ? cars.find((c) => c.id === booking.carId) : null;
  const eligible = booking && ['confirmed', 'in_progress'].includes(booking.status);

  const points = useMemo(
    () => (car ? SIMULATION_OFFSETS.map(([a, b]) => [car.latitude + a, car.longitude + b]) : []),
    [car],
  );

  useEffect(() => {
    if (!playing) return undefined;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= points.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1500);
    return () => clearInterval(timer.current);
  }, [playing, points.length]);

  const markers = useMemo(
    () => (points.length ? [{ id: 'sim', lat: points[step][0], lng: points[step][1], label: `Simulated position: ${LABELS[step]}`, kind: 'sim' }] : []),
    [points, step],
  );

  if (isLoading || !user) return <LoadingBlock label="Loading trip" rows={2} height={160} />;
  if (!access || !access.ok) {
    return <ErrorState title={access?.code === 'forbidden' ? 'This booking is not yours' : 'Booking not found'} actionHref="/bookings" actionLabel="My bookings">Trip tracking is only available to the renter of an eligible booking.</ErrorState>;
  }
  if (!eligible) {
    return (
      <ErrorState title="Tracking is not available" actionHref={`/bookings/${id}`} actionLabel="Back to booking">
        The trip simulation is only available for confirmed or in-progress bookings. This booking is {booking.status.replace('_', ' ')}.
      </ErrorState>
    );
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 8 }}>
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/bookings">My bookings</Link> / <Link href={`/bookings/${id}`}>Booking</Link> / <span aria-current="page">Track</span></nav>
      <div className="row-between">
        <div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>Trip tracker <span className="badge badge-amber badge-plain" style={{ verticalAlign: 'middle' }}>SIMULATION</span></h1>
          <p className="muted mb-0">{carTitle(car)} · {formatDateRange(booking.startDate, booking.endDate)}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <Alert type="warning" title="This is a simulation">
        <p className="mb-0">The marker moves between a few predefined sample points around {car.neighbourhood}. The car is <strong>not</strong> being GPS-tracked.</p>
      </Alert>

      <div className="two-col" style={{ alignItems: 'start' }}>
        <div className="map-box" style={{ height: 380 }}>
          <LeafletMap center={points[0]} zoom={13} markers={markers} route={points} ariaLabel="Simulated trip map" />
        </div>
        <div className="card stack">
          <h2 style={{ fontSize: '1.1rem' }}>Trip status (simulated)</h2>
          <p className="mb-0" role="status" aria-live="polite"><strong>Step {step + 1} of {points.length}:</strong> {LABELS[step]}</p>
          <div className="bar" aria-hidden="true"><span style={{ width: `${((step + 1) / points.length) * 100}%` }} /></div>
          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => { if (step >= points.length - 1) setStep(0); setPlaying((p) => !p); }}>{playing ? 'Pause' : step >= points.length - 1 ? 'Replay simulation' : 'Play simulation'}</button>
            <button type="button" className="btn btn-outline" disabled={playing || step >= points.length - 1} onClick={() => setStep((s) => Math.min(s + 1, points.length - 1))}>Next point</button>
            <button type="button" className="btn btn-ghost" disabled={step === 0 && !playing} onClick={() => { setPlaying(false); setStep(0); }}>Reset</button>
          </div>
          <ol className="small" style={{ paddingLeft: 20, margin: 0 }}>
            {LABELS.map((l, i) => <li key={l} style={{ fontWeight: i === step ? 700 : 400 }}>{l}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}
