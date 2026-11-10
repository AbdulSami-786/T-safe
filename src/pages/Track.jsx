import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon';
import { ItemsList, StatusBadge, StatusLevels } from '../components/OrderParts';
import { api } from '../api';
import { fmtDate, rs } from '../utils/format';
import { useSeo } from '../hooks/usePageTitle';

export default function Track() {
  useSeo('/track');
  const [params, setParams] = useSearchParams();
  const [order, setOrder] = useState(params.get('order') || '');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async (o, p) => {
    setBusy(true); setErr(''); setRes(null);
    try { setRes(await api.trackOrder(o.trim(), p.trim())); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  // Auto-run when arriving from a link (e.g. after checkout or from My Orders)
  useEffect(() => {
    const o = params.get('order'), p = params.get('phone');
    if (o && p) lookup(o, p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setParams({ order: order.trim(), phone: phone.trim() }, { replace: true });
    lookup(order, phone);
  };

  return (
    <section className="track page-track">
      <div className="wrap">
        <header className="sec-head">
          <span className="stk">Order Tracking</span>
          <h1 className="h-xl">Where’s my <mark className="pink">order?</mark></h1>
          <p>Enter your order number and the phone number used at checkout.</p>
        </header>

        <form className="lookup" onSubmit={submit}>
          <label><span>Order ID</span><input type="text" placeholder="e.g. TS-10024" value={order} onChange={(e) => setOrder(e.target.value)} required /></label>
          <label><span>Phone Number</span><input type="tel" placeholder="03XX XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
          <button className="btn btn-ink" type="submit" disabled={busy}>{busy ? 'Searching…' : <>Track Order <Icon name="box" /></>}</button>
        </form>

        {err && <p className="form-err on-pink" role="alert"><Icon name="x" /> {err}</p>}

        {res && (
          <div className="track-result">
            <div className="tr-head card">
              <div><small>Order</small><b>#{res.id}</b></div>
              <div><small>Placed</small><b>{fmtDate(res.createdAt)}</b></div>
              <div><small>Deliver to</small><b>{res.customer.name}, {res.customer.city}</b></div>
              <StatusBadge status={res.status} />
            </div>

            <StatusLevels status={res.status} />

            {(res.courier || res.trackingNo) && (
              <p className="courier card"><Icon name="truck" /> Courier: <b>{res.courier || '—'}</b>{res.trackingNo && <> · Tracking no. <b>{res.trackingNo}</b></>}</p>
            )}

            <div className="tr-grid">
              <div className="card pad">
                <h3 className="h-sm">Items</h3>
                <ItemsList items={res.items} />
                <dl className="mini-totals">
                  <div><dt>Subtotal</dt><dd>{rs(res.subtotal)}</dd></div>
                  <div><dt>Delivery</dt><dd>{res.delivery ? rs(res.delivery) : 'FREE'}</dd></div>
                  <div className="total"><dt>Total</dt><dd>{rs(res.total)}</dd></div>
                </dl>
              </div>
              <div className="card pad">
                <h3 className="h-sm">History</h3>
                <ol className="history">
                  {[...res.history].reverse().map((h, i) => (
                    <li key={i}><b>{h.status}</b><small>{fmtDate(h.at)}</small>{h.note && <p>{h.note}</p>}</li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
