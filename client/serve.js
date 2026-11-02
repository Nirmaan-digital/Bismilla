// ============================================
// STATIC SERVER FOR THE BUILT REACT APP
// ============================================
// React Router routes like /retailer/payment/result only exist inside the
// JS bundle — there's no real file at that path. A hard navigation there
// (e.g. Stripe redirecting the browser back after checkout) makes the
// browser request that exact path from the server, and a plain static
// file server 404s because no such file exists on disk.
//
// The fix: serve real files (JS/CSS/images) as-is, but for any other GET
// request, send index.html instead of a 404. React Router then reads the
// URL and renders the right page client-side. This is the standard
// "SPA fallback" every React/Vue/Angular app needs on the server.
//
// Usage (from client/, after `npm run build`):
//   node serve.js
// Reads PORT from the environment, defaults to 3000. On Hostinger's
// Node.js app panel, set this file (client/serve.js) as the entry point
// and set the PORT it gives you as an environment variable.
// ============================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');

app.disable('x-powered-by');

// Where the browser is allowed to load things from. The API origin comes from
// API_ORIGIN (defaults to the live backend).
const API_ORIGIN = process.env.API_ORIGIN || 'https://backend.bismillahchickencenter.com';
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  `img-src 'self' data: blob: ${API_ORIGIN}`,
  `connect-src 'self' ${API_ORIGIN}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Short link for the privacy policy (used in the Play Store listing).
app.get(['/privacy', '/privacy-policy'], (req, res) => res.redirect(301, '/privacy.html'));

// Real built files (JS, CSS, images, favicon, etc.) — served as-is, with
// long-lived caching since Vite fingerprints filenames on every build.
app.use(
  express.static(DIST_DIR, {
    index: false,
    maxAge: '1y',
    setHeaders: (res, filePath) => {
      // index.html itself must never be cached, or people get stuck on an
      // old build after you deploy a new one.
      if (filePath.endsWith('index.html') || filePath.endsWith('sw.js') || filePath.endsWith('manifest.webmanifest')) {
        res.setHeader('Cache-Control', 'no-cache');
      } else if (!filePath.includes(`${path.sep}assets${path.sep}`)) {
        // Only Vite's hashed /assets files are safe to cache forever; the
        // logo, favicon etc. keep their names between deploys.
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  })
);

// Anything else (a client-side route, or a hard refresh on one) gets
// index.html. React Router takes over from there. (Express 5 dropped the
// bare '*' route pattern — a plain catch-all middleware works for any
// version.)
// While a deploy is still building (or a build failed and dist/ is empty),
// show a branded "updating" page that retries by itself, instead of a bare
// "Not Found".
const UPDATING_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="20">
<title>Bismillah Chicken Center</title><style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#15110e;color:#fbf8f2;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center;padding:24px;box-sizing:border-box}
h1{font-family:Georgia,serif;font-weight:500;color:#e9c77b;letter-spacing:.12em;margin:0 0 12px;font-size:28px}
p{color:#c9bba6;margin:6px 0;line-height:1.6}.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#c9973f;
margin:18px 4px 0;animation:b 1.2s infinite}.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes b{0%,80%,100%{opacity:.25}40%{opacity:1}}</style></head><body><div>
<h1>BISMILLAH</h1><p>We're updating the website.</p><p>This page will refresh by itself in a few seconds.</p>
<span class="dot"></span><span class="dot"></span><span class="dot"></span></div></body></html>`;

app.use((req, res) => {
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (!fs.existsSync(indexFile)) {
    res.status(503).setHeader('Retry-After', '20');
    res.setHeader('Cache-Control', 'no-store');
    return res.type('html').send(UPDATING_PAGE);
  }
  res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`✔ Client served on port ${PORT}`);
  console.log(`  Serving: ${DIST_DIR}`);
});