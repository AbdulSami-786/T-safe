// Uses the SVG sprite defined in index.html
export default function Icon({ name, className = '' }) {
  return (
    <svg className={'ico ' + className} aria-hidden="true"><use href={'#i-' + name} /></svg>
  );
}

export function Stars({ n = 5 }) {
  return (
    <div className="stars" role="img" aria-label={n + ' out of 5 stars'}>
      {[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" className={i <= n ? '' : 'dim'} />)}
    </div>
  );
}

export function Logo({ light = false, chip = false }) {
  return (
    <span className={'logo' + (light ? ' logo-light' : '') + (chip ? ' nb-chip' : '')}>
      <span className="logo-word">T-Safe<sup>®</sup></span>
      <svg className="logo-wave" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 11C40 1 90 1 130 7s55 5 68-5" fill="none" stroke="url(#wave-g)" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="logo-sub">Dental Care</span>
    </span>
  );
}
