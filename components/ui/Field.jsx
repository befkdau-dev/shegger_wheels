'use client';
import { useId } from 'react';

/** Label + control + hint + error wiring. `children` is a render function that receives control props. */
export default function Field({ label, hint, error, className = '', children, required = false }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>
        {label}
        {required ? <span aria-hidden="true" style={{ color: 'var(--red-600)' }}> *</span> : null}
      </label>
      {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? 'true' : undefined, 'aria-required': required || undefined })}
      {hint ? <span id={hintId} className="hint">{hint}</span> : null}
      {error ? <span id={errId} className="field-error" role="alert">{error}</span> : null}
    </div>
  );
}
