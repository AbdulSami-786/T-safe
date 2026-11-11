import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useCatalog } from './CatalogContext';
import { calcTotals } from '../utils/format';

const Ctx = createContext(null);
export const useCart = () => useContext(Ctx);

const KEY = 'ts_cart';
const MAX_QTY = 20;
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };

export function CartProvider({ children }) {
  const { products } = useCatalog();
  const [raw, setRaw] = useState(read); // [{ id, color, qty }]

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch { /* ignore */ } }, [raw]);

  // `custom` = optional personalised name written on the brush ("Personalize Your Brush")
  const same = (l, id, color, custom) => l.id === id && l.color === color && (l.custom || '') === (custom || '');

  const add = useCallback((id, color = '', qty = 1, custom = '') => {
    setRaw((cur) => {
      const i = cur.findIndex((l) => same(l, id, color, custom));
      if (i >= 0) return cur.map((l, k) => (k === i ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [...cur, custom ? { id, color, qty, custom } : { id, color, qty }];
    });
  }, []);

  const setQty = useCallback((id, color, qty, custom = '') => {
    setRaw((cur) => cur.flatMap((l) => {
      if (!same(l, id, color, custom)) return [l];
      return qty <= 0 ? [] : [{ ...l, qty: Math.min(MAX_QTY, qty) }];
    }));
  }, []);

  const remove = useCallback((id, color, custom = '') => setRaw((cur) => cur.filter((l) => !same(l, id, color, custom))), []);
  const clear = useCallback(() => setRaw([]), []);

  // Join with live catalog data (price, name, images). Drops products that vanished.
  const lines = useMemo(() => raw
    .filter((l) => products[l.id] && products[l.id].active)
    .map((l) => {
      const p = products[l.id];
      const col = p.colors.find((c) => c.name === l.color);
      return { ...l, custom: l.custom || '', name: p.name, series: p.series, price: p.price, mrp: p.mrp, thumb: col?.thumb || p.thumb, stock: p.stock };
    }), [raw, products]);

  const totals = useMemo(() => calcTotals(lines), [lines]);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return <Ctx.Provider value={{ lines, totals, count, add, setQty, remove, clear, MAX_QTY }}>{children}</Ctx.Provider>;
}
