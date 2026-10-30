'use client';
import { IconStar } from './Icons';

/** Read-only star display with a text alternative. */
export function Stars({ value, size = 16 }) {
  const rounded = Math.round(value || 0);
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar key={n} width={size} height={size} className={n <= rounded ? '' : 'off'} />
      ))}
    </span>
  );
}

/** Accessible rating input: a native radio group, fully keyboard operable. */
export function RatingInput({ value, onChange, error, name = 'rating' }) {
  return (
    <fieldset>
      <legend className="label">Your rating</legend>
      <div className="row" style={{ gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="btn btn-outline btn-sm" style={{ cursor: 'pointer', ...(value === n ? { background: 'var(--amber-100)', borderColor: 'var(--amber-500)' } : {}) }}>
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <IconStar width={18} height={18} style={{ color: value >= n ? 'var(--amber-500)' : '#c0cad8' }} />
            <span>{n}</span>
          </label>
        ))}
      </div>
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </fieldset>
  );
}
