(function(){var r=document.documentElement;var d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;r.setAttribute('data-theme',d?'dark':'light');
document.getElementById('themeBtn').addEventListener('click',function(){r.setAttribute('data-theme',r.getAttribute('data-theme')==='dark'?'light':'dark');});})();
(function(){var b=document.getElementById('menuBtn'),l=document.getElementById('navlinks');b.addEventListener('click',function(){l.classList.toggle('open');});
l.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){l.classList.remove('open');});});})();
/* reveal */
(function(){var els=document.querySelectorAll('.reveal');if(!('IntersectionObserver'in window)){els.forEach(function(e){e.classList.add('in');});return;}
var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.1,rootMargin:'0px 0px -6% 0px'});
els.forEach(function(e){io.observe(e);});})();
/* hero slideshow */
(function(){var s=document.querySelectorAll('#slides .slide');if(!s.length)return;var i=0;s[0].classList.add('active');
setInterval(function(){s[i].classList.remove('active');i=(i+1)%s.length;s[i].classList.add('active');},6000);})();
/* count-up */
(function(){var ms=document.querySelectorAll('.metric .n');if(!('IntersectionObserver'in window)){ms.forEach(function(m){m.textContent=m.dataset.count;});return;}
var io=new IntersectionObserver(function(en){en.forEach(function(e){if(!e.isIntersecting)return;var el=e.target,t=+el.dataset.count,st=null;
function step(ts){if(!st)st=ts;var p=Math.min((ts-st)/900,1);el.textContent=Math.round(p*t);if(p<1)requestAnimationFrame(step);}requestAnimationFrame(step);io.unobserve(el);});},{threshold:.6});
ms.forEach(function(m){io.observe(m);});})();
/* journey: arc draw, tooltip, and info panel */
(function(){var grid=document.getElementById('journeyWrap');if(!grid)return;
var mapbox=grid.querySelector('.journey-wrap');var tip=document.getElementById('jtip');
grid.querySelectorAll('.jarc').forEach(function(p){var L=p.getTotalLength();p.style.setProperty('--len',Math.ceil(L));});
var panel=document.getElementById('journeyPanel');
var pName=document.getElementById('jpName'),pSub=document.getElementById('jpSub'),pDesc=document.getElementById('jpDesc'),pBadge=document.getElementById('jpBadge');
function showTip(el,ev){tip.innerHTML='<b>'+el.dataset.name+'</b> &mdash; '+el.dataset.sub;tip.style.opacity=1;
  var r=mapbox.getBoundingClientRect();tip.style.left=(ev.clientX-r.left)+'px';tip.style.top=(ev.clientY-r.top)+'px';}
function hideTip(){tip.style.opacity=0;}
var cities=grid.querySelectorAll('.jcity');
cities.forEach(function(c,i){
  function fill(){if(pBadge)pBadge.textContent='Stop '+('0'+(i+1)).slice(-2);pName.innerHTML=c.dataset.name;
    pSub.innerHTML=c.dataset.sub;pDesc.innerHTML=c.dataset.desc||c.dataset.sub;
    if(panel){panel.classList.add('pulse');setTimeout(function(){panel.classList.remove('pulse');},450);}}
  c.addEventListener('mouseenter',fill);
  c.addEventListener('mousemove',function(ev){showTip(c,ev);});
  c.addEventListener('mouseleave',hideTip);
  c.addEventListener('click',fill);
});
grid.querySelectorAll('.jsite').forEach(function(s){
  s.addEventListener('mousemove',function(ev){showTip(s,ev);});
  s.addEventListener('mouseleave',hideTip);
});})();
/* gallery lightbox */
(function(){var lb=document.getElementById('lightbox'),im=document.getElementById('lbImg'),cap=document.getElementById('lbCap');
document.querySelectorAll('#gallery figure').forEach(function(f){f.addEventListener('click',function(){im.src=f.dataset.full;var b=f.querySelector('b');cap.textContent=b?b.textContent:'';lb.classList.add('open');});});
function close(){lb.classList.remove('open');im.src='';}
document.getElementById('lbClose').addEventListener('click',close);
lb.addEventListener('click',function(e){if(e.target===lb)close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});})();

/* scroll progress bar */
(function(){var bar=document.getElementById('scrollProgress');if(!bar)return;
function upd(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;
  bar.style.width=(max>0?(h.scrollTop/max*100):0)+'%';}
window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();})();

/* interactive toolbox: tab filter + hover detail */
(function(){var tabs=document.getElementById('tkTabs');if(!tabs)return;
var chips=[].slice.call(document.querySelectorAll('#tkGrid .tk-chip'));
var out=document.getElementById('tkDetailText');
tabs.addEventListener('click',function(e){var b=e.target.closest('.tk-tab');if(!b)return;
  tabs.querySelectorAll('.tk-tab').forEach(function(t){t.classList.remove('active');});b.classList.add('active');
  var cat=b.dataset.cat;chips.forEach(function(c){c.classList.toggle('hide',cat!=='all'&&c.dataset.cat!==cat);});});
chips.forEach(function(c){
  function show(){out.innerHTML=c.dataset.desc;}
  c.addEventListener('mouseenter',show);c.addEventListener('focus',show);c.addEventListener('click',show);});})();

/* hero flow-field particle animation (mouse-reactive) */
(function(){var cv=document.getElementById('flow');if(!cv)return;
if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var ctx=cv.getContext('2d'),W,H,parts=[],mouse={x:-999,y:-999},raf;
var N=window.innerWidth<720?55:110;
function accent(){return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#16a34a';}
function resize(){var r=cv.getBoundingClientRect();W=cv.width=r.width;H=cv.height=r.height;}
function P(){this.reset(true);}
P.prototype.reset=function(init){this.x=Math.random()*W;this.y=init?Math.random()*H:(Math.random()<.5?0:H*Math.random());
  this.vx=0;this.vy=0;this.life=40+Math.random()*160;this.age=0;this.sz=.6+Math.random()*1.6;};
function field(x,y,t){/* smooth pseudo-flow: layered sines -> angle */
  return Math.sin(x*0.0026+t*0.0002)+Math.cos(y*0.0031-t*0.00017)+Math.sin((x+y)*0.0015);}
var t0=performance.now();
function tick(now){var t=now-t0;ctx.clearRect(0,0,W,H);var col=accent();
  for(var i=0;i<parts.length;i++){var p=parts[i];
    var a=field(p.x,p.y,t)*Math.PI;p.vx+=Math.cos(a)*0.08;p.vy+=Math.sin(a)*0.08;
    var dx=p.x-mouse.x,dy=p.y-mouse.y,d2=dx*dx+dy*dy;
    if(d2<9000){var f=(9000-d2)/9000*0.9;p.vx+=dx/Math.sqrt(d2+1)*f;p.vy+=dy/Math.sqrt(d2+1)*f;}
    p.vx*=0.94;p.vy*=0.94;p.x+=p.vx;p.y+=p.vy;p.age++;
    if(p.age>p.life||p.x<0||p.x>W||p.y<0||p.y>H)p.reset(false);
    var alpha=Math.min(1,(p.life-p.age)/40)*0.5;
    ctx.beginPath();ctx.arc(p.x,p.y,p.sz,0,6.283);ctx.fillStyle=col;ctx.globalAlpha=alpha;ctx.fill();
  }ctx.globalAlpha=1;raf=requestAnimationFrame(tick);}
function start(){resize();parts=[];for(var i=0;i<N;i++)parts.push(new P());cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);}
var hero=cv.closest('.hero');
hero.addEventListener('mousemove',function(e){var r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
hero.addEventListener('mouseleave',function(){mouse.x=mouse.y=-999;});
window.addEventListener('resize',start);start();})();

/* ---------- interactive Leaflet journey map ---------- */
(function(){
  var el=document.getElementById('leafmap'); if(!el||typeof L==='undefined')return;
  var C={home:'#12a06a',study:'#0e7c53',work:'#4d7c0f',now:'#f59e0b',trip:'#16a34a',site:'#e11d48',survey:'#8b5cf6'};
  var stops=[
    {n:'Noakhali',t:'home',ll:[22.87,91.10],s:'Home · Bangladesh',d:'Where it started — a low-lying coastal district where the rivers give everything and sometimes take it back.'},
    {n:'Sylhet (SUST)',t:'study',ll:[24.90,91.87],s:'BSc & MS · Geography & Environment',d:'Shahjalal University of Science & Technology — base for field studies across Bangladesh.'},
    {n:'Herzogenaurach',t:'work',ll:[49.57,10.88],s:'Spekter GmbH · Lead GIS Analyst',d:'Urban flood & heavy-rainfall modeling with MIKE + LiDAR, automated in Python.'},
    {n:'Jacksonville (UNF)',t:'now',ll:[30.2699,-81.5089],s:'University of North Florida · Now',d:'Graduate Research Assistant — Delft3D modeling of the St. Johns River Estuary.'},
    {n:'Gainesville',t:'trip',ll:[29.6516,-82.3248],s:'UF Water Institute Symposium 2026',d:'Oral talk on water-quality modeling of the St. Johns Estuary under sea-level rise & disaster scenarios.'},
    {n:'Galveston',t:'trip',ll:[29.3013,-94.7977],s:'ICCE 2026 · Texas',d:'Poster at the 39th International Conference on Coastal Engineering, plus a Texas coastal field tour.'},
    {n:'Sunamganj',t:'site',ll:[25.07,91.40],s:'Field / study site',d:'Flash-flood risk zonation study (co-authored, Arabian J. of Geosciences).'},
    {n:'Nijhum Dwip',t:'site',ll:[22.05,91.02],s:'Field / study site',d:'Four decades of shoreline change — BSc thesis.'},
    {n:'Kuakata',t:'site',ll:[21.82,90.12],s:'Field / study site',d:'Coastal beach geomorphology (book chapter).'},
    {n:'Pottsburg Creek',t:'survey',ll:[30.2865,-81.5860],s:'Field survey · Jacksonville',d:'Canoe survey of Pottsburg Creek — a tidal tributary of the St. Johns Estuary.'}
  ];
  var map=L.map(el,{scrollWheelZoom:false,worldCopyJump:true,minZoom:2}).setView([28,20],2);
  map.on('focus',function(){map.scrollWheelZoom.enable();});
  map.on('blur',function(){map.scrollWheelZoom.disable();});
  var streets=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}),
      light=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'&copy; OpenStreetMap, &copy; CARTO'}),
      sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:19,attribution:'Tiles &copy; Esri'});
  light.addTo(map);
  var panel={n:document.getElementById('jpName'),s:document.getElementById('jpSub'),d:document.getElementById('jpDesc'),
             b:document.getElementById('jpBadge'),box:document.getElementById('journeyPanel')};
  var line=[],group=L.layerGroup().addTo(map),sitesGrp=L.layerGroup().addTo(map);
  stops.forEach(function(p,i){
    var isSite=(p.t==='site'||p.t==='survey');
    var mk=L.circleMarker(p.ll,{radius:p.t==='now'?9:(isSite?5:7),color:'#fff',weight:2,fillColor:C[p.t],fillOpacity:.95});
    mk.bindPopup('<b>'+p.n+'</b><br><span style="font-family:monospace;font-size:11px;color:#0e7c53">'+p.s+'</span><br>'+p.d,{closeButton:false});
    mk.on('click',function(){if(panel.n){panel.b.textContent=isSite?'Field site':'Stop '+('0'+(i+1)).slice(-2);
      panel.n.textContent=p.n;panel.s.textContent=p.s;panel.d.textContent=p.d;
      panel.box.classList.add('pulse');setTimeout(function(){panel.box.classList.remove('pulse');},450);}});
    (isSite?sitesGrp:group).addLayer(mk);
    if(!isSite)line.push(p.ll);
  });
  var journey=L.polyline(line,{color:'#16a34a',weight:2.5,opacity:.7,dashArray:'6 7'}).addTo(map);
  L.control.layers({'Light':light,'Streets':streets,'Satellite':sat},
    {'Journey path':journey,'Field sites':sitesGrp},{position:'topright'}).addTo(map);
  try{map.fitBounds(L.latLngBounds(stops.map(function(p){return p.ll;})).pad(0.15));}catch(e){}
  setTimeout(function(){map.invalidateSize();},300);
})();

/* toolbox: prepend a category icon to each chip */
(function(){
  var ICON={
    modeling:'<path d="M2 8c2-2 3 2 5 0s3-2 5 0 3 2 5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 12c2-2 3 2 5 0s3-2 5 0 3 2 5 0" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    gis:'<path d="M9 1.5C6 1.5 3.8 3.7 3.8 6.7 3.8 10.5 9 16 9 16s5.2-5.5 5.2-9.3C14.2 3.7 12 1.5 9 1.5z" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="6.7" r="1.8" fill="currentColor"/>',
    code:'<path d="M6 4 2 9l4 5M12 4l4 5-4 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
    lab:'<path d="M7 2v4L3 14a1.5 1.5 0 0 0 1.4 2h9.2A1.5 1.5 0 0 0 15 14L11 6V2M6 2h6M5.5 11h7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    training:'<path d="M9 2l6 3-6 3-6-3 6-3zM4 7v3c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7M15 8v4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
  };
  document.querySelectorAll('#tkGrid .tk-chip').forEach(function(c){
    var dot=c.querySelector('.tk-dot'); if(!dot)return;
    var ic=document.createElement('span'); ic.className='tk-ico';
    ic.innerHTML='<svg viewBox="0 0 18 18" aria-hidden="true">'+(ICON[c.dataset.cat]||'')+'</svg>';
    c.replaceChild(ic,dot);
  });
})();
