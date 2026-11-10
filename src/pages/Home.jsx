import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Icon from '../components/Icon';
import { ValueSaverBand } from '../components/HomeSections';
import { useSeo } from '../hooks/usePageTitle';

const TRUST = [
  { i: 'truck', t: 'Free Delivery', s: 'On all orders billing from 999/-' },
  { i: 'percent', t: '50% Off', s: 'For the first 100 orders' },
  { i: 'pin', t: 'Across Pakistan', s: 'Premium dental care, delivered' },
  { i: 'shield', t: 'Gentle Care', s: 'Soft bristles, comfortable brushing' },
];

const SERIES = [
  { to: '/shop', k: 'Value-Saver Series', t: 'Everyday essentials', s: 'Nano toothbrush with travel case and the essential tongue cleaner — at half the price.', img: '/assets/nano-lineup.jpeg', cta: 'Shop Value-Saver', cls: 'sc-blue' },
  { to: '/bundles', k: 'Bundle Packages', t: 'Brush. Clean. Save more.', s: 'One Nano toothbrush + one tongue cleaner. The complete routine in one smart bundle.', img: '/assets/nano-tray.jpeg', cta: 'See the bundle', cls: 'sc-sky' },
  { to: '/luxe', k: 'LUXE · Premium Series', t: 'A new era of dental care', s: 'Soft Aura 15K — 15,000+ ultra-soft bristles in a premium finish.', img: '/assets/luxe-banner-new-era.jpeg', cta: 'Discover LUXE', cls: 'sc-dark' },
];

function Tape({ items }) {
  return <>{items.map((t) => <span key={t}>{t}</span>)}{items.map((t) => <span key={t + '2'}>{t}</span>)}</>;
}

export default function Home() {
  useSeo('/');

  return (
    <div className="home-white">
      <Hero />

      <section className="trust wrap" aria-label="Why shop with T-Safe">
        {TRUST.map((t, i) => (
          <div className="trust-item reveal" key={t.t} style={{ '--r': (i % 2 ? 1.2 : -1.2) + 'deg' }}>
            <span className="trust-ico"><Icon name={t.i} /></span>
            <div><b>{t.t}</b><small>{t.s}</small></div>
          </div>
        ))}
      </section>

      <div className="tapes" aria-hidden="true">
        <div className="tape t-a"><div>{[0, 1].map((k) => <Tape key={k} items={['Exceptional Care Starts Here.', 'Shop More, Save More.', 'Premium Dental Care, Delivered Across Pakistan.']} />)}</div></div>
        <div className="tape t-b"><div>{[0, 1].map((k) => <Tape key={k} items={['50% Off For The First 100 Orders', 'Free Delivery From 999/-', 'Discover LUXE']} />)}</div></div>
      </div>

      <section className="series wrap" aria-labelledby="series-h">
        <header className="sec-head reveal">
          <span className="stk">Shop by series</span>
          <h2 id="series-h">Find your <mark>perfect</mark> routine</h2>
          <p>Three ways to upgrade your daily oral care.</p>
        </header>
        <div className="series-grid">
          {SERIES.map((s) => (
            <Link to={s.to} className={'series-card reveal ' + s.cls} key={s.to}>
              <div className="sc-img"><img src={s.img} alt="" loading="lazy" /></div>
              <div className="sc-body">
                <p className="pc-k">{s.k}</p>
                <h3>{s.t}</h3>
                <p>{s.s}</p>
                <span className="sc-cta">{s.cta} <Icon name="arrow" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ValueSaverBand />
    </div>
  );
}
