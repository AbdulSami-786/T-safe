import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { NanoCard, TongueCard } from '../components/ProductCards';
import { useCatalog } from '../context/CatalogContext';
import { useSeo } from '../hooks/usePageTitle';

export default function Shop() {
  const { products: P } = useCatalog();
  useSeo('/shop');

  return (
    <section className="shop wrap page-shop">
      <header className="sec-head">
        <span className="stk">Catalogue</span>
        <h1 className="sr-only">Value-Saver Series</h1>
        <img className="vs-head-logo" src="/assets/value-saver-logo-nav.png" alt="Value Saver Series" width="688" height="405" />
        <p>Everyday oral-care essentials at half the price. Shop More, Save More.</p>
      </header>

      <div className="pc-grid">
        <NanoCard p={P.nano} />
        <TongueCard p={P.tongue} />
      </div>

      <aside className="cross card">
        <div>
          <b>Want both and save more?</b>
          <span>Get the Nano toothbrush and tongue cleaner together in one bundle.</span>
        </div>
        <Link className="btn btn-blue" to="/bundles">View bundle <Icon name="arrow" /></Link>
      </aside>
    </section>
  );
}
