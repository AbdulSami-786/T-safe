import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon, { Stars } from './Icon';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { REVIEW_PLACEHOLDERS } from '../data/products';

export default function Reviews({ page = false }) {
  const H = page ? 'h1' : 'h2';
  const { user, token } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ rating: 5, title: '', text: '' });
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const load = () => api.reviews().then(setList).catch(() => {});
  useEffect(() => { load(); }, []);

  // With no real reviews yet we show the numbers from the design (5 × "Very Good", 3 × "Good").
  const real = list.length > 0;
  const five = real ? list.filter((r) => r.rating === 5).length : 5;
  const four = real ? list.filter((r) => r.rating === 4).length : 3;
  const total = real ? list.length : 8;
  const shown = real ? list.slice(0, 3) : REVIEW_PLACEHOLDERS;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.addReview({ token, ...form });
      toast.success(r.pending ? 'Thanks! Your review will appear once approved.' : 'Thanks for your review!');
      setForm({ rating: 5, title: '', text: '' });
      setOpen(false);
      load();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="reviews wrap" id="reviews">
      <header className="sec-head reveal">
        <span className="stk">Reviews</span>
        <H>Loved by our <mark>customers</mark></H>
      </header>

      <div className="rev-grid">
        <div className="rev-summary reveal">
          {[{ n: five, stars: 5, label: 'Very Good' }, { n: four, stars: 4, label: 'Good' }].map((r) => (
            <div className="rev-row" key={r.label}>
              <b className="rev-n">{r.n}</b>
              <div><Stars n={r.stars} /><strong>{r.label}</strong></div>
              <div className="bar"><i style={{ '--w': (total ? (r.n / total) * 100 : 0) + '%' }} /></div>
            </div>
          ))}
          <p className="rev-total">{total} reviews in total</p>
        </div>

        <div className="rev-cards">
          {shown.slice(0, 3).map((r) => (
            <article className="rev-card reveal" key={r.id}>
              <Stars n={r.rating} />
              <h4>{r.title || (r.rating === 5 ? 'Very Good' : 'Good')}</h4>
              {r.text
                ? <p className="rtext">{r.text}</p>
                : <p className="ph"><i /><i /><i style={{ width: '60%' }} /></p>}
              <footer>
                <span className="av">{(r.name || 'T').charAt(0).toUpperCase()}</span>
                <div><b>{real ? r.name : 'Verified Customer'}</b><small>{real ? 'Verified customer' : 'Placeholder'}</small></div>
              </footer>
            </article>
          ))}
        </div>
      </div>

      <div className="rv-write">
        {!open && (user
          ? <button type="button" className="btn btn-white" onClick={() => setOpen(true)}>Write a review <Icon name="star" /></button>
          : <Link className="btn btn-white" to="/login" state={{ from: '/reviews' }}>Log in to write a review</Link>)}

        {open && (
          <form className="card form-card" onSubmit={submit}>
            <h3>Your review</h3>
            <div className="star-pick" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" role="radio" aria-checked={form.rating === n} aria-label={n + ' stars'} className={n <= form.rating ? 'on' : ''} onClick={() => setForm({ ...form, rating: n })}>
                  <Icon name="star" />
                </button>
              ))}
            </div>
            <label className="field"><span>Title (optional)</span><input maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Super soft bristles" /></label>
            <label className="field"><span>Your experience</span><textarea rows={4} maxLength={600} required value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="Tell us what you liked…" /></label>
            <div className="row-btns">
              <button className="btn btn-ink" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Submit review'}</button>
              <button className="btn btn-white" type="button" onClick={() => setOpen(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
