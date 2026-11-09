import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { Receipt, Qty } from '../components/OrderParts';
import { useCart } from '../context/CartContext';
import { rsShort } from '../utils/format';
import usePageTitle from '../hooks/usePageTitle';

export default function Cart() {
  usePageTitle('Your Cart', 'Review the items in your T-Safe cart.');
  const { lines, totals, setQty, remove } = useCart();
  const nav = useNavigate();

  if (!lines.length) {
    return (
      <section className="page wrap">
        <header className="sec-head">
          <span className="stk">Cart</span>
          <h1 className="h-xl">Your <mark>cart</mark></h1>
        </header>
        <div className="empty card">
          <Icon name="cart" />
          <h3>Your cart is empty</h3>
          <p>Add a toothbrush or tongue cleaner and it will show up here.</p>
          <Link className="btn btn-blue" to="/shop">Start shopping <Icon name="arrow" /></Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page wrap">
      <header className="sec-head">
        <span className="stk">Cart</span>
        <h1 className="h-xl">Your <mark>cart</mark></h1>
        <p>Standard delivery charges: 200/-. Free delivery for all orders billing from 999/-.</p>
      </header>

      <div className="co-grid">
        <div className="cart-list">
          {lines.map((l) => (
            <article className="cart-item card" key={l.id + l.color}>
              <img src={l.thumb} alt="" />
              <div className="ci-info">
                <p className="pc-k">{l.series}</p>
                <h3>{l.name}</h3>
                {l.color && <small>Colour: <b>{l.color}</b></small>}
                <Qty line={l} onQty={setQty} />
                {l.stock !== null && l.stock !== undefined && l.qty > l.stock && <p className="warn-text">Only {l.stock} left in stock.</p>}
              </div>
              <div className="ci-price">
                <s>{rsShort(l.mrp * l.qty)}</s>
                <b>{rsShort(l.price * l.qty)}</b>
                <button type="button" className="link-btn" onClick={() => remove(l.id, l.color)}><Icon name="trash" /> Remove</button>
              </div>
            </article>
          ))}

          {totals.toFree > 0 && (
            <div className="upsell card">
              <Icon name="sparkle" />
              <span>Add <b>Rs. {totals.toFree}</b> more and unlock free delivery — <Link to="/luxe">view LUXE</Link></span>
            </div>
          )}
        </div>

        <Receipt lines={lines} totals={totals}>
          <button type="button" className="btn btn-blue btn-block" onClick={() => nav('/checkout')}>Proceed To Billing <Icon name="wallet" /></button>
          <p className="secure"><Icon name="shield" /> Orders confirmed after payment proof is received</p>
        </Receipt>
      </div>
    </section>
  );
}
