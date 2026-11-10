import { useMemo, useState } from 'react';
import Icon from '../Icon';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import { fmtDate, rs } from '../../utils/format';

function UserCard({ u, me, token, onSaved, onDeleted }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: u.name, email: u.email, phone: u.phone, role: u.role, newPassword: '' });
  const [busy, setBusy] = useState(false);
  const self = u.id === me.id;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    setBusy(true);
    try {
      const body = { token, userId: u.id, name: f.name, email: f.email, phone: f.phone, role: f.role };
      if (f.newPassword) body.newPassword = f.newPassword;
      const updated = await api.adminUpdateUser(body);
      toast.success(f.newPassword ? `${updated.name} saved — password reset` : `${updated.name} saved`);
      setF((x) => ({ ...x, newPassword: '' }));
      onSaved(updated);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm(`Delete the account of ${u.name} (${u.email})? Their past orders stay in the Orders sheet.`)) return;
    setBusy(true);
    try {
      await api.adminDeleteUser({ token, userId: u.id });
      toast.success(`${u.name} deleted`);
      onDeleted(u.id);
    } catch (e) { toast.error(e.message); setBusy(false); }
  };

  return (
    <article className={'ad-item card' + (open ? ' open' : '')}>
      <button type="button" className="ad-item-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="ad-ava"><Icon name="user" /></span>
        <span className="ad-item-main">
          <b>{u.name}{self && ' (you)'}</b>
          <small>{u.email} · {u.phone}</small>
        </span>
        <span className={'badge ' + (u.role === 'admin' ? 'warn' : 'info')}>{u.role}</span>
        <span className="ad-item-meta">{u.orders} order{u.orders === 1 ? '' : 's'} · {rs(u.spent)}</span>
      </button>
      {open && (
        <div className="ad-item-body">
          <p className="muted">Joined {fmtDate(u.createdAt) || '—'} · ID {u.id}</p>
          <div className="ad-mini">
            <label className="field"><span>Name</span><input value={f.name} onChange={set('name')} /></label>
            <label className="field"><span>Email</span><input type="email" value={f.email} onChange={set('email')} /></label>
            <label className="field"><span>Phone</span><input value={f.phone} onChange={set('phone')} /></label>
            <label className="field"><span>Role</span>
              <select value={f.role} onChange={set('role')} disabled={self}>
                <option value="customer">customer</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
          <label className="field"><span>Reset password <small>(leave blank to keep — min. 8 characters; signs them out)</small></span>
            <input type="text" autoComplete="off" value={f.newPassword} onChange={set('newPassword')} placeholder="New password" />
          </label>
          <div className="ad-actions">
            <button type="button" className="btn btn-ink" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save user'}</button>
            {!self && <button type="button" className="btn btn-white ad-danger" disabled={busy} onClick={remove}><Icon name="trash" /> Delete user</button>}
          </div>
        </div>
      )}
    </article>
  );
}

export function AdminUsers({ users, me, token, setUsers }) {
  const [q, setQ] = useState('');
  const [role, setRole] = useState('All');
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return users.filter((u) => (role === 'All' || u.role === role) &&
      (!t || u.name.toLowerCase().includes(t) || u.email.toLowerCase().includes(t) || u.phone.includes(t)));
  }, [users, q, role]);

  return (
    <>
      <div className="ad-filters">
        <input type="search" placeholder="Search name, email or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option>All</option><option value="customer">customer</option><option value="admin">admin</option>
        </select>
      </div>
      <div className="ad-list">
        {shown.map((u) => (
          <UserCard
            key={u.id} u={u} me={me} token={token}
            onSaved={(n) => setUsers((cur) => cur.map((x) => (x.id === n.id ? n : x)))}
            onDeleted={(id) => setUsers((cur) => cur.filter((x) => x.id !== id))}
          />
        ))}
        {!shown.length && <p className="muted">No users match.</p>}
      </div>
    </>
  );
}

export function AdminSubscribers({ subs }) {
  const toast = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(subs.map((s) => s.email).join(', '));
      toast.success(`${subs.length} email${subs.length === 1 ? '' : 's'} copied`);
    } catch { toast.error('Could not copy — select the emails manually.'); }
  };
  return (
    <>
      <div className="ad-filters">
        <button type="button" className="btn btn-white" onClick={copy} disabled={!subs.length}><Icon name="mail" /> Copy all emails</button>
      </div>
      <div className="ad-list">
        {subs.map((s) => (
          <div className="ad-item card ad-flat" key={s.email}>
            <span className="ad-ava"><Icon name="mail" /></span>
            <span className="ad-item-main"><b>{s.email}</b><small>{fmtDate(s.createdAt)}</small></span>
          </div>
        ))}
        {!subs.length && <p className="muted">No newsletter subscribers yet.</p>}
      </div>
    </>
  );
}
