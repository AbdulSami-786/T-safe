import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGES, SITE_NAME } from '../data/seo';

const SITE = (import.meta.env.VITE_SITE_URL || '').replace(/\/$/, '');
const OG_IMAGE = '/assets/luxe-banner-new-era.jpeg';

function upsert(selector, tag, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement(tag); document.head.appendChild(el); }
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
}

function applySeo({ title, description, path, noindex }) {
  document.title = title;
  const url = SITE + (path === '/' ? '/' : path.replace(/\/$/, ''));
  if (description) {
    upsert('meta[name="description"]', 'meta', { name: 'description', content: description });
    upsert('meta[property="og:description"]', 'meta', { property: 'og:description', content: description });
    upsert('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description });
  }
  upsert('meta[property="og:title"]', 'meta', { property: 'og:title', content: title });
  upsert('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: title });
  upsert('meta[property="og:url"]', 'meta', { property: 'og:url', content: url });
  upsert('link[rel="canonical"]', 'link', { rel: 'canonical', href: url });
  upsert('meta[name="robots"]', 'meta', {
    name: 'robots',
    content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  });
  if (SITE) upsert('meta[property="og:image"]', 'meta', { property: 'og:image', content: SITE + OG_IMAGE });
}

/** Private / low-value pages (cart, checkout, login…): tab title + noindex. */
export default function usePageTitle(title, description) {
  const { pathname } = useLocation();
  useEffect(() => {
    applySeo({
      title: title ? `${title} — ${SITE_NAME}` : PAGES['/'].title,
      description: description || PAGES['/'].description,
      path: pathname,
      noindex: !PAGES[pathname],
    });
  }, [title, description, pathname]);
}

/** Public pages: title, description, canonical and social tags come from data/seo.js */
export function useSeo(path) {
  useEffect(() => {
    const p = PAGES[path];
    applySeo({ title: p.title, description: p.description, path, noindex: false });
  }, [path]);
}
