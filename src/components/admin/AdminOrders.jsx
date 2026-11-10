import { useMemo, useState } from 'react';
import Icon from '../Icon';
import { ItemsList, StatusBadge } from '../OrderParts';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import { STATUS_STEPS, PAYMENT_METHODS } from '../../data/products';
import { fmtDate, rs } from '../../utils/format';

export const ALL_STATUSES = [...STATUS_STEPS.map((s) => s.key), 'Cancelled'];

function OrderRow({ o, token, onSaved, onDeleted }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ status: o.status, courier: o.courier || '', trackingNo: o.trackingNo || '', note: '' });
  const [c, setC] = useState({ ...o.customer });
  const [busy, setBusy] = useState(false);
  const pm = PAYMENT_METHODS.find((m) => m.id === o.paymentMethod)?.name || o.paymentMethod;
  const proofIsLink = /^https?:\/\//.test(o.proofUrl || '');

  const send = async (extra, okMsg) => {
    setBusy(true);
    try {
      const updated = await api.adminUpdateOrder({ token, orderId: o.id, courier: f.courier, trackingNo: f.trackingNo, ...extra });
      toast.success(okMsg || `Order ${o.id} updated`);
      setF((x) => ({ ...x, status: updated.status, note: '' }));
      onSaved(updated);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const save = () => send({ status: f.status, note: f.note });
  const saveCustomer = () => send({ customer: c }, 'Customer details saved');
  const verify = () => send({ status: 'Payment Verified', note: 'Payment verified' }, `Payment verified for ${o.id}`);
  const reject = () => {
    if (!window.confirm(`Reject the payment and cancel order ${o.id}? Stock will be returned.`)) return;
    send({ status: 'Cancelled', note: f.note || 'Payment could not be verified' }, `Order ${o.id} cancelled`);
  };
  const remove = async () => {
    if (!window.confirm(`Permanently DELETE order ${o.id}? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api.adminDeleteOrder({ token, orderId: o.id });
      toast.success(`Order ${o.id} deleted`);
      onDeleted(o.id);
    } catch (e) { toast.error(e.message); setBusy(false); }
  };

  const setCk = (k) => (e) => setC({ ...c, [k]: e.target.value });

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
                <h4>Items</h4>
                <ItemsList items={o.items} />
                <p className="muted">Subtotal {rs(o.subtotal)} · Delivery {o.delivery ? rs(o.delivery) : 'FREE'} · <b>Total {rs(o.total)}</b></p>

                <h4>Payment proof · {pm}</h4>
                {proofIsLink
                  ? <a className="btn btn-white" href={o.proofUrl} target="_blank" rel="noreferrer noopener"><Icon name="eye" /> Open proof</a>
                  : <p className="muted">{o.proofUrl || 'No proof attached'}</p>}
                {o.status === 'Order Placed' && (
                  <div className="ad-actions">
                    <button type="button" className="btn btn-blue" disabled={busy} onClick={verify}><Icon name="check" /> Verify payment</button>
                    <button type="button" className="btn btn-white ad-danger" disabled={busy} onClick={reject}><Icon name="x" /> Reject &amp; cancel</button>
                  </div>
                )}

                <h4>Customer &amp; delivery</h4>
                <div className="ad-mini">
                  <label className="field"><span>Name</span><input value={c.name} onChange={setCk('name')} /></label>
                  <label className="field"><span>Phone</span><input value={c.phone} onChange={setCk('phone')} /></label>
                  <label className="field"><span>Email</span><input value={c.email} onChange={setCk('email')} /></label>
                  <label className="field"><span>City</span><input value={c.city} onChange={setCk('city')} /></label>
                </div>
                <label className="field"><span>Address</span><textarea rows={2} value={c.address} onChange={setCk('address')} /></label>
                <button type="button" className="btn btn-white" disabled={busy} onClick={saveCustomer}>Save customer details</button>
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

                <button type="button" className="btn btn-white ad-danger" disabled={busy} onClick={remove}><Icon name="trash" /> Delete order</button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminOrders({ orders, token, setOrders, initialStatus = 'All' }) {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState(initialStatus);

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter((o) =>
      (status === 'All' || o.status === status) &&
      (!t || o.id.toLowerCase().includes(t) || o.customer.name.toLowerCase().includes(t) || o.customer.phone.includes(t)));
  }, [orders, q, status]);

  return (
    <>
      <div className="ad-filters">
        <input type="search" placeholder="Search order ID, name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          {ALL_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-scroll card">
        <table className="ad-table">
          <thead><tr><th>Order</th><th>Placed</th><th>Customer</th><th>Total</th><th>Paid via</th><th>Status</th><th /></tr></thead>
          <tbody>
            {shown.map((o) => (
              <OrderRow
                key={o.id} o={o} token={token}
                onSaved={(u) => setOrders((cur) => cur.map((x) => (x.id === u.id ? u : x)))}
                onDeleted={(id) => setOrders((cur) => cur.filter((x) => x.id !== id))}
              />
            ))}
            {!shown.length && <tr className="empty-row"><td colSpan={7} className="muted center">No orders match.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
