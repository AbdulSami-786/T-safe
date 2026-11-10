import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { PAGES, NOINDEX_PATHS, SITE_NAME } from './src/data/seo.js';
import { PRODUCTS } from './src/data/products.js';

/* --------------------------------------------------------------------------
   SEO build step
   - Your domain: set VITE_SITE_URL (e.g. https://tsafe.pk) in Vercel → Environment Variables.
   - Writes a real HTML file per public page (dist/shop.html, dist/luxe.html …) with its own
     <title>, description, canonical, social tags and JSON-LD structured data.
   - Writes dist/sitemap.xml and dist/robots.txt.
   -------------------------------------------------------------------------- */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsonLd = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const PRODUCTS_ON = { '/shop': ['nano', 'tongue'], '/luxe': ['aura'], '/bundles': ['bundle'] };

function seoPlugin(site) {
  let rawHtml = '';
  let outDir = 'dist';
  const url = (p) => site + (p === '/' ? '/' : p);

  function graph(p) {
    const g = [
      { '@type': 'Organization', '@id': site + '/#org', name: SITE_NAME, url: site + '/', logo: site + '/icon-512.png',
        areaServed: { '@type': 'Country', name: 'Pakistan' } },
      { '@type': 'WebSite', '@id': site + '/#site', url: site + '/', name: SITE_NAME, inLanguage: 'en-PK', publisher: { '@id': site + '/#org' } },
    ];
    (PRODUCTS_ON[p] || []).forEach((id) => {
      const pr = PRODUCTS[id];
      g.push({
        '@type': 'Product', name: pr.name, sku: pr.id, image: [site + pr.thumb],
        description: pr.desc?.paras?.[0] || `${pr.name} by T-Safe — ${pr.series}.`,
        brand: { '@type': 'Brand', name: 'T-Safe' },
        offers: {
          '@type': 'Offer', url: url(p), priceCurrency: 'PKR', price: String(pr.price),
          availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition',
        },
      });
    });
    if (p !== '/') {
      g.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: url('/') },
          { '@type': 'ListItem', position: 2, name: PAGES[p].name, item: url(p) },
        ],
      });
    }
    return { '@context': 'https://schema.org', '@graph': g };
  }

  function render(html, p) {
    const page = PAGES[p];
    const set = (re, val) => { html = html.replace(re, () => val); };
    set(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
    set(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(page.description)}">`);
    set(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${url(p)}">`);
    set(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(page.title)}">`);
    set(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(page.description)}">`);
    set(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${url(p)}">`);
    set(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(page.title)}">`);
    set(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(page.description)}">`);
    set('<!--SEO-LD-->', `<script type="application/ld+json">${jsonLd(graph(p))}</script>`);
    const links = Object.entries(PAGES).map(([k, v]) => `<li><a href="${k}">${esc(v.name)}</a></li>`).join('');
    set('<!--SEO-NOSCRIPT-->', `<noscript><h1>${esc(page.title)}</h1><p>${esc(page.description)}</p><ul>${links}</ul><p>Please enable JavaScript to shop.</p></noscript>`);
    return html;
  }

  return {
    name: 't-safe-seo',
    config: () => ({ define: { 'import.meta.env.VITE_SITE_URL': JSON.stringify(site) } }),
    configResolved(c) { outDir = c.build.outDir; },
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        rawHtml = html.replace(/__SITE_URL__/g, site);
        return render(rawHtml, '/');
      },
    },
    closeBundle() {
      if (!rawHtml) return;
      const dir = path.resolve(outDir);
      Object.keys(PAGES).filter((p) => p !== '/').forEach((p) => {
        fs.writeFileSync(path.join(dir, p.slice(1) + '.html'), render(rawHtml, p));
      });
      const today = new Date().toISOString().slice(0, 10);
      const prio = { '/': '1.0', '/shop': '0.9', '/luxe': '0.9', '/bundles': '0.8', '/reviews': '0.6', '/track': '0.4' };
      fs.writeFileSync(path.join(dir, 'sitemap.xml'),
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        Object.keys(PAGES).map((p) => `  <url><loc>${url(p)}</loc><lastmod>${today}</lastmod><priority>${prio[p] || '0.5'}</priority></url>`).join('\n') +
        '\n</urlset>\n');
      fs.writeFileSync(path.join(dir, 'robots.txt'),
        'User-agent: *\nAllow: /\n' + NOINDEX_PATHS.map((p) => `Disallow: ${p}`).join('\n') + `\n\nSitemap: ${site}/sitemap.xml\n`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const site = (env.VITE_SITE_URL || 'https://tsafe.pk').replace(/\/$/, '');
  return {
    plugins: [react(), seoPlugin(site)],
    server: { port: 5173 },
  };
});
