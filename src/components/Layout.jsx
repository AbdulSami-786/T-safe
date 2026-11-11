import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon, { Logo } from './Icon';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, DEMO_MODE } from '../api';

const MESSAGES = [
  'Free Delivery For All Orders Billing From 999/-',
  '50% Off For The First 100 Orders',
  'Premium Dental Care, Delivered Across Pakistan.',
  'Discover the LUXE-Premium Series',
  'Shop More, Save More.',
  'Exceptional Care Starts Here.',
];

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AnnounceBar() {
  return (
    <div className="top-tape" role="region" aria-label="Announcements">
      <div className="tt-track">
        {[0, 1].map((g) => (
          <div className="tt-group" key={g} aria-hidden={g === 1 ? 'true' : undefined}>
            {MESSAGES.map((m) => <span key={m}>{m}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  const close = () => setOpen(false);

  return (
    <header className="head">
      <div className="wrap head-in">
        <Link to="/" aria-label="T-Safe Dental Care — home"><Logo chip /></Link>

        <input type="checkbox" id="nav-toggle" className="sr" aria-label="Toggle menu" checked={open} onChange={(e) => setOpen(e.target.checked)} />
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/shop" onClick={close}>Value Saver</NavLink>
          <NavLink to="/luxe" className="is-luxe" onClick={close}>LUXE</NavLink>
          <NavLink to="/bundles" onClick={close}>Bundles</NavLink>
          <NavLink to="/reviews" onClick={close}>Reviews</NavLink>
          <NavLink to="/track" onClick={close}>Track Order</NavLink>
          {isAdmin && <NavLink to="/admin" onClick={close}>Admin</NavLink>}
          {/* Phone only: the header shows just logo + menu, so these live in the menu */}
          <NavLink to="/cart" className="nav-m" onClick={close}><span>Cart</span><b>{count}</b></NavLink>
          <NavLink to={user ? '/account' : '/login'} className="nav-m" onClick={close}>{user ? 'My Account' : 'Login / Register'}</NavLink>
        </nav>

        <Link className="acct-btn" to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Log in'}>
          <Icon name="user" /><span>{user ? user.name.split(' ')[0] : 'Login'}</span>
        </Link>
        <Link className="cart-btn" to="/cart" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}>
          <Icon name="cart" /><span>Cart</span><b>{count}</b>
        </Link>
        <label htmlFor="nav-toggle" className="burger" aria-hidden="true"><i /><i /><i /></label>
      </div>
    </header>
  );
}

function Footer() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.subscribe(email);
      toast.success('You’re subscribed — welcome to T-Safe!');
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally { setBusy(false); }
  };

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="f-top">
          <div>
            <h2>Stay in the <mark>loop.</mark></h2>
            <p>Subscribe To Our Emails To Get Latest Offers And Launch Updates.</p>
          </div>
          <form className="sub" onSubmit={subscribe}>
            <Icon name="mail" />
            <input type="email" placeholder="Your email address" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn btn-lemon" type="submit" disabled={busy}>{busy ? '…' : 'Subscribe'}</button>
          </form>
        </div>

        <div className="f-links">
          <Link to="/" aria-label="T-Safe Dental Care"><Logo light /></Link>
          <div><h4>Shop</h4><Link to="/shop">Value-Saver Series</Link><Link to="/luxe">LUXE-Premium Series</Link><Link to="/bundles">Bundle Packages</Link></div>
          <div><h4>Orders</h4><Link to="/cart">Cart</Link><Link to="/checkout">Billing &amp; Payments</Link><Link to="/track">Order Tracking</Link></div>
          <div><h4>Account</h4><Link to="/login">Login / Register</Link><Link to="/account">My Orders</Link><Link to="/reviews">Reviews</Link></div>
        </div>

        <div className="f-bottom">
          <span>© 2026 T-Safe Dental Care. All rights reserved.</span>
          <span>Exceptional Care Starts Here.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <>
      <ScrollManager />
      <AnnounceBar />
      {DEMO_MODE && (
        <div className="demo-bar">
          <b>DEMO MODE</b> — Google Sheet is not connected yet, so orders &amp; accounts are saved in this browser only.
          {import.meta.env.DEV && <> Demo admin: <code>admin@tsafe.pk</code> / <code>admin123</code></>}
        </div>
      )}
      <Header />
      <main id="top"><Outlet /></main>
      <Footer />
    </>
  );
}
