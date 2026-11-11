import Icon from './Icon';
import { STATUS_STEPS } from '../data/products';
import { rs, rsShort } from '../utils/format';

// Receipt-style order summary (cart + checkout)
export function Receipt({ lines, totals, title = 'Your Cart', children, qtyControls = false, onQty }) {
  const n = lines.reduce((s, l) => s + l.qty, 0);
  return (
    <aside className="receipt-wrap">
      <div className="receipt">
        <header><h3>{title}</h3><span>{n} item{n === 1 ? '' : 's'}</span></header>
        <p className="rc-sub">T-Safe Dental Care · order slip</p>

        {lines.map((l) => (
          <div className="rc-line" key={l.id + l.color + l.custom}>
            <img src={l.thumb} alt="" />
            <div>
              <b>{l.name}</b>
              <small>{l.color ? 'Colour: ' + l.color : l.series}</small>
              {l.custom && <small>Name on brush: <b>{l.custom}</b></small>}
              {qtyControls
                ? <Qty line={l} onQty={onQty} />
                : <small>Qty: {l.qty}</small>}
            </div>
            <div className="rc-p"><s>{rsShort(l.mrp * l.qty)}</s><b>{rsShort(l.price * l.qty)}</b></div>
          </div>
        ))}

        <div className="free">
          {totals.toFree > 0 ? (
            <p><Icon name="truck" /> You’re <b>{rs(totals.toFree)}</b> away from free delivery</p>
          ) : (
            <p><Icon name="truck" /> You’ve unlocked <b>free delivery</b> 🎉</p>
          )}
          <div className="meter"><i style={{ '--w': Math.min(100, (totals.subtotal / 999) * 100) + '%' }} /></div>
          <small>Standard delivery charges: 200/-<br />Free delivery for all orders billing from 999/-<br />Delivery time: 5 to 8 days</small>
        </div>

        <dl>
          <div><dt>Subtotal</dt><dd>{rs(totals.subtotal)}</dd></div>
          <div><dt>{totals.delivery ? 'Standard Delivery' : 'Delivery'}</dt><dd>{totals.delivery ? rs(totals.delivery) : 'FREE'}</dd></div>
          {totals.saved > 0 && <div className="saved"><dt>You save</dt><dd>{rs(totals.saved)}</dd></div>}
          <div className="total"><dt>Total</dt><dd>{rs(totals.total)}</dd></div>
        </dl>

        <div className="barcode" aria-hidden="true" />
        {children}
      </div>
    </aside>
  );
}

export function Qty({ line, onQty }) {
  return (
    <div className="qty">
      <button type="button" aria-label="Decrease quantity" onClick={() => onQty(line.id, line.color, line.qty - 1, line.custom)}>−</button>
      <span aria-live="polite">{line.qty}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onQty(line.id, line.color, line.qty + 1, line.custom)}>+</button>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls = status === 'Cancelled' ? 'bad' : status === 'Delivered' ? 'good' : status === 'Order Placed' ? 'warn' : 'info';
  return <span className={'badge ' + cls}>{status}</span>;
}

// Horizontal/vertical progress levels (style of the tracking section)
export function StatusLevels({ status }) {
  if (status === 'Cancelled') {
    return <div className="cancelled"><Icon name="x" /> This order was cancelled.</div>;
  }
  const idx = Math.max(0, STATUS_STEPS.findIndex((s) => s.key === status));
  const delivered = status === 'Delivered';
  return (
    <ol className="levels">
      {STATUS_STEPS.map((s, i) => {
        const cls = i < idx || (delivered && i === idx) ? 'done' : i === idx ? 'current' : '';
        return (
          <li key={s.key} className={cls}>
            <span className="lv">{i + 1}</span>
            <i><Icon name={cls === 'done' ? 'check' : s.icon} /></i>
            <b>{s.key}</b>
            <small>{s.sub}</small>
          </li>
        );
      })}
    </ol>
  );
}

export function ItemsList({ items }) {
  return (
    <ul className="items-list">
      {items.map((it, i) => (
        <li key={i}>
          <span>{it.qty} × {it.name}{it.color ? ` (${it.color})` : ''}{it.custom ? ` — name: “${it.custom}”` : ''}</span>
          <b>{rs(it.price * it.qty)}</b>
        </li>
      ))}
    </ul>
  );
}
