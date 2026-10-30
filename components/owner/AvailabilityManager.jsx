'use client';
import { useMemo, useState } from 'react';
import { Alert } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { ACTIVE_STATUSES } from '@/lib/bookings';
import { expandRange, setUnavailableDates } from '@/lib/cars';
import { addDays, formatDate, pad, rangesOverlap, todayISO } from '@/lib/format';
import { useAppData } from '@/lib/hooks';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Keyboard-accessible month calendar. Every day is a real <button> with aria-pressed. */
export default function AvailabilityManager({ car }) {
  const { bookings } = useAppData();
  const { toast } = useToast();
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = today.split('-').map(Number);
    return { y, m };
  });
  const [blocked, setBlocked] = useState(() => new Set(car.unavailableDates || []));
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [error, setError] = useState('');

  const reserved = useMemo(
    () => bookings.filter((b) => b.carId === car.id && ACTIVE_STATUSES.includes(b.status)),
    [bookings, car.id],
  );
  const isReserved = (d) => reserved.some((b) => rangesOverlap(d, d, b.startDate, b.endDate));

  const first = `${cursor.y}-${pad(cursor.m)}-01`;
  const lead = (new Date(Date.UTC(cursor.y, cursor.m - 1, 1)).getUTCDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(Date.UTC(cursor.y, cursor.m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => addDays(first, i))];

  const shift = (n) =>
    setCursor(({ y, m }) => {
      const d = new Date(Date.UTC(y, m - 1 + n, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 };
    });

  const toggle = (d) =>
    setBlocked((s) => {
      const next = new Set(s);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  const addRange = () => {
    const days = expandRange(rangeStart, rangeEnd).filter((d) => d >= today && !isReserved(d));
    if (!days.length) return setError('Choose a valid future range that is not already reserved.');
    setError('');
    setBlocked((s) => new Set([...s, ...days]));
  };

  const save = () => {
    const res = setUnavailableDates(car.id, [...blocked]);
    if (!res.ok) {
      setError(res.error);
      toast(res.error, 'error');
      return;
    }
    setError('');
    toast('Availability saved.');
  };

  const sorted = [...blocked].filter((d) => d >= today).sort();

  return (
    <div className="two-col" style={{ alignItems: 'start' }}>
      <section className="card" aria-labelledby="cal-h">
        <div className="row-between">
          <h2 id="cal-h" style={{ fontSize: '1.1rem', margin: 0 }}>{MONTH_NAMES[cursor.m - 1]} {cursor.y}</h2>
          <div className="row" style={{ gap: 4 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => shift(-1)} aria-label="Previous month">‹</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => shift(1)} aria-label="Next month">›</button>
          </div>
        </div>
        <div role="grid" aria-labelledby="cal-h" style={{ marginTop: 12 }}>
          <div role="row" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
            {DOW.map((d) => <div key={d} role="columnheader" className="xsmall muted center">{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((d, i) => {
              if (!d) return <div key={`b${i}`} role="gridcell" aria-hidden="true" />;
              const past = d < today;
              const res = isReserved(d);
              const isBlocked = blocked.has(d);
              const label = `${formatDate(d)}${res ? ', reserved by a booking' : isBlocked ? ', blocked' : past ? ', past' : ', available'}`;
              return (
                <div key={d} role="gridcell">
                  <button
                    type="button"
                    aria-pressed={isBlocked}
                    aria-label={label}
                    disabled={past || res}
                    onClick={() => toggle(d)}
                    style={{
                      width: '100%', minHeight: 44, borderRadius: 8, border: '1.5px solid',
                      cursor: past || res ? 'not-allowed' : 'pointer', font: 'inherit', fontWeight: 600,
                      background: res ? 'var(--violet-100)' : isBlocked ? 'var(--red-100)' : '#fff',
                      color: res ? 'var(--violet-700)' : isBlocked ? 'var(--red-700)' : past ? '#9aa6b8' : 'var(--ink)',
                      borderColor: res ? '#cdbcf0' : isBlocked ? '#f2b6ae' : 'var(--line)',
                      textDecoration: isBlocked ? 'line-through' : 'none',
                    }}
                  >
                    {Number(d.slice(8))}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 12, marginBottom: 0 }}>
          <span className="badge badge-red badge-plain">Blocked</span> <span className="badge badge-violet badge-plain">Reserved by booking</span> Press a date to block or unblock it.
        </p>
      </section>

      <section className="card stack" aria-labelledby="blk-h">
        <h2 id="blk-h" style={{ fontSize: '1.1rem' }}>Block a date range</h2>
        <div className="form-grid">
          <div className="field"><label htmlFor="r-start">From</label><input id="r-start" type="date" className="input" min={today} value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} /></div>
          <div className="field"><label htmlFor="r-end">Until</label><input id="r-end" type="date" className="input" min={rangeStart || today} value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} /></div>
        </div>
        <div><button type="button" className="btn btn-outline" onClick={addRange}>Add range to blocked dates</button></div>
        {error ? <Alert type="error"><p className="mb-0">{error}</p></Alert> : null}
        <div>
          <h3 style={{ fontSize: '1rem' }}>Blocked dates ({sorted.length})</h3>
          {sorted.length === 0 ? <p className="muted small mb-0">No dates are blocked. The car is open whenever it is not booked.</p> : (
            <ul className="date-chip-list">
              {sorted.slice(0, 40).map((d) => (
                <li key={d} className="date-chip">{formatDate(d)}<button type="button" aria-label={`Unblock ${formatDate(d)}`} onClick={() => toggle(d)}>×</button></li>
              ))}
            </ul>
          )}
        </div>
        <div className="row"><button type="button" className="btn btn-accent btn-lg" onClick={save}>Save availability</button></div>
      </section>
    </div>
  );
}
