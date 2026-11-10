import { useState } from 'react';
import Icon, { Stars } from '../Icon';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import { fmtDate } from '../../utils/format';

function ReviewCard({ r, token, onChanged, onDeleted }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const setApproved = async (approved) => {
    setBusy(true);
    try {
      await api.adminUpdateReview({ token, reviewId: r.id, approved });
      toast.success(approved ? 'Review published' : 'Review hidden');
      onChanged(r.id, approved);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Permanently delete this review?')) return;
    setBusy(true);
    try {
      await api.adminDeleteReview({ token, reviewId: r.id });
      toast.success('Review deleted');
      onDeleted(r.id);
    } catch (e) { toast.error(e.message); setBusy(false); }
  };

  return (
    <article className="ad-item card ad-flat ad-review">
      <div className="ad-item-main">
        <b>{r.name} <span className={'badge ' + (r.approved ? 'good' : 'warn')}>{r.approved ? 'Published' : 'Pending'}</span></b>
        <Stars n={r.rating} />
        {r.title && <b>{r.title}</b>}
        <p>{r.text}</p>
        <small>{fmtDate(r.createdAt)}</small>
      </div>
      <div className="ad-actions">
        {r.approved
          ? <button type="button" className="btn btn-white" disabled={busy} onClick={() => setApproved(false)}>Hide</button>
          : <button type="button" className="btn btn-blue" disabled={busy} onClick={() => setApproved(true)}><Icon name="check" /> Publish</button>}
        <button type="button" className="btn btn-white ad-danger" disabled={busy} onClick={remove}><Icon name="trash" /> Delete</button>
      </div>
    </article>
  );
}

export default function AdminReviews({ reviews, token, setReviews }) {
  const [show, setShow] = useState('pending');
  const shown = reviews.filter((r) => show === 'all' || (show === 'pending' ? !r.approved : r.approved));
  return (
    <>
      <div className="ad-filters">
        <select value={show} onChange={(e) => setShow(e.target.value)}>
          <option value="pending">Waiting for approval</option>
          <option value="published">Published</option>
          <option value="all">All reviews</option>
        </select>
      </div>
      <div className="ad-list">
        {shown.map((r) => (
          <ReviewCard
            key={r.id} r={r} token={token}
            onChanged={(id, approved) => setReviews((cur) => cur.map((x) => (x.id === id ? { ...x, approved } : x)))}
            onDeleted={(id) => setReviews((cur) => cur.filter((x) => x.id !== id))}
          />
        ))}
        {!shown.length && <p className="muted">No reviews here.</p>}
      </div>
    </>
  );
}
