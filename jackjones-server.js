const http = require('http');
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const PORT = process.env.PORT || 3000;
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'Jackandjonespizza@outlook.com';
const DB_FILE = path.join(__dirname, 'bestellingen.json');

// ── DATABASE ──
function lees() {
  try { return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
  catch(e) { return []; }
}
function schrijf(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ── DASHBOARD HTML ──
const dashboardHTML = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jack & Jones Pizza — Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#0A0806;color:#F5EDE0;min-height:100vh}
nav{background:#111;border-bottom:2px solid #E8150A;padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.logo{font-size:1.1rem;font-weight:700;letter-spacing:.1em;color:white}.logo span{color:#E8150A}
.con{max-width:1100px;margin:0 auto;padding:1.5rem}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:2rem}
.stat{background:#1A1410;border:1px solid rgba(255,255,255,.06);padding:1.2rem;text-align:center}
.stat-num{font-size:1.8rem;font-weight:700;color:#E8150A;line-height:1}
.stat-lbl{font-size:.65rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-top:.3rem}
.filters{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap}
.ftab{padding:.35rem .9rem;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;border:1px solid rgba(255,255,255,.1);background:none;color:rgba(255,255,255,.4);cursor:pointer;font-family:inherit;transition:all .2s}
.ftab.active{border-color:#E8150A;color:#E8150A}
.orders{display:flex;flex-direction:column;gap:.6rem}
.ocard{background:#1A1410;border:1px solid rgba(255,255,255,.06);padding:1rem 1.2rem;cursor:pointer;transition:border-color .2s}
.ocard:hover{border-color:rgba(232,21,10,.3)}
.oh{display:flex;align-items:center;gap:.8rem;flex-wrap:wrap}
.oid{font-size:.95rem;font-weight:700;color:white;font-family:monospace}
.onaam{font-size:.84rem;color:rgba(255,255,255,.6)}
.otot{font-size:.88rem;font-weight:700;color:#E8150A;margin-left:auto}
.badge{font-size:.6rem;letter-spacing:.1em;text-transform:uppercase;padding:.2rem .5rem;font-weight:700}
.s-nieuw{background:#E8150A;color:white}.s-betaald,.s-afgeleverd{background:#06C167;color:white}
.s-bereid{background:#FFB800;color:#111}.s-onderweg{background:#4488FF;color:white}
.s-geannuleerd,.s-mislukt{background:#333;color:#666}
.otype{font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;padding:.18rem .5rem;font-weight:600}
.tb{background:rgba(6,193,103,.15);color:#06C167}.ta{background:rgba(232,21,10,.15);color:#E8150A}
.otime{font-size:.68rem;color:rgba(255,255,255,.25)}
.details{display:none;margin-top:.8rem;padding-top:.8rem;border-top:1px solid rgba(255,255,255,.06)}
.ditems{margin-bottom:.8rem}
.di{display:flex;justify-content:space-between;padding:.25rem 0;font-size:.8rem;color:rgba(255,255,255,.6);border-bottom:1px solid rgba(255,255,255,.03)}
.dinfo{display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.8rem;font-size:.76rem}
.df{color:rgba(255,255,255,.45)}.df strong{color:rgba(255,255,255,.75);display:block}
.sbtns{display:flex;gap:.4rem;flex-wrap:wrap}
.sbtn{padding:.35rem .8rem;font-size:.68rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700;border:none;cursor:pointer;font-family:inherit}
.sb-ok{background:#06C167;color:white}.sb-b{background:#FFB800;color:#111}
.sb-ow{background:#4488FF;color:white}.sb-af{background:#888;color:white}
.sb-x{background:rgba(255,255,255,.08);color:rgba(255,255,255,.4)}
.empty{text-align:center;padding:4rem;color:rgba(255,255,255,.3)}
.rbtn{background:rgba(232,21,10,.15);border:1px solid rgba(232,21,10,.3);color:#E8150A;padding:.35rem .8rem;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;cursor:pointer;font-family:inherit}
.ping{width:8px;height:8px;background:#06C167;border-radius:50%;display:inline-block;margin-right:.4rem;animation:blink 2s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
@media(max-width:600px){.stats{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<nav>
  <div class="logo">JACK <span>&</span> JONES <span style="font-size:.75rem;color:rgba(255,255,255,.35);font-weight:400">DASHBOARD</span></div>
  <div style="display:flex;align-items:center;gap:.8rem">
    <span style="font-size:.7rem;color:rgba(255,255,255,.3)" id="upd"></span>
    <button class="rbtn" onclick="load()">↻ Refresh</button>
  </div>
</nav>
<div class="con">
  <div class="stats">
    <div class="stat"><div class="stat-num" id="sv">—</div><div class="stat-lbl">Vandaag</div></div>
    <div class="stat"><div class="stat-num" id="so">—</div><div class="stat-lbl">Omzet vandaag</div></div>
    <div class="stat"><div class="stat-num" id="sn">—</div><div class="stat-lbl">Nieuw</div></div>
    <div class="stat"><div class="stat-num" id="st">—</div><div class="stat-lbl">Totaal</div></div>
  </div>
  <div class="filters">
    <button class="ftab active" onclick="fil('alles',this)">Alles</button>
    <button class="ftab" onclick="fil('nieuw',this)">🔴 Nieuw</button>
    <button class="ftab" onclick="fil('betaald',this)">💚 Betaald</button>
    <button class="ftab" onclick="fil('bereid',this)">🟡 Bereid</button>
    <button class="ftab" onclick="fil('onderweg',this)">🔵 Onderweg</button>
    <button class="ftab" onclick="fil('afgeleverd',this)">✅ Afgeleverd</button>
  </div>
  <div class="orders" id="orders"><div class="empty">Laden...</div></div>
</div>
<script>
let all=[];let cf='alles';
const sl={nieuw:'Nieuw',betaald:'Betaald',bereid:'Wordt bereid',onderweg:'Onderweg',afgeleverd:'Afgeleverd',mislukt:'Mislukt',geannuleerd:'Geannuleerd'};
async function load(){
  try{
    const r=await fetch('/api/bestellingen');
    all=await r.json();
    const v=new Date().toDateString();
    const vd=all.filter(b=>new Date(b.aangemaakt_op).toDateString()===v&&!['mislukt','geannuleerd'].includes(b.status));
    document.getElementById('sv').textContent=vd.length;
    document.getElementById('so').textContent='€'+vd.reduce((s,b)=>s+b.totaal,0).toFixed(0);
    document.getElementById('sn').textContent=all.filter(b=>['nieuw','betaald'].includes(b.status)).length;
    document.getElementById('st').textContent=all.length;
    document.getElementById('upd').textContent=new Date().toLocaleTimeString('nl-NL');
    render();
  }catch(e){document.getElementById('orders').innerHTML='<div class="empty">Fout bij laden</div>';}
}
function fil(s,btn){cf=s;document.querySelectorAll('.ftab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render();}
function render(){
  const data=cf==='alles'?all:all.filter(b=>b.status===cf);
  const el=document.getElementById('orders');
  if(!data.length){el.innerHTML='<div class="empty">🍕 Geen bestellingen</div>';return;}
  el.innerHTML=data.map(b=>{
    const items=Array.isArray(b.items)?b.items:JSON.parse(b.items||'[]');
    const t=new Date(b.aangemaakt_op).toLocaleString('nl-NL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
    return \`<div class="ocard" onclick="tog(this)">
      <div class="oh">
        <span class="oid">#\${b.id}</span>
        <span class="onaam">\${b.naam}</span>
        <span class="badge s-\${b.status}">\${sl[b.status]||b.status}</span>
        <span class="otype \${b.type==='bezorgen'?'tb':'ta'}">\${b.type==='bezorgen'?'🛵 Bezorgen':'🏪 Afhalen'}</span>
        <span class="otot">€\${b.totaal.toFixed(2).replace('.',',')}</span>
        <span class="otime">\${t}</span>
      </div>
      <div class="details">
        <div class="ditems">\${items.map(i=>\`<div class="di"><span>\${i.emoji||'🍕'} \${i.naam||i.name} x\${i.aantal||i.qty}</span><span>€\${((i.prijs||i.price)*(i.aantal||i.qty)).toFixed(2).replace('.',',')}</span></div>\`).join('')}</div>
        <div class="dinfo">
          <div class="df"><strong>Klant</strong>\${b.naam}</div>
          <div class="df"><strong>Tel</strong>\${b.telefoon||'—'}</div>
          <div class="df"><strong>Email</strong>\${b.email}</div>
          \${b.adres?'<div class="df"><strong>Adres</strong>'+b.adres+' '+b.postcode+'</div>':''}
          \${b.opmerking?'<div class="df"><strong>Opmerking</strong>'+b.opmerking+'</div>':''}
        </div>
        <div class="sbtns">
          <button class="sbtn sb-ok" onclick="upd('\${b.id}','betaald',event)">✅ Betaald</button>
          <button class="sbtn sb-b" onclick="upd('\${b.id}','bereid',event)">👨‍🍳 Bereid</button>
          <button class="sbtn sb-ow" onclick="upd('\${b.id}','onderweg',event)">🛵 Onderweg</button>
          <button class="sbtn sb-af" onclick="upd('\${b.id}','afgeleverd',event)">✅ Afgeleverd</button>
          <button class="sbtn sb-x" onclick="upd('\${b.id}','geannuleerd',event)">✕ Annuleer</button>
        </div>
      </div>
    </div>\`;
  }).join('');
}
function tog(el){el.querySelector('.details').style.display=el.querySelector('.details').style.display==='block'?'none':'block';}
async function upd(id,status,e){
  e.stopPropagation();
  await fetch('/api/bestellingen/'+id+'/status',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
  load();
}
load();
setInterval(load,30000);
</script>
</body>
</html>`;

// ── BEDANKT HTML ──
const bedanktHTML = `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bestelling ontvangen!</title>
<style>body{margin:0;font-family:system-ui,sans-serif;background:#0A0806;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}.box{max-width:460px}.icon{font-size:4rem;animation:b 1s ease}@keyframes b{0%,100%{transform:scale(1)}50%{transform:scale(1.2)}}h1{font-size:2rem;margin-bottom:.5rem}.id{background:#E8150A;display:inline-block;padding:.4rem 1.2rem;font-size:1.2rem;font-weight:700;letter-spacing:.1em;margin:1rem 0}p{color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:1rem}.btn{display:inline-block;background:#E8150A;color:white;padding:.85rem 2rem;font-size:.82rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;margin-top:1rem}</style>
</head>
<body>
<div class="box">
  <div class="icon">🍕</div>
  <h1>Bestelling ontvangen!</h1>
  <div class="id" id="oid">...</div>
  <p>Bedankt! Je krijgt een bevestiging per email.<br>Vragen? Bel <strong>06 854 21 168</strong></p>
  <a href="/" class="btn">← Terug</a>
</div>
<script>const id=new URLSearchParams(location.search).get('id');if(id)document.getElementById('oid').textContent='#'+id;</script>
</body></html>`;

// ── HTTP SERVER ──
const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  const method = req.method;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (method === 'OPTIONS') { res.writeHead(200); return res.end(); }

  // Parse body
  function parseBody(cb) {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try { cb(JSON.parse(body)); } catch(e) { cb({}); }
    });
  }

  function json(data, code=200) {
    res.writeHead(code, {'Content-Type':'application/json'});
    res.end(JSON.stringify(data));
  }

  function html(content) {
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    res.end(content);
  }

  // ── ROUTES ──

  // Dashboard
  if (url === '/dashboard' && method === 'GET') return html(dashboardHTML);

  // Bedankt
  if (url === '/bedankt' && method === 'GET') return html(bedanktHTML);

  // Status
  if (url === '/api/status' && method === 'GET') return json({ status: 'ok', restaurant: 'Jack & Jones Pizza' });

  // GET bestellingen
  if (url === '/api/bestellingen' && method === 'GET') {
    return json(lees());
  }

  // POST nieuwe bestelling
  if (url === '/api/bestellingen' && method === 'POST') {
    return parseBody(data => {
      const { naam, email, telefoon, adres, postcode, type, items, opmerking } = data;
      if (!naam || !email || !items?.length) return json({ error: 'Naam, email en items verplicht' }, 400);

      const subtotaal = items.reduce((s, i) => s + ((i.prijs||i.price) * (i.aantal||i.qty)), 0);
      const bezorgkosten = type === 'bezorgen' ? 2.50 : 0;
      const totaal = subtotaal + bezorgkosten;
      const id = randomBytes(3).toString('hex').toUpperCase();

      const bestelling = {
        id, naam, email,
        telefoon: telefoon || '',
        adres: adres || '',
        postcode: postcode || '',
        type: type || 'afhalen',
        items,
        subtotaal, bezorgkosten, totaal,
        opmerking: opmerking || '',
        status: 'nieuw',
        aangemaakt_op: new Date().toISOString()
      };

      const db = lees();
      db.unshift(bestelling);
      schrijf(db);

      console.log(`🍕 NIEUWE BESTELLING #${id} — ${naam} — €${totaal.toFixed(2)} — ${type}`);
      items.forEach(i => console.log(`   ${i.emoji||'•'} ${i.naam||i.name} x${i.aantal||i.qty}`));

      return json({ success: true, bestellingId: id });
    });
  }

  // PATCH status
  const statusMatch = url.match(/^\/api\/bestellingen\/([^/]+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    return parseBody(data => {
      const db = lees();
      const idx = db.findIndex(b => b.id === statusMatch[1]);
      if (idx > -1) { db[idx].status = data.status; schrijf(db); }
      return json({ success: true });
    });
  }

  // GET specifieke bestelling
  const getMatch = url.match(/^\/api\/bestellingen\/([^/]+)$/);
  if (getMatch && method === 'GET') {
    const b = lees().find(b => b.id === getMatch[1]);
    return b ? json(b) : json({ error: 'Niet gevonden' }, 404);
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`\n🍕 Jack & Jones Pizza Backend`);
  console.log(`✅ Server: http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📦 API: http://localhost:${PORT}/api/bestellingen`);
});
