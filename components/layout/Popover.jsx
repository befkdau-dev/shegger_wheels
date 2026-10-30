'use client';
import { useEffect, useId, useRef, useState } from 'react';

/** Disclosure popover: closes on Escape (returning focus) and on outside click. */
export default function Popover({ trigger, triggerClassName, triggerLabel, children, panelClassName = '', align = 'right' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const button = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current && button.current.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="menu" ref={wrap}>
      <button
        ref={button}
        type="button"
        className={triggerClassName}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={triggerLabel}
        onClick={() => setOpen((o) => !o)}
      >
        {trigger}
      </button>
      {open ? (
        <div id={panelId} className={`menu-panel ${panelClassName}`} style={align === 'left' ? { left: 0, right: 'auto' } : undefined} onClick={(e) => { if (e.target.closest('a, [data-close]')) setOpen(false); }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
