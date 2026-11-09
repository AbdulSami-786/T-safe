import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { PRODUCTS } from '../data/products';

const Ctx = createContext(null);
export const useCatalog = () => useContext(Ctx);

// Static content from data/products.js + live price/stock from the "Products" sheet.
export function CatalogProvider({ children }) {
  const [live, setLive] = useState({});

  useEffect(() => {
    let alive = true;
    api.products()
      .then((rows) => {
        if (!alive) return;
        const map = {};
        rows.forEach((r) => { map[r.id] = r; });
        setLive(map);
      })
      .catch(() => { /* keep static prices if the sheet is unreachable */ });
    return () => { alive = false; };
  }, []);

  const products = useMemo(() => {
    const out = {};
    Object.values(PRODUCTS).forEach((p) => {
      const l = live[p.id];
      out[p.id] = l
        ? { ...p, price: Number(l.price) || p.price, mrp: Number(l.mrp) || p.mrp, stock: l.stock === '' || l.stock == null ? null : Number(l.stock), active: l.active !== false }
        : { ...p, stock: null, active: true };
    });
    return out;
  }, [live]);

  return <Ctx.Provider value={{ products }}>{children}</Ctx.Provider>;
}
