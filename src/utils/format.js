import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../data/products';

export const rs = (n) => 'Rs. ' + Number(n || 0).toLocaleString('en-PK') + '/-';
export const rsShort = (n) => Number(n || 0).toLocaleString('en-PK') + '/-';

export function calcTotals(lines) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const saved = lines.reduce((s, l) => s + (l.mrp - l.price) * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  return { subtotal, delivery, total: subtotal + delivery, saved, toFree: Math.max(0, FREE_DELIVERY_FROM - subtotal) };
}

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Pakistani mobile: 03XXXXXXXXX / +923XXXXXXXXX / 923XXXXXXXXX
export function normPhone(p) {
  const d = String(p || '').replace(/[^\d]/g, '');
  if (d.startsWith('92') && d.length === 12) return '0' + d.slice(2);
  return d;
}
export const isPhone = (p) => /^03\d{9}$/.test(normPhone(p));
export const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
