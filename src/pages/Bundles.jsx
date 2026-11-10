import Icon from '../components/Icon';
import { BundleBuy } from '../components/ProductCards';
import { useCatalog } from '../context/CatalogContext';
import { useSeo } from '../hooks/usePageTitle';

export default function Bundles() {
  const { products: P } = useCatalog();
  useSeo('/bundles');

  return (
    <section className="bundle page-bundle">
      <div className="wrap bundle-grid">
        <div className="stickers" aria-hidden="true">
          <div className="die d1"><img src="/assets/nano-tray.jpeg" alt="" /></div>
          <div className="die d2"><img src="/assets/tongue-cleaner.jpeg" alt="" /></div>
          <span className="plus"><Icon name="plus" /></span>
        </div>
        <div className="bundle-copy">
          <span className="stk dark">Bundle Packages</span>
          <h1>Brush. Clean. <mark className="pink">Save more.</mark></h1>
          <p>One Nano Toothbrush With Travel Case And One Tongue Cleaner — the complete everyday routine in one smart bundle.</p>
          <BundleBuy p={P.bundle} />
          <p className="mini-note"><Icon name="truck" /> Add items to reach 999/- and delivery is free</p>
        </div>
      </div>
    </section>
  );
}
