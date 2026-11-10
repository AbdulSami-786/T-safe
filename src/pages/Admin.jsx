import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import AdminOrders from '../components/admin/AdminOrders';
import { AdminUsers, AdminSubscribers } from '../components/admin/AdminUsers';
import AdminProducts from '../components/admin/AdminProducts';
import AdminReviews from '../components/admin/AdminReviews';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { fmtDate, rs } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

const PAID = ['Payment Verified', 'Packed', 'Out For Delivery', 'Delivered'];
const REDEPLOY = 'This part of the dashboard needs the latest backend/Code.gs — paste it into Apps Script and Deploy → Manage deployments → Edit → New version → Deploy.';
const niceErr = (m) => (/unknown action/i.test(m) ? REDEPLOY : m);

export default function Admin() {
  usePageTitle('Admin');
  const { user, token, ready, isAdmin } = useAuth();
  const [tab, setTab] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('All');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState(null);
  const [users, setUsers] = useState(null);
  const [products, setProducts] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [subs, setSubs] = useState(null);
  const [errs, setErrs] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const jobs = {
      orders: [api.adminOrders(token), setOrders],
      users: [api.adminUsers(token), setUsers],
      products: [api.adminProducts(token), setProducts],
      reviews: [api.adminReviews(token), setReviews],
      subs: [api.adminSubscribers(token), setSubs],
    };
    const keys = Object.keys(jobs);
    const res = await Promise.allSettled(keys.map((k) => jobs[k][0]));
    const e = {};
    res.forEach((r, i) => {
      if (r.status === 'fulfilled') jobs[keys[i]][1](r.value);
      else { e[keys[i]] = niceErr(r.reason?.message || 'Could not load.'); jobs[keys[i]][1]((cur) => cur ?? []); }
    });
    setErrs(e);
    setLoading(false);
  }, [token]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  const stats = useMemo(() => {
    const list = orders || [];
    const paid = list.filter((o) => PAID.includes(o.status));
    const awaiting = list.filter((o) => o.status === 'Order Placed');
    return {
      total: list.length,
      awaiting,
      awaitingValue: awaiting.reduce((s, o) => s + o.total, 0),
      shipping: list.filter((o) => ['Packed', 'Out For Delivery'].includes(o.status)).length,
      delivered: list.filter((o) => o.status === 'Delivered').length,
      revenue: paid.reduce((s, o) => s + o.total, 0),
      cancelled: list.filter((o) => o.status === 'Cancelled').length,
    };
  }, [orders]);

  const pendingReviews = (reviews || []).filter((r) => !r.approved).length;
  const lowStock = (products || []).filter((p) => p.active && p.stock !== null && p.stock <= 20);

  if (!ready) return <section className="page wrap"><p className="muted">Loading…</p></section>;
  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  if (!isAdmin) {
    return (
      <section className="page wrap">
        <div className="empty card"><Icon name="lock" /><h1>Admins only</h1><p>Your account does not have access to this page.</p><Link className="btn btn-blue" to="/">Back to home</Link></div>
      </section>
    );
  }

  const goOrders = (status) => { setOrderFilter(status); setTab('orders'); };

  const TABS = [
    ['overview', 'Overview'],
    ['orders', 'Orders', stats.awaiting.length],
    ['users', 'Users', null],
    ['products', 'Products', lowStock.length],
    ['reviews', 'Reviews', pendingReviews],
    ['subs', 'Subscribers', null],
  ];

  const body = (data, err, render) => {
    if (err) return <p className="form-err"><Icon name="x" /> {err}</p>;
    if (!data) return <p className="muted">Loading…</p>;
    return render(data);
  };

  return (
    <section className="page wrap">
      <header className="sec-head acct-head">
        <div>
          <span className="stk">Admin</span>
          <h1 className="h-xl">Control <mark>panel</mark></h1>
        </div>
        <button type="button" className="btn btn-white" onClick={load} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</button>
      </header>

      <nav className="ad-tabs" role="tablist" aria-label="Admin sections">
        {TABS.map(([k, label, n]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => (k === 'orders' ? goOrders('All') : setTab(k))}>
            {label}{n ? <i className="ad-count">{n}</i> : null}
          </button>
        ))}
      </nav>

      {tab === 'overview' && body(orders, errs.orders, () => (
        <>
          <div className="stat-row">
            <div className="stat s1"><b>{stats.total}</b><span>Total orders</span></div>
            <div className="stat s2"><b>{stats.awaiting.length}</b><span>Payments to verify ({rs(stats.awaitingValue)})</span></div>
            <div className="stat s3"><b>{stats.shipping}</b><span>Packed / on the way</span></div>
            <div className="stat s4"><b>{rs(stats.revenue)}</b><span>Verified sales (excl. cancelled)</span></div>
          </div>
          <div className="stat-row">
            <div className="stat s3"><b>{stats.delivered}</b><span>Delivered</span></div>
            <div className="stat s1"><b>{stats.cancelled}</b><span>Cancelled</span></div>
            <div className="stat s2"><b>{users ? users.length : '—'}</b><span>Registered users</span></div>
            <div className="stat s4"><b>{subs ? subs.length : '—'}</b><span>Newsletter subscribers</span></div>
          </div>

          <div className="ad-two">
            <div className="card ad-panel">
              <h3>Payments waiting for verification</h3>
              {stats.awaiting.length === 0 && <p className="muted">All caught up — no unverified payments.</p>}
              {stats.awaiting.slice(0, 6).map((o) => (
                <button key={o.id} type="button" className="ad-line" onClick={() => goOrders('Order Placed')}>
                  <b>#{o.id}</b><span>{o.customer.name}</span><em>{rs(o.total)}</em><small>{fmtDate(o.createdAt)}</small>
                </button>
              ))}
              {stats.awaiting.length > 6 && <button type="button" className="link-btn" onClick={() => goOrders('Order Placed')}>See all {stats.awaiting.length} →</button>}
            </div>

            <div className="card ad-panel">
              <h3>Needs attention</h3>
              <button type="button" className="ad-line" onClick={() => setTab('reviews')}>
                <b>{pendingReviews}</b><span>review{pendingReviews === 1 ? '' : 's'} waiting for approval</span>
              </button>
              {lowStock.length === 0
                ? <p className="muted">Stock levels look fine.</p>
                : lowStock.map((p) => (
                  <button key={p.id} type="button" className="ad-line" onClick={() => setTab('products')}>
                    <b>{p.stock}</b><span>{p.name} — {p.stock <= 0 ? 'sold out' : 'low stock'}</span>
                  </button>
                ))}
              {Object.entries(errs).filter(([k]) => k !== 'orders').map(([k, m]) => <p key={k} className="form-err"><Icon name="x" /> {k}: {m}</p>)}
            </div>
          </div>

          <div className="card ad-panel" style={{ marginTop: 24 }}>
            <h3>Latest orders</h3>
            {(orders || []).slice(0, 6).map((o) => (
              <button key={o.id} type="button" className="ad-line" onClick={() => goOrders('All')}>
                <b>#{o.id}</b><span>{o.customer.name}</span><em>{rs(o.total)}</em><small>{o.status}</small>
              </button>
            ))}
            {!(orders || []).length && <p className="muted">No orders yet.</p>}
          </div>
        </>
      ))}

      {tab === 'orders' && body(orders, errs.orders, (d) => (
        <AdminOrders key={orderFilter} orders={d} token={token} setOrders={setOrders} initialStatus={orderFilter} />
      ))}
      {tab === 'users' && body(users, errs.users, (d) => <AdminUsers users={d} me={user} token={token} setUsers={setUsers} />)}
      {tab === 'products' && body(products, errs.products, (d) => <AdminProducts products={d} token={token} setProducts={setProducts} />)}
      {tab === 'reviews' && body(reviews, errs.reviews, (d) => <AdminReviews reviews={d} token={token} setReviews={setReviews} />)}
      {tab === 'subs' && body(subs, errs.subs, (d) => <AdminSubscribers subs={d} />)}
    </section>
  );
}
