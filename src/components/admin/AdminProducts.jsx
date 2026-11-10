import { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api';
import { rs } from '../../utils/format';

function ProductCard({ p, token, onSaved }) {
  const toast = useToast();
  const [f, setF] = useState({ price: p.price, mrp: p.mrp, stock: p.stock ?? '', active: p.active });
  const [busy, setBusy] = useState(false);
  const dirty = Number(f.price) !== p.price || Number(f.mrp) !== p.mrp || String(f.stock) !== String(p.stock ?? '') || f.active !== p.active;

  const save = async () => {
    setBusy(true);
    try {
      const u = await api.adminUpdateProduct({ token, id: p.id, price: f.price, mrp: f.mrp, stock: f.stock === '' ? null : f.stock, active: f.active });
      toast.success(`${u.name} updated`);
      onSaved(u);
    } catch (e) { toast.error(e.message); } finally { setBusy(false); }
  };

  const low = p.stock !== null && p.stock <= 20;

  return (
    <article className="ad-item card">
      <div className="ad-item-head ad-static">
        <span className="ad-item-main">
          <b>{p.name}</b>
          <small>ID {p.id}{p.colors.length ? ` · ${p.colors.join(', ')}` : ''}</small>
        </span>
        <span className={'badge ' + (!p.active ? 'bad' : low ? 'warn' : 'good')}>
          {!p.active ? 'Hidden' : p.stock === null ? 'Unlimited' : p.stock <= 0 ? 'Sold out' : p.stock + ' in stock'}
        </span>
        <span className="ad-item-meta">{rs(p.price)} <s>{rs(p.mrp)}</s></span>
      </div>
      <div className="ad-item-body">
        <div className="ad-mini">
          <label className="field"><span>Price (Rs.)</span><input type="number" min="0" value={f.price} onChange={(e) => setF({ ...f, price: e.target.value })} /></label>
          <label className="field"><span>MRP (Rs.)</span><input type="number" min="0" value={f.mrp} onChange={(e) => setF({ ...f, mrp: e.target.value })} /></label>
          <label className="field"><span>Stock <small>(blank = unlimited)</small></span><input type="number" min="0" value={f.stock} onChange={(e) => setF({ ...f, stock: e.target.value })} /></label>
          <label className="field"><span>Visible in shop</span>
            <select value={f.active ? 'yes' : 'no'} onChange={(e) => setF({ ...f, active: e.target.value === 'yes' })}>
              <option value="yes">Yes — can be ordered</option><option value="no">No — hidden / unavailable</option>
            </select>
          </label>
        </div>
        <div className="ad-actions">
          <button type="button" className="btn btn-ink" disabled={busy || !dirty} onClick={save}>{busy ? 'Saving…' : 'Save product'}</button>
        </div>
      </div>
    </article>
  );
}

export default function AdminProducts({ products, token, setProducts }) {
  return (
    <div className="ad-list">
      {products.map((p) => (
        <ProductCard key={p.id} p={p} token={token} onSaved={(u) => setProducts((cur) => cur.map((x) => (x.id === u.id ? u : x)))} />
      ))}
      {!products.length && <p className="muted">No products found in the Products sheet.</p>}
    </div>
  );
}
