import { Link } from 'react-router-dom';
import Icon from './Icon';

// Hero taken from design concept 5 ("Pure Minimal"): centred headline + three tilted product tiles.
export default function Hero() {
  return (
    <section className="hero5" id="home">
      <div className="wrap hero5-copy">
        <p className="kicker">Featured · Soft Aura 15K Toothbrush</p>
        <h1>Exceptional care<br /><span className="blue">starts here.</span></h1>
        <p className="lede">Meet Soft Aura 15K — 15,000+ ultra-soft bristles, gentle on gums and thoughtfully designed.</p>
        <div className="h5-cta">
          <Link className="h5-btn" to="/luxe">Shop Soft Aura 15K</Link>
          <Link className="tlink" to="/luxe">Discover LUXE <Icon name="arrow" /></Link>
        </div>
        <p className="offer"><Icon name="percent" /> 50% off for the first 100 orders · Free delivery on billing from 999/-</p>
      </div>

      <div className="tiles-wrap">
        <div className="tiles">
          <Link className="tile feat" to="/luxe" aria-label="Soft Aura 15K toothbrush — hover to change colour, click to shop">
            <img className="fa" src="/assets/luxe-brush-white.jpeg" alt="Soft Aura 15K toothbrush in Jazz White" />
            <img className="fb" src="/assets/luxe-brush-black.jpeg" alt="Soft Aura 15K toothbrush in Attitude Black" />
            <span className="feat-lbl"><i className="la">Jazz White</i><i className="lb">Attitude Black</i></span>
          </Link>
        </div>
        <p className="feat-hint"><span className="dots" aria-hidden="true"><i /><i /></span> Hover to change colour</p>
      </div>
    </section>
  );
}
