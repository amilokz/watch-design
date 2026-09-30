# AKCLNT Timepieces — CHRONO S

A luxury, scroll-driven concept demo website for a fictional high-end watch brand, **"AKCLNT Timepieces"**, built for the [AKCLNT](https://akclnt.com) studio demos portfolio. Inspired by premium watch product pages: cinematic hero, animated spec counters, a scroll-driven exploded-view anatomy scene, movement macro section, full-bleed craft quote, and a 3-watch collection lineup.

## What's inside

- `index.html` — page structure (10 sections: nav, hero, marquee, stats, slim profile, exploded anatomy, movement, craft quote, lineup, CTA + footer)
- `styles.css` — dark luxury theme (near-black `#0a0908`, champagne gold `#c8a15e`, ivory `#f2ede4`), Playfair Display + Inter from Google Fonts, responsive breakpoints at 1024 / 768 / 520px
- `script.js` — IntersectionObserver reveals, rAF scroll scenes (hero/craft parallax, slim drift, sticky exploded view with sequential part labels), animated counters, nav background, mobile hamburger menu, smooth anchors, demo CTA validation. Honors `prefers-reduced-motion`.
- `assets/` — 7 AI-generated WebP images (hero, slim profile, exploded view, movement macro, 2 variants, wrist lifestyle)

## How to view

No build step — it's plain static files, so it works from `file://` and any static host (e.g. GitHub Pages).

**Option 1 — open directly:** double-click `index.html` (needs internet for Google Fonts).

**Option 2 — local server (recommended):**

```bash
cd akclnt-watch-demo
python3 -m http.server 8000
# then open http://localhost:8000
```

## Notes

- Concept demo only — brand, model names, specs and prices are fictional.
- All asset paths are relative (`assets/hero.webp` etc.), so it deploys as-is to GitHub Pages.
- Crafted by AKCLNT · https://akclnt.com
