'use client';
import { useMemo, useState } from 'react';
import Field from '@/components/ui/Field';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { Stars } from '@/components/ui/Stars';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/format';
import { useAppData, useSession } from '@/lib/hooks';
import { averageRating, replyToReview } from '@/lib/reviews';
import { carTitle, userName } from '@/lib/selectors';

function ReplyForm({ review }) {
  const { toast } = useToast();
  const [text, setText] = useState(review.ownerReply || '');
  const [editing, setEditing] = useState(!review.ownerReply);
  const [error, setError] = useState('');

  const send = (e) => {
    e.preventDefault();
    const res = replyToReview(review.id, text);
    if (!res.ok) return setError(res.error);
    setError('');
    setEditing(false);
    toast('Reply published.');
  };

  if (!editing) {
    return (
      <div className="owner-reply">
        <strong>Your reply:</strong> {review.ownerReply}{' '}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit reply</button>
      </div>
    );
  }
  return (
    <form onSubmit={send} noValidate style={{ marginTop: 10 }}>
      <Field label="Reply to this review" error={error}>
        {(p) => <textarea {...p} className="textarea" style={{ minHeight: 80 }} value={text} onChange={(e) => setText(e.target.value)} />}
      </Field>
      <button type="submit" className="btn btn-primary btn-sm">Post reply</button>
    </form>
  );
}

export default function OwnerReviewsClient() {
  const { user } = useSession();
  const { cars, users, reviews, isLoading } = useAppData();
  const mine = useMemo(
    () => reviews.filter((r) => r.ownerId === user?.id).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    [reviews, user],
  );
  if (isLoading || !user) return <LoadingBlock label="Loading reviews" rows={3} height={90} />;
  const avg = averageRating(mine);

  return (
    <div className="stack-lg">
      <div>
        <h1>Reviews</h1>
        <p className="muted mb-0">{mine.length ? `${mine.length} review${mine.length === 1 ? '' : 's'} · average ${avg} / 5` : 'Reviews from renters appear here.'}</p>
      </div>
      {mine.length === 0 ? (
        <EmptyState title="No reviews yet">After a renter completes a trip they can review your car.</EmptyState>
      ) : (
        <div className="card" style={{ padding: '4px 20px' }}>
          {mine.map((r) => (
            <article key={r.id} className="review-item">
              <div className="row-between">
                <div className="row"><strong>{userName(users, r.renterId)}</strong><Stars value={r.rating} /><span className="muted small">on {carTitle(cars.find((c) => c.id === r.carId))}</span></div>
                <span className="small muted">{formatDate(r.createdAt)}</span>
              </div>
              <p className="mb-0" style={{ marginTop: 6 }}>{r.comment}</p>
              <ReplyForm review={r} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
