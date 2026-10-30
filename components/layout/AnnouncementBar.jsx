'use client';
import { useEffect, useState } from 'react';
import { useAppData } from '@/lib/hooks';
import { KEYS, readStorage, writeStorage } from '@/lib/storage';
import { IconMegaphone } from '@/components/ui/Icons';

/** Shows the newest active admin announcement. Dismissal is a one-time UI flag in sessionStorage. */
export default function AnnouncementBar() {
  const { announcements, isLoading } = useAppData();
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    const stored = readStorage(KEYS.dismissed, [], 'session');
    setDismissed(Array.isArray(stored) ? stored : []);
  }, []);

  // Reserve the banner's height while storage is read so content below does not jump (CLS).
  if (isLoading) return <div aria-hidden="true" style={{ minHeight: 58 }} />;
  const current = announcements
    .filter((a) => a.active && !dismissed.includes(a.id))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))[0];
  if (!current) return null;

  const dismiss = () => {
    const next = [...dismissed, current.id];
    setDismissed(next);
    writeStorage(KEYS.dismissed, next, 'session');
  };

  return (
    <div className="announce" role="region" aria-label="Platform announcement">
      <div className="container">
        <IconMegaphone width={20} height={20} />
        <span>
          <strong>{current.title}.</strong> {current.message}
        </span>
        <button type="button" onClick={dismiss} aria-label={`Dismiss announcement: ${current.title}`}>
          ×
        </button>
      </div>
    </div>
  );
}
