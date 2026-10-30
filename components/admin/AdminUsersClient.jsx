'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { LoadingBlock } from '@/components/ui/States';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ui/Toast';
import { setUserStatus } from '@/lib/admin';
import { formatDate } from '@/lib/format';
import { useAppData } from '@/lib/hooks';
import { paginate } from '@/lib/search';

export function SuspendButton({ user, size = 'btn-sm' }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  if (user.roles.includes('admin')) return <span className="muted small">Protected</span>;
  const suspending = user.status === 'active';
  const go = () => {
    const res = setUserStatus(user.id, suspending ? 'suspended' : 'active');
    setOpen(false);
    toast(res.ok ? (suspending ? `${user.name} suspended.` : `${user.name} reinstated.`) : res.error, res.ok ? 'success' : 'error');
  };
  return (
    <>
      <button type="button" className={`btn ${size} ${suspending ? 'btn-outline' : 'btn-success'}`} onClick={() => setOpen(true)}>
        {suspending ? 'Suspend' : 'Reinstate'}<span className="sr-only"> {user.name}</span>
      </button>
      <ConfirmDialog open={open} title={suspending ? `Suspend ${user.name}?` : `Reinstate ${user.name}?`} confirmLabel={suspending ? 'Suspend' : 'Reinstate'} tone={suspending ? 'danger' : 'primary'} onConfirm={go} onCancel={() => setOpen(false)}>
        <p>{suspending ? 'They will be blocked from demo actions and their cars disappear from public search.' : 'Their access and public listings are restored.'}</p>
      </ConfirmDialog>
    </>
  );
}

export default function AdminUsersClient() {
  const { users, isLoading } = useAppData();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter((u) => !t || `${u.name} ${u.email}`.toLowerCase().includes(t));
  }, [users, q]);
  const data = paginate(filtered, page, 8);
  if (isLoading) return <LoadingBlock label="Loading users" rows={4} height={56} />;

  return (
    <div className="stack-lg">
      <div className="row-between">
        <div><h1>Demo users</h1><p className="muted mb-0">Suspend or reinstate demo accounts.</p></div>
        <div className="field mb-0" style={{ minWidth: 240, marginBottom: 0 }}>
          <label htmlFor="u-q">Search users</label>
          <input id="u-q" type="search" className="input" placeholder="Name or email" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        </div>
      </div>
      <div className="table-wrap">
        <table className="data">
          <caption className="sr-only">Demo users</caption>
          <thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Roles</th><th scope="col">Joined</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {data.items.length === 0 ? <tr><td colSpan={6} className="muted">No users match your search.</td></tr> : data.items.map((u) => (
              <tr key={u.id}>
                <th scope="row"><Link href={`/admin/users/${u.id}`}>{u.name}</Link></th>
                <td>{u.email}</td>
                <td>{u.roles.join(', ')}</td>
                <td>{formatDate(u.createdAt)}</td>
                <td><StatusBadge status={u.status} /></td>
                <td className="actions"><SuspendButton user={u} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={data.page} totalPages={data.totalPages} onPage={setPage} label="User list pages" />
    </div>
  );
}
