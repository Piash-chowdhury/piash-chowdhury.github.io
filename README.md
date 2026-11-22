# Piash Chowdhury — Portfolio

Single-page research portfolio. Static HTML, CSS, and vanilla JS: no build step.

Design: "Tracer". Estuary palette (blackwater ink, tannin brown, marsh green, sea-glass paper) with
rhodamine pink as the one accent. The hero is a canvas illustration of a stylized estuary: particles
ride a simple tide (river flow + sinusoidal tide, parabolic cross-channel profile, faster where the
channel narrows, random-walk diffusion). Clicking the water releases a dye plume. It is labelled on
the page as an illustration, not model output.

## Structure
```
index.html                 the site
404.html                   not-found page (absolute /my-portfolio/ paths so it works at any depth)
assets/css/site.css        all styles; colour tokens at the top (light + dark)
assets/js/theme.js         sets light/dark before first paint (saved choice, else OS setting)
assets/js/river.js         hero tide + dye illustration (pauses off-screen; static if reduced motion)
assets/js/site.js          theme toggle, mobile menu, news "Upcoming" tags, photo viewer, Leaflet map
assets/fonts/              Young Serif + Instrument Sans, self-hosted (OFL licences included)
assets/vendor/leaflet/     Leaflet 1.9.4, self-hosted
images/                    photos, maps, organisation logos (logo-*), favicon
.github/workflows/static.yml   checks links, then deploys only the public files
```

## Deploy
Settings > Pages > Build and deployment > Source: **GitHub Actions**. Every push to `main` runs
`static.yml`: it fails if any local `src`/`href` points to a missing file, then publishes only
`index.html`, `404.html`, `assets/`, and `images/`.

## Security model
- Content-Security-Policy (meta tag): scripts, styles, and fonts from this site only; images from
  this site plus the three map-tile hosts. No inline scripts, styles, or event handlers: keep JS in
  `assets/js/`, CSS in `site.css`.
- No `innerHTML`; map popups, news tags, and the photo viewer use `textContent`/DOM nodes.
- External links use `rel="noopener noreferrer"`; referrer policy `strict-origin-when-cross-origin`.
- No third-party fonts or analytics. Only third-party requests: map tiles (CARTO, OSM, Esri).
- GitHub Pages can't send custom HTTP headers, so `frame-ancestors`/HSTS aren't available.

## Editing
- News: add an `<li class="note" data-date="YYYY-MM-DD">` at the top of `#news`. Future dates get
  an "Upcoming" tag automatically.
- Organisation logos: `<a class="org" href="(official site)">` wrapping an `<img>` from `images/`.
  Logos belong to their owners and are used only to identify affiliations.
- Map stops: `stops` in `assets/js/site.js`.
- Anything placed in `images/` or `assets/` becomes public.
