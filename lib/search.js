// Pure catalogue search / filter / sort / pagination helpers (no storage access).
import { getAvailabilityConflict } from './bookings.js';
import { isValidISODate } from './format.js';

export const PAGE_SIZE = 6;
export const SORTS = [
  { value: 'newest', label: 'Newest listings' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'popular', label: 'Most popular' },
];

const FILTER_KEYS = ['q', 'neighbourhood', 'minPrice', 'maxPrice', 'transmission', 'seats', 'start', 'end', 'sort', 'page'];

/** Parse URLSearchParams (or a plain object) into a clean filter object. */
export function parseFilters(params) {
  const get = (k) => {
    const v = typeof params.get === 'function' ? params.get(k) : params[k];
    return typeof v === 'string' ? v.trim() : '';
  };
  const num = (k) => {
    const v = get(k);
    if (v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };
  const sort = get('sort');
  const start = get('start');
  const end = get('end');
  const page = Math.floor(Number(get('page')));
  return {
    q: get('q'),
    neighbourhood: get('neighbourhood'),
    minPrice: num('minPrice'),
    maxPrice: num('maxPrice'),
    transmission: ['Automatic', 'Manual'].includes(get('transmission')) ? get('transmission') : '',
    seats: num('seats'),
    start: isValidISODate(start) ? start : '',
    end: isValidISODate(end) ? end : '',
    sort: SORTS.some((s) => s.value === sort) ? sort : 'newest',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Turn filters back into a query string, omitting defaults so URLs stay short and shareable. */
export function filtersToQuery(f) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.neighbourhood) p.set('neighbourhood', f.neighbourhood);
  if (f.minPrice !== null && f.minPrice !== undefined && f.minPrice !== '') p.set('minPrice', String(f.minPrice));
  if (f.maxPrice !== null && f.maxPrice !== undefined && f.maxPrice !== '') p.set('maxPrice', String(f.maxPrice));
  if (f.transmission) p.set('transmission', f.transmission);
  if (f.seats) p.set('seats', String(f.seats));
  if (f.start) p.set('start', f.start);
  if (f.end) p.set('end', f.end);
  if (f.sort && f.sort !== 'newest') p.set('sort', f.sort);
  if (f.page && f.page > 1) p.set('page', String(f.page));
  return p.toString();
}

export function activeFilterCount(f) {
  return ['q', 'neighbourhood', 'transmission'].filter((k) => f[k]).length +
    [f.minPrice, f.maxPrice, f.seats].filter((v) => v !== null && v !== undefined).length +
    (f.start && f.end ? 1 : 0);
}

/** Popularity demo metric: bookings that were actually accepted, plus one point per review star above 3. */
export function popularityScore(carId, bookings, reviews) {
  const accepted = bookings.filter(
    (b) => b.carId === carId && !['requested', 'declined', 'cancelled'].includes(b.status),
  ).length;
  const bonus = reviews.filter((r) => r.carId === carId && r.rating >= 4).length;
  return accepted * 2 + bonus;
}

export function filterCars(cars, f, bookings = []) {
  const q = f.q.toLowerCase();
  return cars.filter((car) => {
    if (q) {
      const hay = `${car.make} ${car.model} ${car.year} ${car.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.neighbourhood && car.neighbourhood !== f.neighbourhood) return false;
    if (f.minPrice !== null && car.pricePerDay < f.minPrice) return false;
    if (f.maxPrice !== null && car.pricePerDay > f.maxPrice) return false;
    if (f.transmission && car.transmission !== f.transmission) return false;
    if (f.seats !== null && car.seats < f.seats) return false;
    if (f.start && f.end && f.end >= f.start) {
      if (getAvailabilityConflict(car, bookings, f.start, f.end)) return false;
    }
    return true;
  });
}

export function sortCars(cars, sort, bookings = [], reviews = []) {
  const list = [...cars];
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.pricePerDay - b.pricePerDay);
    case 'price-desc':
      return list.sort((a, b) => b.pricePerDay - a.pricePerDay);
    case 'popular': {
      const score = new Map(list.map((c) => [c.id, popularityScore(c.id, bookings, reviews)]));
      return list.sort((a, b) => score.get(b.id) - score.get(a.id) || a.pricePerDay - b.pricePerDay);
    }
    case 'newest':
    default:
      return list.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  }
}

/** Clamp the requested page into range so filters never leave the user on an empty page. */
export function paginate(items, page, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
    from: items.length ? start + 1 : 0,
    to: Math.min(start + pageSize, items.length),
  };
}

export { FILTER_KEYS };
