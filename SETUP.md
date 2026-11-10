# T-Safe Dental Care — React + Google Sheets shop

**Look & feel:** concept 4 ("Colour Pop") re-coloured to the Value Saver logo palette (navy `#04408a`, sky `#159fe1`) — colours live in `:root` at the top of `src/base.css`.

Pages (each has its own URL): `/` Home · `/shop` Value-Saver Series · `/bundles` · `/luxe` LUXE Premium · `/reviews` ·
`/cart` · `/checkout` (delivery + payment accounts + proof upload) · `/login` · `/account` My Orders · `/track` Order Tracking · `/admin` (orders desk).

## 1. Run it now (Demo mode — no Google needed)

```bash

npm install
npm run dev          # http://localhost:5173
```

With `VITE_API_URL` empty the site runs in **demo mode**: accounts/orders are stored in the browser only.
Demo admin: `admin@tsafe.pk` / `admin123`. (Demo admin does not exist once you connect the real sheet.)

## 2. Connect Google Sheets (real data)

1. Create a new **Google Sheet** (name it e.g. *T-Safe Shop*).
2. **Extensions → Apps Script**. Delete the sample code, paste all of `backend/Code.gs`.
3. At the top of the file set `OWNER_EMAIL` (new-order alerts) if you want them.
4. Pick the function **`setup`** in the toolbar → **Run**. Approve the permissions
   (Sheets, Drive for payment proofs, Mail). This creates the tabs
   `Products · Users · Sessions · Orders · Reviews · Subscribers`, plus a private Drive folder *T-Safe Payment Proofs*.
5. **Deploy → New deployment → type: Web app** → *Execute as:* **Me** · *Who has access:* **Anyone** → Deploy.
   Copy the **Web app URL** (ends in `/exec`).
6. In the project root copy `.env.example` to `.env` and paste the URL:
   ```
   VITE_API_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```
7. Restart `npm run dev` (or rebuild). The yellow "DEMO MODE" bar disappears.

> Whenever you change `Code.gs`: **Deploy → Manage deployments → Edit → New version → Deploy**
> (the URL stays the same).

### Make yourself admin
1. On the website click **Login → Create account** with your own email.
2. Open the **Users** tab in the sheet and change your **Role** cell from `customer` to `admin`.
3. Log in again → an **Admin** link appears in the menu. There you can search orders, open the payment proof
   (Drive link — open it while signed in to the Google account that owns the sheet), change status,
   add courier + tracking number. The customer sees this instantly on the Track page
   (and gets an email if they entered one).

### Running the shop from the sheet
| Tab | What you do |
|---|---|
| **Products** | Change `Price`, `MRP`, `Stock` (blank = unlimited), `Active` (`FALSE` hides/blocks a product). The website reads these live; prices are always re-checked on the server. |
| **Orders** | One row per order. You can also edit `Status` here, but use the Admin page so history and emails are recorded. |
| **Reviews** | New reviews arrive with `Approved = FALSE`. Set to `TRUE` to publish. |
| **Users / Sessions** | Don't edit, except the `Role` cell above. |
| **Subscribers** | Newsletter emails. |

Order statuses: `Order Placed → Payment Verified → Packed → Out For Delivery → Delivered` (or `Cancelled`, which returns stock).

## 3. Put it online

```bash
npm run build        # outputs dist/
```
Upload `dist/` to Netlify / Vercel / Cloudflare Pages (SPA rewrite files `public/_redirects` and `vercel.json` are included;
set `VITE_API_URL` as an environment variable in the host's dashboard). Plain static hosts without rewrite rules
(e.g. GitHub Pages) need a 404.html → index.html fallback.

## Good to know

- **Payment details** (Easypaisa / JazzCash / Meezan) are in `src/data/products.js` → `PAYMENT_METHODS`.
- **Product copy / images** are in `src/data/products.js`; images in `public/assets/`.
- Delivery rule: Rs. 200 below Rs. 999, free from Rs. 999 (`src/data/products.js` **and** `CONFIG` in `Code.gs` — change both).
- Payment proof: JPG/PNG/PDF, max 1 MB. Large phone screenshots are shrunk automatically in the browser.
- **Security notes:** passwords are salted + hashed (500× SHA-256) and login tokens are stored only as hashes, but Apps Script
  has no real rate-limiting — it is fine for a small shop, not for a large public service. Payment proofs stay private in
  your Drive. Google applies daily quotas to Apps Script (including a small daily email limit on free accounts), so order emails may stop on very busy days.
- The bundle has its own stock number (it does not subtract from Nano/Tongue stock).

## 4. SEO (Google, WhatsApp & Facebook previews)

Already built in:
- A separate pre-rendered page per public URL (`/shop`, `/luxe`, `/bundles`, `/reviews`, `/track`) with its own title, description,
  canonical link, Open Graph / Twitter card and JSON-LD structured data (Organization, WebSite, Product, Breadcrumbs).
- `sitemap.xml` and `robots.txt` generated on every build. Cart, checkout, login, account and admin are `noindex` and blocked in robots.txt.
- Web app manifest + icons, `lang="en-PK"`, one `<h1>` per page, alt text on images, long-term caching + security headers (`vercel.json`).

**Set your domain** (Vercel → Project → Settings → Environment Variables) and redeploy:
```
VITE_SITE_URL=https://yourdomain.pk
```
(default if not set: `https://tsafe.pk`). Page titles/descriptions are edited in `src/data/seo.js`.

After going live:
1. **Google Search Console** → add your domain → verify (Vercel DNS/TXT record) → *Sitemaps* → submit `sitemap.xml`.
2. **Google Business Profile** (free) — list the shop so it appears on Maps/local search.
3. Product prices in the JSON-LD come from `src/data/products.js`; keep them equal to the **Products** sheet.
