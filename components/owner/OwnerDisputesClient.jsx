'use client';
import { useMemo } from 'react';
import { DisputeThread } from '@/components/bookings/DisputePanel';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { formatDateRange } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { carTitle } from '@/lib/selectors';

export default function OwnerDisputesClient() {
  const { user } = useSession();
  const { cars, users, bookings, disputes, isLoading } = useAppData();
  const mine = useMemo(() => {
    if (!user) return [];
    return disputes
      .map((d) => ({ d, b: bookings.find((x) => x.id === d.bookingId) }))
      .filter(({ b }) => b && b.ownerId === user.id)
      .sort((a, b) => String(b.d.createdAt).localeCompare(String(a.d.createdAt)));
  }, [disputes, bookings, user]);

  if (isLoading || !user) return <LoadingBlock label="Loading disputes" rows={2} height={120} />;

  return (
    <div className="stack-lg">
      <div><h1>Disputes</h1><p className="muted mb-0">Issues raised on rentals of your cars. An admin makes the final resolution.</p></div>
      {mine.length === 0 ? (
        <EmptyState title="No disputes to review">Good news: nobody has raised an issue on your cars.</EmptyState>
      ) : (
        mine.map(({ d, b }) => (
          <div key={d.id} className="stack">
            <p className="small muted mb-0">{carTitle(cars.find((c) => c.id === b.carId))} · {formatDateRange(b.startDate, b.endDate)}</p>
            <DisputeThread dispute={d} users={users} />
          </div>
        ))
      )}
    </div>
  );
}
