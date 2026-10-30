'use client';
import { useState } from 'react';
import { resetDemoData } from '@/lib/data';
import { useStorageHealth } from '@/lib/hooks';
import { Alert } from '@/components/ui/States';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

/** Recovery UI for unavailable storage or malformed saved JSON. */
export default function StorageNotice() {
  const { available, problems } = useStorageHealth();
  const [confirm, setConfirm] = useState(false);
  const { toast } = useToast();

  if (available && problems.length === 0) return null;

  const reset = () => {
    const res = resetDemoData();
    setConfirm(false);
    toast(res.ok ? 'Demo data restored to the seed.' : res.error, res.ok ? 'success' : 'error');
  };

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      {!available ? (
        <Alert type="error" title="Browser storage is unavailable">
          <p className="mb-0">
            Sheggar Wheels keeps its demo data in your browser. Storage looks blocked (private mode or strict privacy settings).
            You can browse, but signing in and saving will not work until storage is allowed for this site.
          </p>
        </Alert>
      ) : (
        <Alert type="warning" title="Some saved demo data could not be read">
          <ul style={{ margin: '4px 0 8px 18px', padding: 0 }}>
            {problems.map((p) => (
              <li key={p.key}>{p.message}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirm(true)}>
            Reset demo data
          </button>
        </Alert>
      )}
      <ConfirmDialog
        open={confirm}
        title="Reset all demo data?"
        confirmLabel="Reset demo data"
        tone="danger"
        onConfirm={reset}
        onCancel={() => setConfirm(false)}
      >
        <p>This clears every saved car, booking, review and account in this browser and restores the original seed data.</p>
      </ConfirmDialog>
    </div>
  );
}
