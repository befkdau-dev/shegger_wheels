'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import CarCard from './CarCard';
import Pagination from '@/components/ui/Pagination';
import { EmptyState, LoadingBlock } from '@/components/ui/States';
import { IconSearch } from '@/components/ui/Icons';
import { todayISO } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { activeFilterCount, filterCars, filtersToQuery, PAGE_SIZE, paginate, parseFilters, SORTS, sortCars } from '@/lib/search';
import { publicCarsFrom, ratingMap } from '@/lib/selectors';

const numOrNull = (v) => (v === '' || v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(v));

export default function CatalogueClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { cars, users, bookings, reviews, isLoading } = useAppData();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState({ q: filters.q, minPrice: filters.minPrice ?? '', maxPrice: filters.maxPrice ?? '' });

  const publicCars = useMemo(() => publicCarsFrom(cars, users), [cars, users]);
  const ratings = useMemo(() => ratingMap(reviews), [reviews]);
  const neighbourhoods = useMemo(() => [...new Set(publicCars.map((c) => c.neighbourhood))].sort(), [publicCars]);

  const apply = (patch) => {
    const next = { ...filters, ...patch, page: patch.page ?? 1 };
    const qs = filtersToQuery(next);
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Keep the text inputs in sync when the URL changes from elsewhere (chips, clear, back button).
  useEffect(() => {
    setDraft({ q: filters.q, minPrice: filters.minPrice ?? '', maxPrice: filters.maxPrice ?? '' });
  }, [filters.q, filters.minPrice, filters.maxPrice]);

  // Debounced apply for typed inputs.
  useEffect(() => {
    const nextQ = draft.q.trim();
    const nextMin = numOrNull(draft.minPrice);
    const nextMax = numOrNull(draft.maxPrice);
    if (nextQ === filters.q && nextMin === filters.minPrice && nextMax === filters.maxPrice) return undefined;
    const t = setTimeout(() => apply({ q: nextQ, minPrice: nextMin, maxPrice: nextMax }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const results = useMemo(() => {
    const filtered = filterCars(publicCars, filters, bookings);
    return sortCars(filtered, filters.sort, bookings, reviews);
  }, [publicCars, filters, bookings, reviews]);

  const pageData = paginate(results, filters.page, PAGE_SIZE);

  // Clamp: if the URL asks for a page that no longer exists, move to the last valid one.
  useEffect(() => {
    if (!isLoading && pageData.page !== filters.page) apply({ page: pageData.page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, pageData.page, filters.page]);

  const hrefFor = (p) => {
    const qs = filtersToQuery({ ...filters, page: p });
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const dateQuery = filters.start && filters.end ? new URLSearchParams({ start: filters.start, end: filters.end }).toString() : '';
  const today = todayISO();
  const dateOrderError = filters.start && filters.end && filters.end < filters.start;
  const count = activeFilterCount(filters);

  const chips = [];
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”`, clear: { q: '' } });
  if (filters.neighbourhood) chips.push({ key: 'n', label: filters.neighbourhood, clear: { neighbourhood: '' } });
  if (filters.minPrice !== null) chips.push({ key: 'min', label: `From ETB ${filters.minPrice}`, clear: { minPrice: null } });
  if (filters.maxPrice !== null) chips.push({ key: 'max', label: `Up to ETB ${filters.maxPrice}`, clear: { maxPrice: null } });
  if (filters.transmission) chips.push({ key: 't', label: filters.transmission, clear: { transmission: '' } });
  if (filters.seats !== null) chips.push({ key: 's', label: `${filters.seats}+ seats`, clear: { seats: null } });
  if (filters.start && filters.end) chips.push({ key: 'd', label: `${filters.start} → ${filters.end}`, clear: { start: '', end: '' } });

  return (
    <div className="container">
      <div className="page-head">
        <h1>Find your car</h1>
        <p>Cars from local owners across Addis Ababa. Prices are per day in Ethiopian birr (ETB).</p>
      </div>

      <div className="catalogue-layout" style={{ marginTop: 20 }}>
        <aside className="filters" data-open={filtersOpen} aria-label="Search filters">
          <button
            type="button"
            className="btn btn-outline btn-block filter-toggle"
            aria-expanded={filtersOpen}
            aria-controls="filters-body"
            onClick={() => setFiltersOpen((o) => !o)}
          >
            {filtersOpen ? 'Hide filters' : `Show filters${count ? ` (${count})` : ''}`}
          </button>
          <form className="card filters-body" id="filters-body" role="search" onSubmit={(e) => e.preventDefault()} style={{ marginTop: 0 }}>
            <div className="field">
              <label htmlFor="f-q">Search make or model</label>
              <input id="f-q" className="input" type="search" placeholder="e.g. Corolla" value={draft.q} onChange={(e) => setDraft((d) => ({ ...d, q: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="f-hood">Neighbourhood</label>
              <select id="f-hood" className="select" value={filters.neighbourhood} onChange={(e) => apply({ neighbourhood: e.target.value })}>
                <option value="">All neighbourhoods</option>
                {neighbourhoods.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">Daily price (ETB)</legend>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input aria-label="Minimum daily price" className="input" type="number" inputMode="numeric" min="0" step="100" placeholder="Min" value={draft.minPrice} onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))} />
                <span aria-hidden="true">–</span>
                <input aria-label="Maximum daily price" className="input" type="number" inputMode="numeric" min="0" step="100" placeholder="Max" value={draft.maxPrice} onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))} />
              </div>
            </fieldset>
            <div className="field">
              <label htmlFor="f-trans">Transmission</label>
              <select id="f-trans" className="select" value={filters.transmission} onChange={(e) => apply({ transmission: e.target.value })}>
                <option value="">Any</option>
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="f-seats">Minimum seats</label>
              <select id="f-seats" className="select" value={filters.seats ?? ''} onChange={(e) => apply({ seats: numOrNull(e.target.value) })}>
                <option value="">Any</option>
                {[2, 4, 5, 7, 12].map((n) => (
                  <option key={n} value={n}>{n}+ seats</option>
                ))}
              </select>
            </div>
            <fieldset>
              <legend className="label">Available between</legend>
              <div className="stack" style={{ gap: 8 }}>
                <input aria-label="Available from" className="input" type="date" min={today} value={filters.start} onChange={(e) => apply({ start: e.target.value })} />
                <input aria-label="Available until" className="input" type="date" min={filters.start || today} value={filters.end} onChange={(e) => apply({ end: e.target.value })} />
              </div>
              {dateOrderError ? <p className="field-error" role="alert" style={{ marginTop: 6 }}>The end date must be on or after the start date.</p> : <p className="hint small muted" style={{ marginTop: 6 }}>Set both dates to see only cars that are free.</p>}
            </fieldset>
            <button type="button" className="btn btn-outline btn-block" onClick={() => router.replace(pathname, { scroll: false })} disabled={count === 0 && filters.sort === 'newest'}>
              Clear all filters
            </button>
          </form>
        </aside>

        <section aria-label="Search results">
          <div className="results-bar">
            <p className="mb-0" role="status" aria-live="polite">
              {isLoading ? 'Loading cars…' : results.length ? <>Showing <strong>{pageData.from}–{pageData.to}</strong> of <strong>{results.length}</strong> cars</> : '0 cars found'}
            </p>
            <div className="row">
              <label htmlFor="f-sort" className="small bold">Sort by</label>
              <select id="f-sort" className="select" style={{ width: 'auto' }} value={filters.sort} onChange={(e) => apply({ sort: e.target.value })}>
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {chips.length ? (
            <ul className="chips" aria-label="Active filters" style={{ listStyle: 'none', padding: 0 }}>
              {chips.map((c) => (
                <li key={c.key} className="chip">
                  {c.label}
                  <button type="button" aria-label={`Remove filter ${c.label}`} onClick={() => apply(c.clear)}>×</button>
                </li>
              ))}
            </ul>
          ) : null}

          {isLoading ? (
            <LoadingBlock label="Loading cars" rows={2} height={260} />
          ) : results.length === 0 ? (
            <EmptyState title="No cars match your filters" actionLabel="Clear all filters" onAction={() => router.replace(pathname, { scroll: false })}>
              Try a wider price range, another neighbourhood or different dates.
            </EmptyState>
          ) : (
            <>
              <div className="car-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
                {pageData.items.map((car, i) => (
                  <CarCard key={car.id} car={car} rating={ratings.get(car.id)} query={dateQuery} priority={i < 2} headingLevel="h2" />
                ))}
              </div>
              <Pagination page={pageData.page} totalPages={pageData.totalPages} hrefFor={hrefFor} label="Car results pages" />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
