import { AuraCard } from '../components/ProductCards';
import { useCatalog } from '../context/CatalogContext';
import usePageTitle from '../hooks/usePageTitle';

export default function Luxe() {
  const { products: P } = useCatalog();
  usePageTitle('LUXE Premium Series', 'LUXE-Premium Series by T-Safe — Soft Aura 15K toothbrush with 15,000+ ultra-soft bristles. A new era of dental care.');

  return (
    <section className="luxe page-luxe" id="luxe">
      <div className="wrap">
        <div className="luxe-shell">
          <div className="spot" aria-hidden="true" />
          <header className="luxe-head">
            <div className="lx-mark"><span /><b>LUXE</b><span /></div>
            <small>PREMIUM SERIES</small>
            <h1>A New Era Of Dental Care,<br />A New Concept Of <em>Luxury.</em></h1>
          </header>

          <div className="luxe-grid">
            <div className="ring-stage" aria-hidden="true">
              <div className="ring-tilt">
                <div className="ring">
                  <div className="rp rp-ghost" style={{ '--i': 0 }} />
                  <div className="rp rp-brush-b" style={{ '--i': 1 }} />
                  <div className="rp rp-pack-w" style={{ '--i': 2 }} />
                  <div className="rp rp-brush-w" style={{ '--i': 3 }} />
                  <div className="rp rp-pack-b" style={{ '--i': 4 }} />
                </div>
              </div>
              <div className="ring-floor" />
            </div>
            <AuraCard p={P.aura} />
          </div>

          <div className="luxe-gallery">
            <figure className="g-item reveal"><img src="/assets/luxe-banner-new-era.jpeg" alt="LUXE Premium Series — A new era of dental care" loading="lazy" /></figure>
            <figure className="g-item g-wide reveal"><img src="/assets/luxe-pack-black.jpeg" alt="LUXE-Premium toothbrush — black packaging" loading="lazy" /></figure>
            <figure className="g-item g-wide reveal"><img src="/assets/luxe-pack-white.jpeg" alt="LUXE-Premium toothbrush — white packaging" loading="lazy" /></figure>
          </div>
        </div>
      </div>
    </section>
  );
}
