// DEMO backend: same actions as backend/Code.gs but data lives in this browser's
// localStorage. Used automatically when API_URL (src/config.js) is empty.
import { PRODUCTS, DELIVERY_FEE, FREE_DELIVERY_FROM } from '../data/products';
import { normPhone, isEmail, isPhone } from '../utils/format';

const K = { users: 'ts_users', sess: 'ts_sessions', orders: 'ts_orders', reviews: 'ts_reviews', subs: 'ts_subs', seq: 'ts_seq' };
const load = (k, d) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const fail = (m) => { throw new Error(m); };
const now = () => new Date().toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2) + Date.now());

async function hash(s) {
  if (!crypto?.subtle) return btoa(unescape(encodeURIComponent(s)));
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function seed() {
  const users = load(K.users, null);
  if (users) return;
  const salt = uid();
  save(K.users, [{ id: 'U-1', name: 'Demo Admin', email: 'admin@tsafe.pk', phone: '03000000000', salt, hash: await hash(salt + 'admin123'), role: 'admin', createdAt: now() }]);
}

const pub = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role });

function userFromToken(token) {
  const s = load(K.sess, {})[token];
  if (!s || new Date(s.expires) < new Date()) return null;
  return load(K.users, []).find((u) => u.id === s.userId) || null;
}
const needUser = (t) => userFromToken(t) || fail('Please log in to continue.');
const needAdmin = (t) => { const u = needUser(t); if (u.role !== 'admin') fail('Admins only.'); return u; };

function newSession(userId) {
  const token = uid() + uid();
  const sess = load(K.sess, {});
  sess[token] = { userId, expires: new Date(Date.now() + 30 * 864e5).toISOString() };
  save(K.sess, sess);
  return token;
}

const handlers = {
  async products() {
    return Object.values(PRODUCTS).map((p) => ({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, stock: null, active: true }));
  },

  async register({ name, email, phone, password }) {
    name = String(name || '').trim();
    email = String(email || '').trim().toLowerCase();
    if (name.length < 2) fail('Please enter your full name.');
    if (!isEmail(email)) fail('Please enter a valid email address.');
    if (!isPhone(phone)) fail('Enter a valid Pakistani mobile number (03XXXXXXXXX).');
    if (String(password || '').length < 8) fail('Password must be at least 8 characters.');
    const users = load(K.users, []);
    if (users.some((u) => u.email === email)) fail('An account with this email already exists.');
    const salt = uid();
    const u = { id: 'U-' + (users.length + 1), name, email, phone: normPhone(phone), salt, hash: await hash(salt + password), role: 'customer', createdAt: now() };
    users.push(u);
    save(K.users, users);
    return { token: newSession(u.id), user: pub(u) };
  },

  async login({ identifier, password }) {
    const id = String(identifier || '').trim().toLowerCase();
    const users = load(K.users, []);
    const u = users.find((x) => x.email === id || x.phone === normPhone(id));
    if (!u || (await hash(u.salt + password)) !== u.hash) fail('Wrong email/phone or password.');
    return { token: newSession(u.id), user: pub(u) };
  },

  async me({ token }) { return { user: pub(needUser(token)) }; },

  async logout({ token }) {
    const s = load(K.sess, {});
    delete s[token];
    save(K.sess, s);
    return {};
  },

  async createOrder({ token, customer, items, paymentMethod, proof }) {
    const user = userFromToken(token) || fail('Please log in to place an order.');
    const c = customer || {};
    if (String(c.name || '').trim().length < 2) fail('Please enter your name.');
    if (!isPhone(c.phone)) fail('Enter a valid Pakistani mobile number (03XXXXXXXXX).');
    if (c.email && !isEmail(c.email)) fail('That email address does not look right.');
    if (String(c.address || '').trim().length < 8) fail('Please enter your full delivery address.');
    if (String(c.city || '').trim().length < 2) fail('Please enter your city.');
    if (!['easypaisa', 'jazzcash', 'meezan'].includes(paymentMethod)) fail('Choose a payment method.');
    if (!proof || !proof.name) fail('Please upload your proof of payment.');
    if (!Array.isArray(items) || !items.length) fail('Your cart is empty.');

    const lines = items.map((it) => {
      const p = PRODUCTS[it.id] || fail('A product in your cart is no longer available.');
      const qty = Math.floor(Number(it.qty));
      if (!(qty >= 1 && qty <= 20)) fail('Invalid quantity.');
      if (p.colors.length && !p.colors.some((x) => x.name === it.color)) fail('Please choose a colour for ' + p.name + '.');
      return { id: p.id, name: p.name, color: p.colors.length ? it.color : '', qty, price: p.price, mrp: p.mrp };
    });
    const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const delivery = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const seq = (load(K.seq, 10000) || 10000) + 1;
    save(K.seq, seq);
    const order = {
      id: 'TS-' + seq,
      createdAt: now(),
      updatedAt: now(),
      userId: user?.id || '',
      status: 'Order Placed',
      customer: { name: c.name.trim(), email: (c.email || '').trim(), phone: normPhone(c.phone), address: c.address.trim(), city: c.city.trim() },
      items: lines,
      subtotal,
      delivery,
      total: subtotal + delivery,
      paymentMethod,
      proofUrl: '(demo) ' + proof.name,
      courier: '',
      trackingNo: '',
      history: [{ status: 'Order Placed', at: now(), note: '' }],
    };
    const orders = load(K.orders, []);
    orders.push(order);
    save(K.orders, orders);
    return { orderId: order.id, total: order.total };
  },

  async myOrders({ token }) {
    const u = needUser(token);
    return load(K.orders, []).filter((o) => o.userId === u.id).reverse();
  },

  async trackOrder({ orderId, phone }) {
    const o = load(K.orders, []).find((x) => x.id.toLowerCase() === String(orderId || '').trim().toLowerCase());
    if (!o || o.customer.phone !== normPhone(phone)) fail('No order found with that Order ID and phone number.');
    const { customer, userId, proofUrl, ...rest } = o;
    return { ...rest, customer: { name: customer.name, city: customer.city } };
  },

  async adminOrders({ token }) {
    needAdmin(token);
    return load(K.orders, []).slice().reverse();
  },

  async adminUpdateOrder({ token, orderId, status, courier, trackingNo, note }) {
    needAdmin(token);
    const orders = load(K.orders, []);
    const o = orders.find((x) => x.id === orderId) || fail('Order not found.');
    if (courier !== undefined) o.courier = String(courier).slice(0, 60);
    if (trackingNo !== undefined) o.trackingNo = String(trackingNo).slice(0, 60);
    if (status && status !== o.status) {
      o.status = status;
      o.history.push({ status, at: now(), note: String(note || '').slice(0, 200) });
    }
    o.updatedAt = now();
    save(K.orders, orders);
    return o;
  },

  async reviews() {
    return load(K.reviews, []).filter((r) => r.approved);
  },

  async addReview({ token, rating, title, text }) {
    const u = needUser(token);
    rating = Number(rating);
    if (!(rating >= 1 && rating <= 5)) fail('Choose a star rating.');
    if (String(text || '').trim().length < 5) fail('Please write a few words about your experience.');
    const rv = load(K.reviews, []);
    rv.push({ id: 'R-' + (rv.length + 1), createdAt: now(), name: u.name, rating, title: String(title || '').slice(0, 80), text: String(text).slice(0, 600), approved: true });
    save(K.reviews, rv);
    return { pending: false };
  },

  async subscribe({ email }) {
    if (!isEmail(email)) fail('Please enter a valid email address.');
    const subs = load(K.subs, []);
    if (!subs.includes(email.toLowerCase())) subs.push(email.toLowerCase());
    save(K.subs, subs);
    return {};
  },
};

export async function mockCall(action, payload = {}) {
  await seed();
  await delay();
  const h = handlers[action];
  if (!h) throw new Error('Unknown action: ' + action);
  return h(payload);
}
