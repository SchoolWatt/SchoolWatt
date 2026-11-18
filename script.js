// SchoolWatt Solutions - interactive demo. All data below is simulated.
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const kwh = v => v.toLocaleString('en-PH', { maximumFractionDigits: 0 }) + ' kWh';
const php = v => '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const level = e => e < 3 ? { t: 'Normal', c: 'ok' } : e <= 5 ? { t: 'High', c: 'warn' } : { t: 'Very high', c: 'bad' };
const pill = e => `<i class="pill ${level(e).c}">${level(e).t}</i>`;

const ZONES = [['Classrooms', .40, '#0E3B2E'], ['Computer laboratories', .25, '#1F7A52'], ['Science laboratories', .15, '#4FA67B'], ['Administrative offices', .12, '#8CC9A8'], ['Common areas', .08, '#F5B301']];
const BUILDINGS = [
  { name: 'Main Building', area: 5000, use: 20000, bill: 300000 },
  { name: 'Engineering Building', area: 2500, use: 13000, bill: 195000 },
  { name: 'Administration', area: 1500, use: 5000, bill: 75000 },
  { name: 'Library', area: 1000, use: 3500, bill: 52500 }
];
const HISTORY = [10500, 10800, 11000, 11400, 11700, 12000];
const DEMO = { area: 5000, usage: 20000, rate: 15 }; // matches the Main Building on the Campus tab
const state = { ...DEMO };
// Campus data: the Main Building follows the calculator; every bill uses the current rate
const campusData = () => BUILDINGS.map((b, i) => i === 0 ? { ...b, area: state.area, use: state.usage, bill: state.usage * state.rate } : { ...b, bill: b.use * state.rate });

// ---------- helpers ----------
const grow = root => requestAnimationFrame(() => requestAnimationFrame(() =>
  $$('[data-w]', root).forEach(el => el.style.width = el.dataset.w + '%')));
const growV = root => requestAnimationFrame(() => requestAnimationFrame(() =>
  $$('[data-h]', root).forEach(el => el.style.height = el.dataset.h + '%')));
const monthName = (offset, long) => new Date(new Date().getFullYear(), new Date().getMonth() + offset, 1)
  .toLocaleDateString('en-PH', long ? { month: 'long', year: 'numeric' } : { month: 'short' });
let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}
const zoneRows = total => ZONES.map(([n, p, c]) => `
  <div class="zr"><div class="zl"><span>${n}</span><b>${Math.round(p * 100)}% · ${kwh(total * p)}</b></div>
  <div class="bar"><i style="--c:${c}" data-w="${p * 100}"></i></div></div>`).join('');

// ---------- hero ----------
const heroZones = $('#heroZones');
heroZones.innerHTML = zoneRows(DEMO.usage); grow(heroZones);

// ---------- overview ----------
function renderOverview() {
  const { area, usage, rate } = state, bill = usage * rate, eui = usage / area;
  $('#dashArea').textContent = area.toLocaleString('en-PH') + ' m² · Demonstration mode';
  $('#kEnergy').textContent = kwh(usage);
  $('#kBill').textContent = php(bill);
  $('#kEUI').textContent = eui.toFixed(2);
  $('#kLevel').innerHTML = pill(eui);
  $('#zones').innerHTML = zoneRows(usage); grow($('#zones'));
  $('#repMonth').textContent = monthName(0, true);
  $('#repEnergy').textContent = kwh(usage);
  $('#repBill').textContent = php(bill);
  $('#repEUI').textContent = eui.toFixed(2) + ' kWh/m²';
}

// ---------- campus ----------
function renderCampus() {
  const list = campusData().map(b => ({ ...b, eui: b.use / b.area }));
  const tUse = list.reduce((s, b) => s + b.use, 0), tBill = list.reduce((s, b) => s + b.bill, 0), tArea = list.reduce((s, b) => s + b.area, 0);
  const cEUI = tUse / tArea;
  const top = [...list].sort((a, b) => b.use - a.use)[0], worst = [...list].sort((a, b) => b.eui - a.eui)[0];
  $('#campusStats').innerHTML = [['Campus consumption', kwh(tUse), 'Combined monthly'], ['Campus electricity bill', php(tBill), 'Combined monthly'],
    ['Campus EUI', cEUI.toFixed(2), 'kWh/m²/month'], ['Campus status', pill(cEUI), 'Illustrative thresholds']]
    .map(([a, b, c]) => `<div class="kpi"><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join('');
  const advice = e => e < 3 ? 'Maintain current practices and keep monitoring monthly consumption.'
    : e <= 5 ? 'Review lighting schedules, air-conditioning settings and equipment operating hours.'
    : 'Schedule a detailed energy audit and inspect HVAC and laboratory equipment.';
  $('#bldgs').innerHTML = [...list].sort((a, b) => b.eui - a.eui).map((b, i) => `
    <div class="bc"><div class="bc-h"><h3>${i + 1}. ${b.name}</h3>${pill(b.eui)}</div>
    <div class="num">${kwh(b.use)}</div>
    <div class="bar"><i data-w="${b.use / top.use * 100}" style="--c:${level(b.eui).c === 'bad' ? '#B8400C' : level(b.eui).c === 'warn' ? '#F5B301' : '#1F7A52'}"></i></div>
    <div class="meta"><span>EUI <b>${b.eui.toFixed(2)}</b> kWh/m²</span><span>${b.area.toLocaleString()} m²</span><span>Bill <b>${php(b.bill).replace('.00', '')}</b></span></div>
    <p>${advice(b.eui)}</p></div>`).join('');
  grow($('#bldgs'));
  $('#insights').innerHTML = `
    <div><small>Biggest consumer</small><b>${top.name}</b><p>${(top.use / tUse * 100).toFixed(1)}% of campus consumption (${kwh(top.use)}).</p></div>
    <div><small>Needs attention first</small><b>${worst.name}</b><p>Highest EUI at ${worst.eui.toFixed(2)} kWh/m²/month (${level(worst.eui).t}).</p></div>
    <div><small>Campus intensity</small><b>${cEUI.toFixed(2)} kWh/m²</b><p>${level(cEUI).t} against the demonstration thresholds.</p></div>`;
  $('#action').textContent = worst.eui > 5
    ? `Prioritize ${worst.name} for a detailed energy audit: inspect HVAC, laboratory equipment, lighting schedules and operating hours.`
    : cEUI >= 3 ? `Start an efficiency review. Audit ${worst.name} first and check the load profile of ${top.name}.`
    : 'Maintain current practices with monthly monitoring and preventive maintenance.';
}

// ---------- forecast (least-squares linear trend) ----------
function renderForecast() {
  const HIST = HISTORY.map(v => Math.round(v * state.usage / HISTORY[HISTORY.length - 1])), n = HIST.length, xs = HIST.map((_, i) => i + 1);
  const sx = xs.reduce((a, b) => a + b, 0), sy = HIST.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * HIST[i], 0), sxx = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx), icpt = (sy - slope * sx) / n;
  const fc = Array.from({ length: 6 }, (_, i) => Math.round(Math.max(0, icpt + slope * (n + i + 1))));
  const total = fc.reduce((a, b) => a + b, 0), rate = state.rate;
  const trend = slope > 1 ? 'Increasing' : slope < -1 ? 'Decreasing' : 'Stable';
  $('#fStats').innerHTML = [['Average monthly forecast', kwh(total / 6), 'Next six months'], ['Total forecast energy', kwh(total), 'Combined'],
    ['Estimated cost', php(total * rate), `At ₱${rate}/kWh`], ['Trend', trend, `About ${Math.round(slope)} kWh more each month`]]
    .map(([a, b, c]) => `<div class="kpi"><span>${a}</span><b>${b}</b><small>${c}</small></div>`).join('');
  const all = [...HIST.map((v, i) => ({ v, l: monthName(i - 5) })), ...fc.map((v, i) => ({ v, l: monthName(i + 1), f: 1 }))];
  const max = Math.max(1, ...all.map(d => d.v));
  $('#vchart').innerHTML = all.map(d => `<div class="vc ${d.f ? 'f' : ''}" title="${d.l}: ${kwh(d.v)}"><em>${(d.v / 1000).toFixed(1)}k</em><i data-h="${d.v / max * 82}"></i></div>`).join('')
    + '';
  const lab = $('#vlab') || Object.assign(document.createElement('div'), { id: 'vlab', className: 'vlab' });
  lab.innerHTML = all.map(d => `<span>${d.l}</span>`).join(''); $('#vchart').after(lab);
  $('#ftable').innerHTML = fc.map((v, i) => `<tr><td>${monthName(i + 1, true)}</td><td>${kwh(v)}</td><td>${php(v * rate)}</td></tr>`).join('');
  growV($('#vchart'));
}

// ---------- calculator ----------
const inputs = { area: $('#area'), usage: $('#usage'), rate: $('#rate') };
const setText = (id, v) => $('#' + id).textContent = v;
function renderSavings() {
  const cut = Number($('#cut').value), bill = state.usage * state.rate, save = bill * cut / 100;
  setText('cutVal', cut + '%'); setText('sMonth', php(save)); setText('sYear', php(save * 12)); setText('sNew', php(bill - save));
  setText('sNote', `Based on ${kwh(state.usage)} at ₱${state.rate}/kWh${inputs.usage.value ? '' : ' (sample values until you enter your own)'}.`);
}
function calculate() {
  const v = Object.fromEntries(Object.entries(inputs).map(([k, el]) => [k, el.value.trim() === '' ? NaN : Number(el.value)]));
  const hint = $('#calcHint');
  if (Object.values(v).some(Number.isNaN)) { hint.textContent = 'Enter all three values to see results.'; return; }
  if (v.area <= 0 || v.usage < 0 || v.rate < 0) { hint.textContent = 'Area must be above zero, and consumption and rate cannot be negative.'; return; }
  hint.textContent = 'Results shown below and applied to the dashboard.';
  const bill = v.usage * v.rate, eui = v.usage / v.area;
  setText('rBill', php(bill)); setText('rEUI', eui.toFixed(2) + ' kWh/m²/month');
  setText('rYear', kwh(v.usage * 12)); setText('rYearCost', php(bill * 12));
  setText('rDay', kwh(v.usage / 30)); setText('rSqm', php(bill / v.area));
  Object.assign(state, v); renderOverview(); renderForecast(); renderSavings(); renderCampus();
  if (window.bimRefresh) window.bimRefresh();
}
Object.values(inputs).forEach(el => el.addEventListener('input', calculate));
$('#cut').addEventListener('input', renderSavings);
function loadSample(msg) {
  Object.entries(DEMO).forEach(([k, v]) => inputs[k].value = v);
  calculate(); toast(msg);
}
$('#useSample').addEventListener('click', () => loadSample('Sample values loaded'));
$('#loadDemo').addEventListener('click', () => loadSample('Sample monitoring data loaded'));

// ---------- report export ----------
$('#exportCsv').addEventListener('click', () => {
  const rows = [['Zone', 'Share', 'kWh'], ...ZONES.map(([n, p]) => [n, (p * 100) + '%', Math.round(state.usage * p)]),
    ['Total', '100%', state.usage], ['Estimated cost (PHP)', '', state.usage * state.rate], ['EUI (kWh/m2/month)', '', (state.usage / state.area).toFixed(2)]];
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' })),
    download: 'schoolwatt-monthly-report.csv'
  });
  a.click(); URL.revokeObjectURL(a.href); toast('Report exported as CSV');
});
$('#printBtn').addEventListener('click', () => window.print());

// ---------- dashboard tabs ----------
const draw = { overview: renderOverview, campus: renderCampus, forecast: renderForecast };
$$('.tab').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab').forEach(t => t.setAttribute('aria-selected', t === tab));
  $$('.pane').forEach(p => p.hidden = p.id !== 'pane-' + tab.dataset.tab);
  draw[tab.dataset.tab]();
}));

// ---------- navigation ----------
const toggle = $('#navToggle'), links = $('#navLinks');
toggle.addEventListener('click', () => { const o = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); });
links.addEventListener('click', e => { if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', false); } });
const navAnchors = $$('.links a:not(.btn)');
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) navAnchors.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => io.observe(s));

// ---------- init ----------
renderOverview(); renderSavings();

// ---------- 3D BIM-style viewer (Three.js; simulated data, not a Revit model) ----------
(function () {
  const host = $('#bimCanvas'), info = $('#bimInfo');
  if (!host) return;
  if (!window.THREE) { host.innerHTML = '<p class="bim-fail">The 3D viewer could not load Three.js. Check your internet connection and refresh the page.</p>'; return; }
  const T = THREE, COL = { ok: 0x2E9F5B, warn: 0xF08A1C, bad: 0xD63B2F }, HEX = { ok: '#2E9F5B', warn: '#F08A1C', bad: '#D63B2F' };
  const TYPES = { C: ['Classroom', 2.4], K: ['Computer Laboratory', 4.6], S: ['Science Laboratory', 4.2], A: ['Administration Office', 3.2], M: ['Common Area', 1.8] };
  // each string = front row then back row of rooms on one floor
  const BLD = {
    main: { name: 'Main Building', m: 1.0, cols: 4, fl: ['AAMCCCCM', 'CCCCCKKC', 'CCKKCCSS'] },
    eng: { name: 'Engineering Building', m: 1.25, cols: 3, fl: ['KKMSSM', 'KKCSSC', 'KCCSSC', 'SSAKCC'] },
    admin: { name: 'Administration Building', m: 0.95, cols: 3, fl: ['AAMAAM', 'AAAAMA', 'AAAAAM'] },
    lib: { name: 'Library', m: 0.85, cols: 3, fl: ['MMMMKA', 'MMMKKA'] }
  };
  const RW = 9, RD = 8, CD = 3, FH = 3.6, SL = 0.35, KEYS = Object.keys(BLD);
  const rnd = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // scene
  const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
  host.appendChild(renderer.domElement);
  const scene = new T.Scene(), camera = new T.PerspectiveCamera(38, 1, 0.5, 600);
  scene.add(new T.HemisphereLight(0xffffff, 0x8fa196, 0.9));
  const sun = new T.DirectionalLight(0xffffff, 0.75); sun.position.set(40, 70, 35); sun.castShadow = true;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, far: 200 }); sun.shadow.mapSize.set(1024, 1024);
  scene.add(sun);
  const ground = new T.Mesh(new T.PlaneGeometry(400, 400), new T.MeshStandardMaterial({ color: 0xE6ECE8 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02; ground.receiveShadow = true; scene.add(ground);
  const grid = new T.GridHelper(120, 40, 0xB9C6BE, 0xD3DDD7); grid.position.y = 0; scene.add(grid);
  let group = new T.Group(); scene.add(group);

  let cur = { th: .75, ph: 1, r: 70, tx: 0, ty: 5, tz: 0 }, goal = { ...cur }, B, W, D, H, rooms = [], slabs = [], pick = [];
  let sel = { f: null, room: null }, hover = null, bKey = 'main';
  const place = () => {
    camera.position.set(cur.tx + cur.r * Math.sin(cur.ph) * Math.sin(cur.th), cur.ty + cur.r * Math.cos(cur.ph), cur.tz + cur.r * Math.sin(cur.ph) * Math.cos(cur.th));
    camera.lookAt(cur.tx, cur.ty, cur.tz);
  };
  const fitR = () => (Math.max(W * 1.5, D * 2.2, H * 3) + 12) * (camera.aspect < 1 ? 1.5 : 1);
  const VIEWS = { iso: { th: .75, ph: 1 }, front: { th: 0, ph: 1.45 }, side: { th: 1.57, ph: 1.4 }, top: { th: 0, ph: .12 } };
  function setView(v) { Object.assign(goal, VIEWS[v], { r: fitR() }); }

  // building generation
  function build(key) {
    bKey = key; B = BLD[key]; sel = { f: null, room: null }; hover = null;
    group.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });
    scene.remove(group); group = new T.Group(); scene.add(group); rooms = []; slabs = []; pick = [];
    W = B.cols * RW; D = 2 * RD + CD; H = B.fl.length * FH;
    const bi = KEYS.indexOf(key);
    B.fl.forEach((pat, f) => {
      const slab = new T.Mesh(new T.BoxGeometry(W + 1, SL, D + 1), new T.MeshStandardMaterial({ color: 0xCDD5D0, transparent: true }));
      slab.position.y = f * FH + SL / 2; slab.castShadow = slab.receiveShadow = true; slab.userData = { floor: f };
      group.add(slab); slabs.push(slab); pick.push(slab);
      const cor = new T.Mesh(new T.BoxGeometry(W, 0.05, CD), new T.MeshStandardMaterial({ color: 0xF1F4F2 }));
      cor.position.y = f * FH + SL + 0.03; cor.raycast = () => {}; group.add(cor);
      const glass = new T.Mesh(new T.BoxGeometry(W + 0.4, FH - SL, D + 0.4), new T.MeshStandardMaterial({ color: 0x9FC4D8, transparent: true, opacity: 0.07, depthWrite: false }));
      glass.position.y = f * FH + SL + (FH - SL) / 2; glass.raycast = () => {}; group.add(glass);
      for (let i = 0; i < pat.length; i++) {
        const row = Math.floor(i / B.cols), col = i % B.cols, t = TYPES[pat[i]];
        const raw = t[1] * B.m * (0.85 + 0.3 * rnd(bi * 100 + f * 20 + i)), area = RW * RD, eui = raw, use = area * raw, lv = level(eui).c;
        const hgt = FH - SL - 0.4, geo = new T.BoxGeometry(RW - 0.3, hgt, RD - 0.3);
        const m = new T.Mesh(geo, new T.MeshStandardMaterial({ color: COL[lv], transparent: true, opacity: 0.93, roughness: .6, emissive: COL[lv], emissiveIntensity: 0 }));
        m.position.set(-W / 2 + RW * (col + 0.5), f * FH + SL + hgt / 2 + 0.05, (row ? 1 : -1) * (CD / 2 + RD / 2));
        const edge = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0x1B2A24, transparent: true, opacity: 0.45 }));
        m.add(edge); m.castShadow = true;
        const r = { m, edge, f, name: `${t[0]} ${f + 1}-${String(i + 1).padStart(2, '0')}`, type: t[0], raw, area, eui, use, lv };
        m.userData = { room: r }; rooms.push(r); pick.push(m); group.add(m);
      }
    });
    const roof = new T.Mesh(new T.BoxGeometry(W + 1.2, 0.4, D + 1.2), new T.MeshStandardMaterial({ color: 0x7E8A84, transparent: true, opacity: 0.3 }));
    roof.position.y = H + 0.2; roof.raycast = () => {}; group.add(roof);
    group.position.set(0, 0, 0);
    $('#bimFloors').innerHTML = ['All floors', ...B.fl.map((_, i) => 'Floor ' + (i + 1))].map((t, i) => `<button class="chip sm" data-f="${i - 1}" aria-pressed="${i === 0}">${t}</button>`).join('');
    Object.assign(cur, { tx: 0, ty: H / 2, tz: 0 }); Object.assign(goal, { tx: 0, ty: H / 2, tz: 0 }); setView('iso');
    $$('#bimBuildings .chip').forEach(c => c.setAttribute('aria-pressed', c.dataset.b === key));
    compute(); focus(); render();
  }

  // scale simulated room data so each building matches the Campus tab (Main Building follows the calculator once you enter your own values)
  let custom = false;
  const target = () => {
    const t = BUILDINGS[KEYS.indexOf(bKey)];
    custom = bKey === 'main' && (state.usage !== DEMO.usage || state.area !== DEMO.area);
    return custom ? { area: state.area, use: state.usage } : { area: t.area, use: t.use };
  };
  const src = () => custom ? 'Main Building values are scaled to your calculator inputs.' : 'Values are scaled to the Campus tab data.';
  function compute() {
    const t = target(), sum = rooms.reduce((a, r) => a + RW * RD * r.raw, 0), k = t.use / sum, ak = t.area / (rooms.length * RW * RD);
    rooms.forEach(r => {
      r.area = RW * RD * ak; r.use = RW * RD * r.raw * k; r.eui = r.use / r.area; r.lv = level(r.eui).c;
      r.m.material.color.setHex(COL[r.lv]); r.m.material.emissive.setHex(COL[r.lv]);
    });
  }

  // selection, highlight and info panel
  function focus() {
    rooms.forEach(r => {
      const on = sel.f === null || sel.f === r.f;
      r.m.material.opacity = on ? 0.93 : 0.08; r.edge.material.opacity = on ? 0.45 : 0.05;
      r.m.material.emissiveIntensity = r === sel.room ? 0.65 : r === hover ? 0.3 : 0;
    });
    slabs.forEach((s, i) => { s.material.opacity = sel.f === null || sel.f === i ? 1 : 0.15; s.material.emissive.set(sel.f === i ? 0xF5B301 : 0x000000); s.material.emissiveIntensity = sel.f === i ? 0.35 : 0; });
    goal.ty = sel.f === null ? H / 2 : sel.f * FH + FH / 2;
    $$('#bimFloors .chip').forEach(c => c.setAttribute('aria-pressed', Number(c.dataset.f) === (sel.f === null ? -1 : sel.f)));
  }
  const zoneBars = list => { const tot = list.reduce((s, r) => s + r.use, 0), by = {};
    list.forEach(r => by[r.type] = (by[r.type] || 0) + r.use);
    return Object.entries(by).sort((a, b) => b[1] - a[1]).map(([n, v]) => `<div class="zr"><div class="zl"><span>${n}</span><b>${kwh(v)}</b></div><div class="bar"><i style="--c:#1F7A52" data-w="${v / tot * 100}"></i></div></div>`).join(''); };
  const legend = '<div class="lg"><span><i style="background:#2E9F5B"></i>Normal (&lt; 3)</span><span><i style="background:#F08A1C"></i>High (3–5)</span><span><i style="background:#D63B2F"></i>Very high (&gt; 5)</span></div>';
  function render() {
    const rate = state.rate;
    if (sel.room) {
      const r = sel.room, adv = r.eui < 3 ? 'Operating within normal range. Keep monitoring.' : r.eui <= 5 ? 'Check schedules, air-conditioning setpoints and equipment hours.' : 'Prioritize for inspection: review equipment condition and operating hours.';
      info.innerHTML = `<h3>${r.name}</h3><p class="sub2">${B.name} · Floor ${r.f + 1}</p>${pill(r.eui)}
        <dl><dt>Energy zone</dt><dd>${r.type}</dd><dt>Floor</dt><dd>${r.f + 1} of ${B.fl.length}</dd><dt>Area</dt><dd>${r.area.toFixed(0)} m²</dd>
        <dt>Simulated consumption</dt><dd>${kwh(r.use)}/month</dd><dt>Estimated cost</dt><dd>${php(Math.round(r.use) * rate)}</dd><dt>EUI</dt><dd>${r.eui.toFixed(2)} kWh/m²</dd></dl>
        <p class="adv">${adv}</p><p class="hint">Cost uses ₱${rate}/kWh from the calculator. ${src()}</p>${legend}`;
    } else {
      const list = sel.f === null ? rooms : rooms.filter(r => r.f === sel.f), use = list.reduce((s, r) => s + r.use, 0), area = list.reduce((a, r) => a + r.area, 0), eui = use / area;
      const cnt = c => list.filter(r => r.lv === c).length;
      info.innerHTML = `<h3>${sel.f === null ? B.name : 'Floor ' + (sel.f + 1)}</h3><p class="sub2">${sel.f === null ? B.fl.length + ' floors · ' + rooms.length + ' monitored zones' : B.name + ' · ' + list.length + ' zones'}</p>${pill(eui)}
        <dl><dt>Simulated consumption</dt><dd>${kwh(use)}/month</dd><dt>Estimated cost</dt><dd>${php(Math.round(use) * rate)}</dd><dt>EUI</dt><dd>${eui.toFixed(2)} kWh/m²</dd>
        <dt>Normal / High / Very high</dt><dd>${cnt('ok')} / ${cnt('warn')} / ${cnt('bad')}</dd></dl>
        <h3 style="font-size:.95rem;margin:16px 0 10px">Energy by zone type</h3><div id="bimZ">${zoneBars(list)}</div>
        <p class="hint">Click a room to see its details. ${src()}</p>${legend}`;
      grow($('#bimZ'));
    }
  }

  // input: rotate, zoom, pinch, pick
  const el = renderer.domElement, ptr = new Map(), ray = new T.Raycaster(), v2 = new T.Vector2();
  let moved = 0, pinch = 0;
  function hit(e) {
    const b = el.getBoundingClientRect(); v2.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1);
    ray.setFromCamera(v2, camera); const h = ray.intersectObjects(pick, false)[0]; return h ? h.object.userData : null;
  }
  el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptr.set(e.pointerId, e); moved = 0; pinch = 0; });
  el.addEventListener('pointermove', e => {
    if (!ptr.has(e.pointerId)) { if (e.pointerType === 'mouse') { const u = hit(e), h = u && u.room || null; if (h !== hover) { hover = h; el.style.cursor = u ? 'pointer' : ''; focus(); } } return; }
    const p = ptr.get(e.pointerId); ptr.set(e.pointerId, e);
    if (ptr.size === 1) { moved += Math.abs(e.clientX - p.clientX) + Math.abs(e.clientY - p.clientY); goal.th -= (e.clientX - p.clientX) * 0.008; goal.ph = clamp(goal.ph - (e.clientY - p.clientY) * 0.006, 0.1, 1.52); }
    else if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); if (pinch) goal.r = clamp(goal.r * pinch / d, fitR() * 0.4, fitR() * 2); pinch = d; moved = 99; }
  });
  const up = e => {
    const was = ptr.size === 1 && moved < 6; ptr.delete(e.pointerId); pinch = 0;
    if (!was || e.type === 'pointercancel') return;
    const u = hit(e);
    if (u && u.room) { sel = { f: u.room.f, room: u.room }; } else if (u && u.floor !== undefined) { sel = { f: sel.f === u.floor && !sel.room ? null : u.floor, room: null }; } else sel = { f: null, room: null };
    focus(); render();
  };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  el.addEventListener('wheel', e => { e.preventDefault(); goal.r = clamp(goal.r * (1 + e.deltaY * 0.001), fitR() * 0.4, fitR() * 2); }, { passive: false });

  // controls
  $('#bimBuildings').addEventListener('click', e => { const b = e.target.closest('[data-b]'); if (b) build(b.dataset.b); });
  $('#bimFloors').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; const f = Number(b.dataset.f); sel = { f: f < 0 ? null : f, room: null }; focus(); render(); });
  $('#bimViews').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; if (b.dataset.v === 'reset') { sel = { f: null, room: null }; focus(); render(); setView('iso'); } else setView(b.dataset.v); });

  // sizing and loop
  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();
  let vis = true; new IntersectionObserver(es => vis = es[0].isIntersecting).observe(host);
  (function loop() {
    requestAnimationFrame(loop); if (!vis) return;
    for (const k in cur) cur[k] += (goal[k] - cur[k]) * 0.12;
    place(); renderer.render(scene, camera);
  })();
  window.bimRefresh = () => { compute(); focus(); render(); };
  build('main');
})();