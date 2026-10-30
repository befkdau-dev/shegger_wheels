// Reusable ETB, date and relative-time formatting (concept #32).
// Dates are stored as ISO strings (YYYY-MM-DD); timestamps as ISO date-times.
// All formatting is locale-independent so server and client renders always match.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function pad(n) {
  return String(n).padStart(2, '0');
}

/** Today's date in the user's local time zone as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isValidISODate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toUTC(value) {
  const [y, m, d] = value.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDays(value, n) {
  const t = new Date(toUTC(value) + n * 86400000);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

export function diffDays(a, b) {
  return Math.round((toUTC(b) - toUTC(a)) / 86400000);
}

/** Number of calendar days in [start, end], both inclusive. */
export function inclusiveDays(start, end) {
  return diffDays(start, end) + 1;
}

export function eachDay(start, end) {
  const out = [];
  const total = inclusiveDays(start, end);
  for (let i = 0; i < total && i < 400; i++) out.push(addDays(start, i));
  return out;
}

/** Inclusive range overlap. ISO strings compare correctly as plain strings. */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart <= bEnd && bStart <= aEnd;
}

export function monthKey(value) {
  return String(value).slice(0, 7);
}

export function monthLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${String(y).slice(2)}`;
}

/** "ETB 2,800" */
export function formatETB(amount) {
  const v = Math.round(Number(amount) || 0);
  return `ETB ${v.toLocaleString('en-US')}`;
}

/** "25 Oct 2026" from YYYY-MM-DD or an ISO timestamp. */
export function formatDate(value) {
  if (!value) return '—';
  const s = String(value).slice(0, 10);
  if (!isValidISODate(s)) return '—';
  const [y, m, d] = s.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatDateRange(start, end) {
  if (!start || !end) return '—';
  return start === end ? formatDate(start) : `${formatDate(start)} → ${formatDate(end)}`;
}

/** "25 Oct 2026, 14:05" (local time). Client-side only. */
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "3 days ago", "in 2 days", "just now". */
export function relativeTime(iso, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '—';
  const diff = t - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  let text;
  if (mins < 1) return 'just now';
  if (mins < 60) text = `${mins} min`;
  else if (hours < 24) text = `${hours} hour${hours === 1 ? '' : 's'}`;
  else if (days < 31) text = `${days} day${days === 1 ? '' : 's'}`;
  else {
    const months = Math.round(days / 30);
    text = `${months} month${months === 1 ? '' : 's'}`;
  }
  return diff < 0 ? `${text} ago` : `in ${text}`;
}

const STATUS_LABELS = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  in_progress: 'In progress',
  completed: 'Completed',
  reviewed: 'Reviewed',
  declined: 'Declined',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  resolved: 'Resolved',
  draft: 'Draft',
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  inactive: 'Inactive',
  active: 'Active',
  suspended: 'Suspended',
  open: 'Open',
  authorized: 'Authorized (demo)',
  held: 'Held (demo)',
  released: 'Released (demo)',
  refunded: 'Refunded (demo)',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || String(status || '—').replace(/_/g, ' ');
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export function pluralize(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`;
}
