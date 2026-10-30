import Link from 'next/link';

function pageList(current, total) {
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const list = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  list.forEach((p, i) => {
    if (i > 0 && p - list[i - 1] > 1) out.push('gap-' + p);
    out.push(p);
  });
  return out;
}

/**
 * Visible page links with a clear current-page indicator (aria-current="page").
 * Pass `hrefFor(page)` for real links (shareable URLs) or `onPage(page)` for state-driven lists.
 */
export default function Pagination({ page, totalPages, hrefFor, onPage, label = 'Pagination' }) {
  if (totalPages <= 1) return null;
  const item = (p, text, extra = {}) => {
    const current = p === page && !extra.nav;
    const cls = `btn btn-sm ${current ? '' : 'btn-outline'}`;
    const disabled = extra.disabled;
    if (hrefFor && !disabled) {
      return (
        <Link key={extra.key || p} href={hrefFor(p)} className={cls} aria-current={current ? 'page' : undefined} aria-label={extra.aria || `Page ${p}`} scroll={false}>
          {text}
        </Link>
      );
    }
    return (
      <button
        key={extra.key || p}
        type="button"
        className={cls}
        disabled={disabled}
        aria-current={current ? 'page' : undefined}
        aria-label={extra.aria || `Page ${p}`}
        onClick={() => onPage && onPage(p)}
      >
        {text}
      </button>
    );
  };
  return (
    <nav className="pagination" aria-label={label}>
      {item(page - 1, <><span aria-hidden="true">‹</span> Previous</>, { key: 'prev', aria: 'Previous page', disabled: page <= 1, nav: true })}
      {pageList(page, totalPages).map((p) =>
        typeof p === 'string' ? (
          <span key={p} aria-hidden="true" className="muted">…</span>
        ) : (
          item(p, p)
        ),
      )}
      {item(page + 1, <>Next <span aria-hidden="true">›</span></>, { key: 'next', aria: 'Next page', disabled: page >= totalPages, nav: true })}
      <span className="sr-only" aria-live="polite">Page {page} of {totalPages}</span>
    </nav>
  );
}
