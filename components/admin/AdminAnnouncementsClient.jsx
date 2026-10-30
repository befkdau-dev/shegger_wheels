'use client';
import { useState } from 'react';
import Field from '@/components/ui/Field';
import { Alert, EmptyState, LoadingBlock } from '@/components/ui/States';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { createAnnouncement, setAnnouncementActive } from '@/lib/admin';
import { formatDate } from '@/lib/format';
import { useAppData } from '@/lib/hooks';

export default function AdminAnnouncementsClient() {
  const { announcements, isLoading } = useAppData();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  if (isLoading) return <LoadingBlock label="Loading announcements" rows={2} height={80} />;

  const submit = (e) => {
    e.preventDefault();
    const res = createAnnouncement({ title, message });
    if (!res.ok) {
      setErrors(res.errors || {});
      setFormError(res.error);
      return;
    }
    setErrors({});
    setFormError('');
    setTitle('');
    setMessage('');
    toast('Announcement published.');
  };

  const toggle = (a) => {
    const res = setAnnouncementActive(a.id, !a.active);
    toast(res.ok ? (a.active ? 'Announcement deactivated.' : 'Announcement reactivated.') : res.error, res.ok ? 'success' : 'error');
  };

  const sorted = [...announcements].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

  return (
    <div className="stack-lg">
      <div><h1>Announcements</h1><p className="muted mb-0">Active announcements appear in a banner for every signed-in or public page visitor.</p></div>
      <form className="card stack" onSubmit={submit} noValidate aria-labelledby="an-h">
        <h2 id="an-h" style={{ fontSize: '1.1rem', margin: 0 }}>New announcement</h2>
        {formError ? <Alert type="error"><p className="mb-0">{formError}</p></Alert> : null}
        <Field label="Title" error={errors.title} required>{(p) => <input {...p} className="input" value={title} onChange={(e) => setTitle(e.target.value)} />}</Field>
        <Field label="Message" error={errors.message} required hint={`${message.length}/400 characters`}>{(p) => <textarea {...p} className="textarea" value={message} onChange={(e) => setMessage(e.target.value)} />}</Field>
        <div><button type="submit" className="btn btn-accent btn-lg">Publish announcement</button></div>
      </form>

      <section aria-labelledby="al-h">
        <h2 id="al-h">All announcements</h2>
        {sorted.length === 0 ? <EmptyState title="No announcements yet">Publish one to show a banner across the site.</EmptyState> : (
          <div className="table-wrap">
            <table className="data">
              <caption className="sr-only">Announcements</caption>
              <thead><tr><th scope="col">Title</th><th scope="col">Message</th><th scope="col">Created</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
              <tbody>
                {sorted.map((a) => (
                  <tr key={a.id}>
                    <th scope="row">{a.title}</th>
                    <td style={{ maxWidth: 360 }}>{a.message}</td>
                    <td>{formatDate(a.createdAt)}</td>
                    <td><StatusBadge status={a.active ? 'active' : 'inactive'} /></td>
                    <td className="actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => toggle(a)}>{a.active ? 'Deactivate' : 'Reactivate'}<span className="sr-only"> {a.title}</span></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
