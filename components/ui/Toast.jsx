'use client';
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setItems((list) => list.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (message, type = 'success') => {
      counter.current += 1;
      const id = counter.current;
      setItems((list) => [...list.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), type === 'error' ? 7000 : 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Polite live region: screen readers announce each toast. */}
      <div className="toast-region" role="status" aria-live="polite" aria-atomic="false">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            <span>{t.message}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
