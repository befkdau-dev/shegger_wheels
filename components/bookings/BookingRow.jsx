import Link from 'next/link';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDateRange, formatETB } from '@/lib/format';
import { carTitle } from '@/lib/selectors';

/** Compact booking card used by the renter dashboard. */
export default function BookingCard({ booking, car, action }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div className="row-between">
        <strong>{carTitle(car)}</strong>
        <StatusBadge status={booking.status} />
      </div>
      <p className="small muted" style={{ margin: '4px 0 10px' }}>
        {formatDateRange(booking.startDate, booking.endDate)} · {formatETB(booking.total)}
      </p>
      <div className="row">
        <Link className="btn btn-outline btn-sm" href={`/bookings/${booking.id}`}>View details</Link>
        {action}
      </div>
    </div>
  );
}
