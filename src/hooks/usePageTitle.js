import { useEffect } from 'react';

const BASE = 'T-Safe Dental Care';

// Sets the browser-tab title (and meta description) for the current page.
export default function usePageTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Exceptional Care Starts Here`;
    if (description) {
      const m = document.querySelector('meta[name="description"]');
      if (m) m.setAttribute('content', description);
    }
  }, [title, description]);
}
