# Piash Chowdhury — Portfolio

A single-page personal research portfolio (coastal & estuarine science / GIS).
Static site — no build step, no dependencies. Just HTML, CSS, and vanilla JS.

## Structure
```
piash-portfolio/
├── index.html              # the site
├── 404.html                # custom not-found page
├── assets/
│   ├── css/style.css       # all styles
│   ├── js/main.js          # theme, slideshow, map, lightbox, count-up
│   └── Piash_Chowdhury_CV.pdf
└── images/                 # portrait, thesis maps, gallery, logos, favicon
```

## Deploy to GitHub Pages
1. Put the **contents** of this folder at the root of your `my-portfolio` repo
   (so `index.html` sits at the top level, with `assets/` and `images/` beside it).
2. Commit and push.
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick your branch (`main`) and folder (`/root`), Save.
4. Your site goes live at `https://<username>.github.io/my-portfolio/`.

## Editing
- **Text/content:** edit `index.html`.
- **Colors, spacing, fonts:** CSS custom properties at the top of `assets/css/style.css`
  (light theme under `html[data-theme="light"]`, dark under `[data-theme="dark"]`).
- **Journey map:** the world map is inline static SVG in `index.html` (no API keys, works offline).
- **Gallery / research images:** drop files in `images/` and update the matching `<img>` / `data-full`.

## Notes
- Fonts load from Google Fonts with system fallbacks; the site works fine if that request is blocked.
- Dark/light follows the visitor's OS preference and can be toggled in the nav.

## Optional images to drop in (nice-to-have)
The site works fully without these — each has a built-in graceful fallback — but adding
them makes it richer. Drop files with these exact names into `images/`:

| File | What it is | Where to get it |
|------|-----------|-----------------|
| `sjre.jpg` | St. Johns River photo (research card 01). Falls back to a live Wikimedia photo, then to a wave graphic. | Your own field photo, or a USGS/Wikimedia St. Johns River image. |
| `logo-gw.png` | Genesee & Wyoming logo (experience). Falls back to a "G&W" badge. | gwrr.com press/brand assets. |
| `logo-spekter.png` | Spekter GmbH logo (experience). Falls back to a "SPEKTER" badge. | spekter.de. |

Transparent PNGs (square-ish) look best for the logos.

## Interactive map
The Journey section uses **Leaflet** (self-hosted in `assets/vendor/leaflet/`, so it always loads).
Base map tiles come from OpenStreetMap / CARTO / Esri at runtime — visitors need internet for the
map imagery, but the markers, journey path, zoom, and layer switcher work regardless. Marker data
lives in `assets/js/main.js` (the `stops` array) — edit coordinates or text there.

Optional remaining logo: `images/logo-spekter.png` (falls back to a "SPEKTER" badge). UNF and G&W logos are included.
