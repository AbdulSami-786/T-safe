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

  const add = useCallback((id, color = '', qty = 1) => {
    setRaw((cur) => {
      const i = cur.findIndex((l) => l.id === id && l.color === color);
      if (i >= 0) return cur.map((l, k) => (k === i ? { ...l, qty: Math.min(MAX_QTY, l.qty + qty) } : l));
      return [...cur, { id, color, qty }];
    });
  }, []);

  const setQty = useCallback((id, color, qty) => {
    setRaw((cur) => cur.flatMap((l) => {
      if (l.id !== id || l.color !== color) return [l];
      return qty <= 0 ? [] : [{ ...l, qty: Math.min(MAX_QTY, qty) }];
    }));
  }, []);

  const remove = useCallback((id, color) => setRaw((cur) => cur.filter((l) => !(l.id === id && l.color === color))), []);
  const clear = useCallback(() => setRaw([]), []);

  // Join with live catalog data (price, name, images). Drops products that vanished.
  const lines = useMemo(() => raw
    .filter((l) => products[l.id] && products[l.id].active)
    .map((l) => {
      const p = products[l.id];
      const col = p.colors.find((c) => c.name === l.color);
      return { ...l, name: p.name, series: p.series, price: p.price, mrp: p.mrp, thumb: col?.thumb || p.thumb, stock: p.stock };
    }), [raw, products]);

  const totals = useMemo(() => calcTotals(lines), [lines]);
  const count = lines.reduce((s, l) => s + l.qty, 0);

  return <Ctx.Provider value={{ lines, totals, count, add, setQty, remove, clear, MAX_QTY }}>{children}</Ctx.Provider>;
}
