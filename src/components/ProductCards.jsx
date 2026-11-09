import { useState } from 'react';
import Icon from './Icon';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

function Description({ d }) {
  return (
    <details>
      <summary>Product Description</summary>
      <div className="desc">
        <h4>{d.title}</h4>
        {d.paras.map((t) => <p key={t.slice(0, 24)}>{t}</p>)}
        <h5>{d.whyTitle}</h5>
        <ul className="ticks">
          {d.why.map(([b, t]) => <li key={b}><b>{b}</b> {t}</li>)}
        </ul>
        <p className="quote">{d.quote}</p>
        <p>{d.closing}</p>
        <p className="sign">T-Safe — Exceptional Care Starts Here.</p>
      </div>
    </details>
  );
}

function Price({ p }) {
  return (
    <div className="price">
      <div className="was"><small>Was <u>✕</u></small><s>Rs. {p.mrp}/-</s></div>
      <div className="now"><small>Now <u>✓</u></small><b>Rs. {p.price}/-</b></div>
    </div>
  );
}

function AddButton({ p, color, silver = false }) {
  const { add } = useCart();
  const toast = useToast();
  const sold = p.stock !== null && p.stock !== undefined && p.stock <= 0;
  return (
    <button
      type="button"
      className={'btn btn-block ' + (silver ? 'btn-silver' : 'btn-ink')}
      disabled={sold}
      onClick={() => {
        add(p.id, color, 1);
        toast.success(`${p.name}${color ? ' (' + color + ')' : ''} added to cart`, { action: { to: '/cart', label: 'View cart' } });
      }}
    >
      {sold ? 'Sold out' : <>Add To Cart <Icon name="cart" /></>}
    </button>
  );
}

/* ---------------- Nano toothbrush (colour veils) ---------------- */
export function NanoCard({ p }) {
  const [sel, setSel] = useState(2); // 1-based, default Black like the design
  const ids = ['n1', 'n2', 'n3', 'n4'];
  return (
    <article className="pc reveal" id="nano">
      {ids.map((id, i) => (
        <input key={id} className="sr" type="radio" name="nano" id={id} checked={sel === i + 1} onChange={() => setSel(i + 1)} />
      ))}

      <div className="pc-media nano">
        <span className="off">50% OFF</span>
        <div className="lineup" style={{ '--img': 'url(/assets/nano-lineup.jpeg)' }} />
        <div className="veils"><i /><i /><i /><i /></div>
        <figure className="mini"><img src="/assets/nano-case-black.jpeg" alt="Nano toothbrush with travel case" /><figcaption>Includes travel case</figcaption></figure>
      </div>

      <div className="pc-body">
        <p className="pc-k">{p.series}</p>
        <h3>{p.name}</h3>
        <Price p={p} />

        <div className="opts" role="group" aria-label="Colours">
          <span className="opts-l">Colours</span>
          {p.colors.map((c, i) => (
            <label key={c.name} className="opt" htmlFor={ids[i]} style={{ '--c': c.hex }}><i />{c.name}</label>
          ))}
        </div>

        <AddButton p={p} color={p.colors[sel - 1].name} />
        <Description d={p.desc} />
      </div>
    </article>
  );
}

/* ---------------- Tongue cleaner (3D flip) ---------------- */
export function TongueCard({ p }) {
  const [sel, setSel] = useState(1);
  return (
    <article className="pc reveal" id="tongue">
      <input className="sr" type="radio" name="tongue" id="t1" checked={sel === 1} onChange={() => setSel(1)} />
      <input className="sr" type="radio" name="tongue" id="t2" checked={sel === 2} onChange={() => setSel(2)} />

      <div className="pc-media tongue">
        <span className="off">50% OFF</span>
        <div className="flipper">
          <div className="face" style={{ '--img': 'url(/assets/tongue-cleaner.jpeg)' }} />
          <div className="face back" style={{ '--img': 'url(/assets/tongue-pack.jpeg)' }} />
        </div>
      </div>

      <div className="pc-body">
        <p className="pc-k">{p.series}</p>
        <h3>{p.name}</h3>
        <Price p={p} />

        <div className="opts" role="group" aria-label="View">
          <span className="opts-l">Flip to see</span>
          <label className="opt" htmlFor="t1" style={{ '--c': '#1e3fae' }}><i />Product</label>
          <label className="opt" htmlFor="t2" style={{ '--c': '#7fb6ee' }}><i />Packaging</label>
        </div>

        <AddButton p={p} color="" />
        <Description d={p.desc} />
      </div>
    </article>
  );
}

/* ---------------- LUXE · Soft Aura 15K ---------------- */
export function AuraCard({ p }) {
  const [sel, setSel] = useState(1);
  return (
    <article className="pc lux row reveal" id="aura">
      <input className="sr" type="radio" name="aura" id="a1" checked={sel === 1} onChange={() => setSel(1)} />
      <input className="sr" type="radio" name="aura" id="a2" checked={sel === 2} onChange={() => setSel(2)} />

      <div className="pc-media plate">
        <span className="off silver">50% OFF</span>
        <div className="shot" style={{ '--img': 'url(/assets/luxe-brush-white.jpeg)' }} />
        <div className="shot" style={{ '--img': 'url(/assets/luxe-brush-black.jpeg)' }} />
      </div>

      <div className="pc-body">
        <span className="feat-flag"><Icon name="star" /> Featured product</span>
        <p className="pc-k">{p.series}</p>
        <h3>{p.name}</h3>
        <Price p={p} />

        <div className="opts" role="group" aria-label="Colours">
          <span className="opts-l">Colours</span>
          {p.colors.map((c, i) => (
            <label key={c.name} className="opt" htmlFor={'a' + (i + 1)} style={{ '--c': c.hex }}><i />{c.name}</label>
          ))}
        </div>

        <AddButton p={p} color={p.colors[sel - 1].name} silver />
        <Description d={p.desc} />
      </div>
    </article>
  );
}

/* ---------------- Bundle ---------------- */
export function BundleBuy({ p }) {
  const [color, setColor] = useState(p.colors[1].name);
  return (
    <>
      <div className="burst-price">
        <div className="bp-was"><small>Was <u>✕</u></small><s>Rs. {p.mrp}/-</s></div>
        <div className="bp-burst"><small>Now <u>✓</u></small><b>{p.price}<em>/-</em></b></div>
        <span className="save">Save Rs. {(p.mrp - p.price).toLocaleString('en-PK')}</span>
      </div>

      <div className="opts bundle-opts" role="group" aria-label="Nano toothbrush colour">
        <span className="opts-l">Nano toothbrush colour</span>
        {p.colors.map((c) => (
          <button key={c.name} type="button" className={'opt' + (color === c.name ? ' on' : '')} style={{ '--c': c.hex }} onClick={() => setColor(c.name)} aria-pressed={color === c.name}>
            <i />{c.name}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 360, marginTop: 8 }}>
        <AddButton p={{ ...p, name: 'Bundle' }} color={color} />
      </div>
    </>
  );
}
