import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { ItemsList, StatusBadge, StatusLevels } from '../components/OrderParts';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { fmtDate, rs } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

export default function Account() {
  usePageTitle('My Orders');
  const { user, token, ready, logout, isAdmin } = useAuth();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState('');
  const [openId, setOpenId] = useState('');

  useEffect(() => {
    if (!user) return;
    api.myOrders(token).then(setOrders).catch((e) => setErr(e.message));
  }, [user, token]);

  if (!ready) return <section className="page wrap"><p className="muted">Loading…</p></section>;
  if (!user) return <Navigate to="/login" state={{ from: '/account' }} replace />;

  return (
    <section className="page wrap">
      <header className="sec-head acct-head">
        <div>
          <span className="stk">My account</span>
          <h1 className="h-xl">Hi, <mark>{user.name.split(' ')[0]}</mark></h1>
          <p>{user.email} · {user.phone}</p>
        </div>
        <div className="row-btns">
          {isAdmin && <Link className="btn btn-lemon" to="/admin">Admin panel <Icon name="clipboard" /></Link>}
          <button className="btn btn-white" type="button" onClick={logout}>Log out</button>
        </div>
      </header>

      <h2 className="h-sm">My orders</h2>
      {err && <p className="form-err"><Icon name="x" /> {err}</p>}
      {!orders && !err && <p className="muted">Loading your orders…</p>}
      {orders && orders.length === 0 && (
        <div className="empty card">
          <Icon name="box" />
          <h3>No orders yet</h3>
          <p>When you place an order it will appear here.</p>
          <Link className="btn btn-blue" to="/shop">Shop now <Icon name="arrow" /></Link>
        </div>
      )}

      <div className="order-list">
        {orders?.map((o) => (
          <article className="order-card card" key={o.id}>
            <header>
              <div><small>Order</small><b>#{o.id}</b></div>
              <div><small>Placed</small><b>{fmtDate(o.createdAt)}</b></div>
              <div><small>Total</small><b>{rs(o.total)}</b></div>
              <StatusBadge status={o.status} />
            </header>
            <ItemsList items={o.items} />
            <div className="row-btns">
              <button type="button" className="btn btn-white" onClick={() => setOpenId(openId === o.id ? '' : o.id)}>{openId === o.id ? 'Hide progress' : 'View progress'}</button>
              <Link className="btn btn-ink" to={`/track?order=${o.id}&phone=${o.customer.phone}`}>Track <Icon name="box" /></Link>
            </div>
            {openId === o.id && (
              <>
                <StatusLevels status={o.status} />
                {(o.courier || o.trackingNo) && <p className="courier"><Icon name="truck" /> {o.courier} {o.trackingNo && <>· Tracking no. <b>{o.trackingNo}</b></>}</p>}
              </>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
