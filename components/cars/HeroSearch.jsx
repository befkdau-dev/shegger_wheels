import { NEIGHBOURHOODS } from '@/lib/places';

/** Plain GET form -> /cars?neighbourhood=...&start=...&end=... Works without JavaScript. */
export default function HeroSearch() {
  return (
    <form className="search-panel" action="/cars" method="get" role="search" aria-label="Find a car">
      <div className="field">
        <label htmlFor="hero-hood">Pick-up area</label>
        <select id="hero-hood" name="neighbourhood" className="select" defaultValue="">
          <option value="">Anywhere in Addis</option>
          {NEIGHBOURHOODS.map((h) => (
            <option key={h.name} value={h.name}>{h.name}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="hero-start">From</label>
        <input id="hero-start" name="start" type="date" className="input" />
      </div>
      <div className="field">
        <label htmlFor="hero-end">Until</label>
        <input id="hero-end" name="end" type="date" className="input" />
      </div>
      <button type="submit" className="btn btn-accent btn-lg">Search cars</button>
    </form>
  );
}
