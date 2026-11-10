// Single source of truth for page titles / descriptions.
// Used by the React pages (browser tab + meta tags) AND by vite.config.js, which
// pre-renders a real HTML file per page (so Google/WhatsApp/Facebook see the right
// title, description and structured data without running JavaScript).

export const SITE_NAME = 'T-Safe Dental Care';

export const PAGES = {
  '/': {
    name: 'Home',
    title: 'T-Safe Dental Care — Premium Toothbrushes & Oral Care in Pakistan',
    description: 'Shop T-Safe toothbrushes and tongue cleaners online. Value-Saver Series at half price and the LUXE Soft Aura 15K premium brush. Free delivery over Rs. 999 across Pakistan.',
  },
  '/shop': {
    name: 'Value Saver Series',
    title: 'Value Saver Series — Nano Toothbrush & Tongue Cleaner | T-Safe',
    description: 'Buy the T-Safe Nano toothbrush with travel case (Rs. 450) and the Essential tongue cleaner (Rs. 500). 50% off for the first 100 orders. Free delivery over Rs. 999.',
  },
  '/luxe': {
    name: 'LUXE Premium Series',
    title: 'LUXE Soft Aura 15K Toothbrush — 15,000+ Ultra-Soft Bristles | T-Safe',
    description: 'Meet the T-Safe LUXE Soft Aura 15K toothbrush: 15,000+ ultra-soft bristles, gentle on gums, in Jazz White or Attitude Black. Order online across Pakistan.',
  },
  '/bundles': {
    name: 'Bundle Packages',
    title: 'Toothbrush + Tongue Cleaner Bundle — Save More | T-Safe',
    description: 'One Nano toothbrush with travel case plus one tongue cleaner in a single T-Safe bundle. The complete everyday oral-care routine at a lower price.',
  },
  '/reviews': {
    name: 'Reviews',
    title: 'Customer Reviews | T-Safe Dental Care',
    description: 'Read what T-Safe customers say about our toothbrushes and tongue cleaners, and share your own review.',
  },
  '/track': {
    name: 'Track Order',
    title: 'Track Your Order | T-Safe Dental Care',
    description: 'Enter your T-Safe order number and phone number to see the latest status of your delivery.',
  },
};

// Pages that must NOT appear in Google (private / no search value)
export const NOINDEX_PATHS = ['/cart', '/checkout', '/login', '/account', '/admin', '/order-placed/'];
