import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { Receipt } from '../components/OrderParts';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, fileToBase64 } from '../api';
import { PAYMENT_METHODS } from '../data/products';
import { isEmail, isPhone, normPhone, rs } from '../utils/format';
import { prepareProof } from '../utils/file';
import usePageTitle from '../hooks/usePageTitle';

function FormField({ label, value, onChange, err, type = 'text', ph, area, auto }) {
  return (
    <label className={'field' + (err ? ' has-err' : '')}>
      <span>{label}</span>
      {area
        ? <textarea rows={3} value={value} onChange={onChange} placeholder={ph} autoComplete={auto} />
        : <input type={type} value={value} onChange={onChange} placeholder={ph} autoComplete={auto} />}
      {err && <em className="err">{err}</em>}
    </label>
  );
}

export function PaymentCards({ pay, setPay }) {
  return (
    <div className="method-list">
      {PAYMENT_METHODS.map((m) => {
        const body = (
          <>
            {setPay && <input className="sr" type="radio" name="pay" value={m.id} checked={pay === m.id} onChange={() => setPay(m.id)} />}
            <span className="w-ico"><Icon name={m.icon} /></span>
            <div><h3>{m.name}</h3><small>{m.holder}</small></div>
            {m.number && <code>{m.number}</code>}
            {m.iban && (
              <dl>
                <div><dt>IBAN</dt><dd>{m.iban}</dd></div>
                <div><dt>Account No.</dt><dd>{m.account}</dd></div>
              </dl>
            )}
          </>
        );
        return setPay
          ? <label key={m.id} className={'wallet pick ' + m.cls + (pay === m.id ? ' picked' : '')}>{body}</label>
          : <article key={m.id} className={'wallet ' + m.cls}>{body}</article>;
      })}
    </div>
  );
}

export default function Checkout() {
  usePageTitle('Checkout', 'Billing and payment for your T-Safe order.');
  const { lines, totals, clear, setQty } = useCart();
  const { user, token } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const fileRef = useRef(null);

  const [f, setF] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '', address: '', city: '' });
  const [pay, setPay] = useState('easypaisa');
  const [proof, setProof] = useState(null);
  const [drag, setDrag] = useState(false);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  // The session is restored asynchronously after a page refresh — fill blanks once the user is known.
  useEffect(() => {
    if (!user) return;
    setF((cur) => ({ ...cur, name: cur.name || user.name, phone: cur.phone || user.phone, email: cur.email || user.email }));
  }, [user]);

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errs[k]) setErrs((x) => ({ ...x, [k]: '' }));
  };

  if (!lines.length) {
    return (
      <section className="page wrap">
        <header className="sec-head">
          <span className="stk">Billing &amp; Payments</span>
          <h1 className="h-xl">Pay your <mark>way</mark></h1>
          <p>Send your payment to any account below, then upload the proof of payment.</p>
        </header>
        <PaymentCards />
        <div className="empty card" style={{ marginTop: 28 }}>
          <Icon name="cart" />
          <h2>Nothing to check out yet</h2>
          <p>Your cart is empty. Add something to place an order.</p>
          <Link className="btn btn-blue" to="/shop">Browse products</Link>
        </div>
      </section>
    );
  }

  const takeFile = async (file) => {
    if (!file) return;
    try {
      setProof(await prepareProof(file));
      setErrs((e) => ({ ...e, proof: '' }));
    } catch (err) {
      setProof(null);
      setErrs((e) => ({ ...e, proof: err.message }));
    }
  };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = 'Enter your full name.';
    if (!isPhone(f.phone)) e.phone = 'Use a mobile number like 03XX XXXXXXX.';
    if (f.email && !isEmail(f.email)) e.email = 'That email does not look right.';
    if (f.address.trim().length < 8) e.address = 'Enter your complete delivery address.';
    if (f.city.trim().length < 2) e.city = 'Enter your city.';
    if (!proof) e.proof = 'Upload your proof of payment (screenshot or PDF, up to 1 MB).';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      document.querySelector('.has-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setBusy(true);
    try {
      const data = await fileToBase64(proof);
      const r = await api.createOrder({
        token,
        customer: { ...f, phone: normPhone(f.phone) },
        items: lines.map((l) => ({ id: l.id, color: l.color, qty: l.qty })),
        paymentMethod: pay,
        proof: { name: proof.name, type: proof.type, data },
      });
      clear();
      nav(`/order-placed/${r.orderId}`, { replace: true, state: { phone: normPhone(f.phone), total: r.total } });
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  const submitBtn = (
    <button type="submit" className="btn btn-blue btn-block" disabled={busy}>
      {busy ? 'Placing order…' : <>Place Order <Icon name="check" /></>}
    </button>
  );

  return (
    <section className="page wrap">
      <header className="sec-head">
        <span className="stk">Billing &amp; Payments</span>
        <h1 className="h-xl">Pay your <mark>way</mark></h1>
        <p>Send your payment to any account below, then upload the proof of payment.</p>
      </header>

      {!user && (
        <div className="login-hint card">
          <Icon name="user" />
          <span>Have an account? <Link to="/login" state={{ from: '/checkout' }}>Log in</Link> to save this order to your profile — or just continue as a guest.</span>
        </div>
      )}

      <form className="co-grid" onSubmit={submit} noValidate>
        <div className="pay-col">
          <fieldset className="card form-card">
            <legend>1 · Delivery details</legend>
            <div className="grid2">
              <FormField label="Full name" value={f.name} onChange={set('name')} err={errs.name} ph="Your name" auto="name" />
              <FormField label="Mobile number" value={f.phone} onChange={set('phone')} err={errs.phone} type="tel" ph="03XX XXXXXXX" auto="tel" />
            </div>
            <FormField label="Email (optional — for order updates)" value={f.email} onChange={set('email')} err={errs.email} type="email" ph="you@example.com" auto="email" />
            <FormField label="Delivery address" value={f.address} onChange={set('address')} err={errs.address} area ph="House / street / area" auto="street-address" />
            <FormField label="City" value={f.city} onChange={set('city')} err={errs.city} ph="e.g. Karachi" auto="address-level2" />
          </fieldset>

          <fieldset className="card form-card">
            <legend>2 · Choose where you’ll pay</legend>
            <PaymentCards pay={pay} setPay={setPay} />
            <p className="hint">Send exactly <b>Rs. {totals.total.toLocaleString('en-PK')}/-</b> to the selected account.</p>
          </fieldset>

          <fieldset className={'card form-card' + (errs.proof ? ' has-err' : '')}>
            <legend>3 · Upload proof of payment</legend>
            <label
              className={'drop' + (drag ? ' over' : '')}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); takeFile(e.dataTransfer.files?.[0]); }}
            >
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr" onChange={(e) => takeFile(e.target.files?.[0])} />
              <span className="d-ico"><Icon name={proof ? 'check' : 'upload'} /></span>
              {proof
                ? <><b>{proof.name}</b><small>{Math.max(1, Math.round(proof.size / 1024))} KB · click to replace</small></>
                : <><b>File for 1 MB (Proof Of Payment)</b><small>Drag &amp; drop or <u>browse</u> · JPG, PNG or PDF</small></>}
            </label>
            {errs.proof && <em className="err">{errs.proof}</em>}
          </fieldset>
        </div>

        <Receipt lines={lines} totals={totals} title="Order Summary" qtyControls onQty={setQty}>
          {submitBtn}
          <p className="secure"><Icon name="shield" /> Confirmed after payment proof is received</p>
        </Receipt>
      </form>
    </section>
  );
}
