import { statusLabel } from '@/lib/format';

const TONE = {
  requested: 'badge-amber',
  confirmed: 'badge-green',
  in_progress: 'badge',
  completed: 'badge-violet',
  reviewed: 'badge-grey',
  declined: 'badge-red',
  cancelled: 'badge-grey',
  disputed: 'badge-red',
  resolved: 'badge-grey',
  draft: 'badge-grey',
  pending: 'badge-amber',
  approved: 'badge-green',
  rejected: 'badge-red',
  inactive: 'badge-grey',
  active: 'badge-green',
  suspended: 'badge-red',
  open: 'badge-amber',
  authorized: 'badge-amber',
  held: 'badge-green',
  released: 'badge-grey',
  refunded: 'badge-grey',
};

export default function StatusBadge({ status }) {
  const tone = TONE[status] || 'badge-grey';
  const cls = tone === 'badge' ? 'badge' : `badge ${tone}`;
  return <span className={cls}>{statusLabel(status)}</span>;
}
