import { Link } from 'react-router-dom';
import Icon from './Icon';

/* ------------------------------------------------------------------
   Value-Saver Series logo band (replaces the old "15,000 bristles" promo)
   ------------------------------------------------------------------ */
export function ValueSaverLogo({ badge = false }) {
  return (
    <div className="vs-logo vs-img">
      {badge && <span className="vs-off"><b>50%</b><em>OFF</em></span>}
      <img src="/assets/value-saver-logo.png" alt="T-Safe Value Saver Series logo" width="688" height="405" />
    </div>
  );
}

export function ValueSaverBand() {
  return (
    <section className="bristles" id="value-saver">
      <div className="wrap">
        <div className="b-grid">
          <figure className="vs-art reveal"><ValueSaverLogo /></figure>
          <div className="b-copy reveal">
            <span className="stk dark">Introducing</span>
            <h2>The <span className="huge">Value-Saver</span> Series.</h2>
            <p>Everyday oral-care essentials at half the price. Shop More, Save More.</p>
            <Link className="btn btn-lemon" style={{ marginTop: 26 }} to="/shop">Shop Value-Saver <Icon name="bag" /></Link>
          </div>
        </div>

        <ul className="perks">
          <li className="p1 reveal"><Icon name="percent" /><b>50% Off</b><span>For the first 100 orders on every Value-Saver product.</span></li>
          <li className="p2 reveal"><Icon name="truck" /><b>Free Delivery</b><span>On all orders billing from 999/-.</span></li>
          <li className="p3 reveal"><Icon name="sparkle" /><b>Everyday Essentials</b><span>Nano toothbrush with travel case and the essential tongue cleaner.</span></li>
          <li className="p4 reveal"><Icon name="smile" /><b>Healthier Smile</b><span>A small change. A big difference.</span></li>
        </ul>
      </div>
    </section>
  );
}
