import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { ItemsList, StatusBadge } from '../components/OrderParts';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';
import { STATUS_STEPS, PAYMENT_METHODS } from '../data/products';
import { fmtDate, rs } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

const ALL_STATUSES = [...STATUS_STEPS.map((s) => s.key), 'Cancelled'];

function OrderRow({ o, token, onSaved }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ status: o.status, courier: o.courier || '', trackingNo: o.trackingNo || '', note: '' });
  const [busy, setBusy] = useState(false);
  const pm = PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.name || o.paymentMethod;
  const proofIsLink = /^https?:\/\//.test(o.proofUrl || '');

  const save = async () => {
    setBusy(true);
    try {
      const updated = await api.adminUpdateOrder({ token, orderId: o.id, ...f });
      toast.success(`Order ${o.id} updated`);
      setF((x) => ({ ...x, note: '' }));
      onSaved(updated);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <>
      <tr className={'ad-row' + (open ? ' open' : '')} onClick={() => setOpen(!open)}>
        <td><b>#{o.id}</b></td>
        <td>{fmtDate(o.createdAt)}</td>
        <td>{o.customer.name}<small>{o.customer.phone}</small></td>
        <td>{rs(o.total)}</td>
        <td>{pm}</td>
        <td><StatusBadge status={o.status} /></td>
        <td className="chev" aria-hidden="true">{open ? '−' : '+'}</td>
      </tr>
      {open && (
        <tr className="ad-detail">
          <td colSpan={7}>
            <div className="ad-grid">
              <div>
                <h4>Customer</h4>
                <p>{o.customer.name}<br />{o.customer.phone}{o.customer.email && <><br />{o.customer.email}</>}<br />{o.customer.address}, {o.customer.city}</p>
                <h4>Items</h4>
                <ItemsList items={o.items} />
                <p className="muted">Subtotal {rs(o.subtotal)} · Delivery {o.delivery ? rs(o.delivery) : 'FREE'} · <b>Total {rs(o.total)}</b></p>
                <h4>Payment proof</h4>
                {proofIsLink
                  ? <a className="btn btn-white" href={o.proofUrl} target="_blank" rel="noreferrer noopener"><Icon name="eye" /> Open proof ({pm})</a>
                  : <p className="muted">{o.proofUrl || 'No proof attached'}</p>}
              </div>

              <div className="ad-edit">
                <h4>Update order</h4>
                <label className="field"><span>Status</span>
                  <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
                    {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </label>
                <div className="grid2">
                  <label className="field"><span>Courier</span><input value={f.courier} onChange={(e) => setF({ ...f, courier: e.target.value })} placeholder="e.g. TCS, Leopards" /></label>
                  <label className="field"><span>Tracking no.</span><input value={f.trackingNo} onChange={(e) => setF({ ...f, trackingNo: e.target.value })} /></label>
                </div>
                <label className="field"><span>Note for history (optional)</span><input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></label>
                <button type="button" className="btn btn-ink" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button>

                <h4>History</h4>
                <ol className="history">
                  {[...o.history].reverse().map((h, i) => <li key={i}><b>{h.status}</b><small>{fmtDate(h.at)}</small>{h.note && <p>{h.note}</p>}</li>)}
                </ol>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function Admin() {
  usePageTitle('Admin');
  const { user, token, ready, isAdmin } = useAuth();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');

  const load = useCallback(() => {
    setErr('');
    api.adminOrders(token).then(setOrders).catch((e) => setErr(e.message));
  }, [token]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const stats = useMemo(() => {
    const list = orders || [];
    const live = list.filter((o) => o.status !== 'Cancelled');
    return {
      total: list.length,
      pending: list.filter((o) => o.status === 'Order Placed').length,
      shipping: list.filter((o) => ['Packed', 'Out For Delivery'].includes(o.status)).length,
      revenue: live.reduce((s, o) => s + o.total, 0),
    };
  }, [orders]);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (orders || []).filter((o) =>
      (status === 'All' || o.status === status) &&
      (!t || o.id.toLowerCase().includes(t) || o.customer.name.toLowerCase().includes(t) || o.customer.phone.includes(t)));
  }, [orders, q, status]);

  if (!ready) return <section className="page wrap"><p className="muted">Loading…</p></section>;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (!isAdmin) {
    return (
      <section className="page wrap">
        <div className="empty card"><Icon name="lock" /><h1>Admins only</h1><p>Your account does not have access to this page.</p><Link className="btn btn-blue" to="/">Back to home</Link></div>
      </section>
    );
  }

  const replace = (u) => setOrders((cur) => cur.map((o) => (o.id === u.id ? u : o)));

  return (
    <section className="page wrap">
      <header className="sec-head acct-head">
        <div>
          <span className="stk">Admin</span>
          <h1 className="h-xl">Orders <mark>desk</mark></h1>
        </div>
        <button type="button" className="btn btn-white" onClick={load}>Refresh</button>
      </header>

      <div className="stat-row">
        <div className="stat s1"><b>{stats.total}</b><span>Total orders</span></div>
        <div className="stat s2"><b>{stats.pending}</b><span>Awaiting verification</span></div>
        <div className="stat s3"><b>{stats.shipping}</b><span>Packed / on the way</span></div>
        <div className="stat s4"><b>{rs(stats.revenue)}</b><span>Order value (excl. cancelled)</span></div>
      </div>

      <div className="ad-filters">
        <input type="search" placeholder="Search order ID, name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {err && <p className="form-err"><Icon name="x" /> {err}</p>}
      {!orders && !err && <p className="muted">Loading orders…</p>}

      {orders && (
        <div className="table-scroll card">
          <table className="ad-table">
            <thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>Total</th><th>Paid via</th><th>Status</th><th /></tr></thead>
            <tbody>
              {shown.map((o) => <OrderRow key={o.id} o={o} token={token} onSaved={replace} />)}
              {!shown.length && <tr><td colSpan={7} className="muted center">No orders match.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
