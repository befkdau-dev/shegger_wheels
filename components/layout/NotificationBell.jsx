'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { deriveNotifications } from '@/lib/notifications';
import { useAppData, useSession } from '@/lib/hooks';
import { relativeTime } from '@/lib/format';
import Popover from './Popover';
import { IconBell } from '@/components/ui/Icons';

/** Notification cards derived from demo records - not pushed from a server. */
export default function NotificationBell() {
  const { user } = useSession();
  const data = useAppData();
  const items = useMemo(
    () => (user ? deriveNotifications(user, data) : []),
    [user, data],
  );
  if (!user) return null;
  return (
    <Popover
      triggerClassName="icon-btn"
      triggerLabel={`Notifications, ${items.length} item${items.length === 1 ? '' : 's'}`}
      trigger={
        <>
          <IconBell />
          {items.length ? <span className="dot" aria-hidden="true">{items.length}</span> : null}
        </>
      }
      panelClassName="notif-panel"
    >
      <div className="menu-head">
        <strong>Notifications</strong>
        <div className="xsmall muted">Generated from your demo records</div>
      </div>
      {items.length === 0 ? (
        <p className="small muted" style={{ padding: '8px 12px' }}>You are all caught up.</p>
      ) : (
        <ul className="notif-list">
          {items.map((n) => {
            const body = (
              <>
                <strong>{n.title}</strong>
                <span>{n.text}</span>
                <span className="xsmall" style={{ display: 'block' }}>{relativeTime(n.at)}</span>
              </>
            );
            return (
              <li key={n.id}>
                {n.href ? (
                  <Link className={`notif tone-${n.tone}`} href={n.href}>{body}</Link>
                ) : (
                  <div className={`notif tone-${n.tone}`}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Popover>
  );
}
