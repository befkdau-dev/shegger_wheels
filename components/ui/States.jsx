import Link from 'next/link';
import { IconAlert, IconCar, IconCheck } from './Icons';

export function Alert({ type = 'info', title, children, role, className = '' }) {
  const icon = type === 'success' ? <IconCheck /> : type === 'info' ? <IconCar /> : <IconAlert />;
  const computedRole = role || (type === 'error' ? 'alert' : 'status');
  return (
    <div className={`alert alert-${type} ${className}`} role={computedRole}>
      <span style={{ flex: 'none', marginTop: 2 }}>{icon}</span>
      <div>
        {title ? <span className="alert-title">{title}</span> : null}
        {children}
      </div>
    </div>
  );
}

/** Empty state: "No cars match your filters", "You have no bookings yet", ... */
export function EmptyState({ title, children, actionHref, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <IconCar className="empty-icon" width={56} height={56} strokeWidth={1.4} />
      <h3>{title}</h3>
      {children ? <p>{children}</p> : null}
      {actionHref ? (
        <Link className="btn btn-primary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
      {onAction ? (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

/** Real loading state (used while browser storage is first read - not a fake spinner). */
export function LoadingBlock({ label = 'Loading', rows = 3, height = 72 }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}…</span>
      <div className="stack">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height }} />
        ))}
      </div>
    </div>
  );
}

/** Error / not-found / access-denied panel with a recovery action. */
export function ErrorState({ title = 'Something went wrong', children, actionHref, actionLabel }) {
  return (
    <div className="card" role="alert" style={{ borderColor: '#f2b6ae', background: '#fffafa' }}>
      <h2 style={{ color: 'var(--red-700)' }}>{title}</h2>
      {children ? <p className="muted">{children}</p> : null}
      {actionHref ? (
        <Link className="btn btn-primary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
