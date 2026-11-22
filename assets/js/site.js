/* Piash Chowdhury portfolio. No innerHTML, no inline handlers: everything works under a strict CSP. */
(function () {
  'use strict';
  var root = document.documentElement;
  function $(id) { return document.getElementById(id); }

  /* ---- theme toggle (saved choice wins over OS preference) ---- */
  var themeBtn = $('themeBtn');
  function labelTheme() {
    themeBtn.setAttribute('aria-label', root.getAttribute('data-theme') === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeBtn) {
    labelTheme();
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
      labelTheme();
    });
  }

  /* ---- mobile menu ---- */
  var menuBtn = $('menuBtn'), nav = $('navlinks');
  if (menuBtn && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    };
    menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* ---- news: tag items whose date is still ahead ---- */
  var today = new Date();
  document.querySelectorAll('.note[data-date]').forEach(function (n) {
    var d = new Date(n.getAttribute('data-date') + 'T00:00:00');
    var h = n.querySelector('h3');
    if (!isNaN(d) && d > today && h) {
      var tag = document.createElement('span'); tag.className = 'upcoming'; tag.textContent = 'Upcoming';
      h.appendChild(tag);
    }
  });

  /* ---- footer year ---- */
  var yr = $('year');
  if (yr) yr.textContent = String(new Date().getFullYear());

  /* ---- gallery lightbox (native <dialog>: focus trap + Escape built in) ---- */
  var lb = $('lightbox'), lbImg = $('lbImg'), lbCap = $('lbCap'), lbClose = $('lbClose');
  var opener = null;
  if (lb && typeof lb.showModal === 'function') {
    document.querySelectorAll('.gallery button[data-full]').forEach(function (b) {
      b.addEventListener('click', function () {
        var src = b.getAttribute('data-full');
        if (!/^images\/[\w.-]+\.(jpe?g|png|webp)$/i.test(src)) return; // only local images
        var img = b.querySelector('img'), cap = b.parentNode.querySelector('figcaption');
        opener = b;
        lbImg.src = src;
        lbImg.alt = img ? img.alt : '';
        lbCap.textContent = cap ? cap.textContent.trim() : '';
        lb.showModal();
      });
    });
    lbClose.addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---- journey map (Leaflet) ---- */
  var el = $('leafmap');
  if (!el || typeof L === 'undefined') { if (el) el.hidden = true; return; }

  var COLOR = { now: '#D99A1E', path: '#7A4E25', trip: '#C4185F', site: '#5E7F3A' };
  var stops = [
    { n: 'Noakhali', t: 'path', ll: [22.87, 91.10], s: 'Home, Bangladesh', d: 'Where it started: a low-lying coastal district where the rivers give everything and sometimes take it back.' },
    { n: 'Sylhet (SUST)', t: 'path', ll: [24.90, 91.87], s: 'BSc and MS, Geography and Environment', d: 'Shahjalal University of Science and Technology, my base for field studies across Bangladesh.' },
    { n: 'Herzogenaurach', t: 'path', ll: [49.57, 10.88], s: 'Spekter GmbH, 2020–2025', d: 'Urban flood and heavy-rainfall modeling with MIKE and LiDAR, automated in Python.' },
    { n: 'Jacksonville (UNF)', t: 'now', ll: [30.2699, -81.5089], s: 'University of North Florida, now', d: 'Graduate Research Assistant: Delft3D modeling of the St. Johns River Estuary.' },
    { n: 'Gainesville', t: 'trip', ll: [29.6516, -82.3248], s: 'UF Water Institute Symposium 2026', d: 'Oral talk on water-quality modeling of the St. Johns Estuary under sea-level rise and disaster scenarios.' },
    { n: 'Galveston', t: 'trip', ll: [29.3013, -94.7977], s: 'ICCE 2026, Texas', d: 'Poster at the 39th International Conference on Coastal Engineering, plus a Texas coastal field tour.' },
    { n: 'Sunamganj', t: 'site', ll: [25.07, 91.40], s: 'Study site', d: 'Flash-flood risk zonation study, co-authored in the Arabian Journal of Geosciences.' },
    { n: 'Nijhum Dwip', t: 'site', ll: [22.05, 91.02], s: 'Study site', d: 'Four decades of shoreline change, my BSc thesis.' },
    { n: 'Kuakata', t: 'site', ll: [21.82, 90.12], s: 'Study site', d: 'Coastal beach geomorphology, book chapter.' },
    { n: 'Pottsburg Creek', t: 'site', ll: [30.2865, -81.5860], s: 'Field survey, Jacksonville', d: 'Canoe survey of a tidal tributary of the St. Johns Estuary.' }
  ];

  var map = L.map(el, { scrollWheelZoom: false, worldCopyJump: true, minZoom: 2 }).setView([28, 20], 2);
  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  var light = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: '&copy; OpenStreetMap contributors, &copy; CARTO' });
  var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' });
  var sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Tiles &copy; Esri' });
  light.addTo(map);

  var pName = $('jpName'), pSub = $('jpSub'), pDesc = $('jpDesc');
  var pathGrp = L.layerGroup().addTo(map), siteGrp = L.layerGroup().addTo(map), line = [];

  function popup(p) { // DOM nodes, so no HTML injection is possible
    var box = document.createElement('div'), b = document.createElement('b'), s = document.createElement('span');
    b.textContent = p.n; s.textContent = p.s;
    box.appendChild(b); box.appendChild(s);
    return box;
  }

  stops.forEach(function (p) {
    var mk = L.circleMarker(p.ll, {
      radius: p.t === 'now' ? 9 : (p.t === 'site' ? 5 : 7),
      color: '#fff', weight: 2, fillColor: COLOR[p.t], fillOpacity: 0.95
    });
    mk.bindPopup(popup(p), { closeButton: false });
    mk.on('click', function () { pName.textContent = p.n; pSub.textContent = p.s; pDesc.textContent = p.d; });
    (p.t === 'site' ? siteGrp : pathGrp).addLayer(mk);
    if (p.t === 'path' || p.t === 'now') line.push(p.ll);
  });

  var journey = L.polyline(line, { color: COLOR.path, weight: 2.5, opacity: 0.7, dashArray: '6 7' }).addTo(map);
  L.control.layers({ 'Light': light, 'Streets': streets, 'Satellite': sat },
    { 'Journey path': journey, 'Field sites': siteGrp }).addTo(map);
  map.fitBounds(L.latLngBounds(stops.map(function (p) { return p.ll; })).pad(0.15));
  window.addEventListener('load', function () { map.invalidateSize(); });
})();
