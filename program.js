// program.js - Programme de la soirée : timeline « Les courants » + plan des salles
// construites à partir des listes .program-venues / .program-events de index.html.

const NIGHT_START = 18 * 60;          // 18:00 = surface
const NIGHT_LENGTH = 10.5 * 60;       // jusqu'à 04:30
const GALA_DATE = '2026-11-21';       // soirée du gala (heure locale)
const METERS_PER_HOUR = 300;          // profondeur fictive affichée par la jauge

// Zones tirées du plan « Gala_Enac_2026_-_Plans_Manifestation » (repère 2000 × 780)
const VENUE_STYLE = {
  gym:   { color: '#9fc3e6', rect: [1645, 135, 280, 545], dot: [1785, 420] },
  bleue: { color: '#6fa8ff', rect: [395, 120, 340, 212], dot: [565, 245] },
  tdp:   { color: '#7fd6d0', rect: [735, 240, 210, 140], dot: [815, 310] },
  poly:  { color: '#c4d3e2', rect: [950, 540, 200, 95], dot: [1050, 568], labelY: 615 },
};
// Repères secondaires du plan
const LANDMARKS = [
  { x: 588, y: 152, icon: 'bar', label: 'Bar Gala 1' },
  { x: 490, y: 152, icon: 'bar', label: 'Bar prestataire' },
  { x: 652, y: 312, icon: 'bar', label: 'Bar Classgift' },
  { x: 709, y: 312, icon: 'bar', label: 'Bar Bureau Solidaire' },
  { x: 1680, y: 548, icon: 'bar', label: 'Bar Gala 2' },
  { x: 1884, y: 628, icon: 'bar', label: 'Bar Gala 3' },
  { x: 713, y: 160, icon: 'photo', label: 'Stand photo' },
  { x: 395, y: 572, icon: 'cash', label: 'Recharge cashless' },
  { x: 188, y: 452, icon: 'coat', label: 'Vestiaires' },
  { x: 530, y: 585, icon: 'hall', label: "Hall d'entrée" },
];
const ENTRANCES = [[78, 465], [490, 712], [562, 712]];
const FALLBACK_COLORS = ['#9fc3e6', '#6fa8ff', '#7fd6d0', '#c4d3e2'];

// --- outils --------------------------------------------------------------

// « HH:MM » -> minutes depuis 18:00 (les heures du matin passent au lendemain)
function toOffset(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const minutes = h * 60 + m + (h < 12 ? 24 * 60 : 0);
  return minutes - NIGHT_START;
}

function label(offset) {
  const total = (NIGHT_START + offset) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function frLabel(offset) {
  const [h, m] = label(offset).split(':');
  return `${Number(h)}h${m === '00' ? '' : m}`;
}

function isoFor(offset) {
  const base = new Date(`${GALA_DATE}T18:00:00`);
  const d = new Date(base.getTime() + offset * 60000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${label(offset)}`;
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'style') node.style.cssText = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => {
    if (c === null || c === undefined || c === false) return;
    node.append(c instanceof Node ? c : document.createTextNode(c));
  });
  return node;
}

const svg = (tag, attrs = {}) => {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
};

// --- lecture des données -------------------------------------------------

function readData(section) {
  const venues = Array.from(section.querySelectorAll('.program-venues [data-venue]')).map((li, i) => ({
    id: li.dataset.venue,
    name: li.textContent.trim(),
    ...(VENUE_STYLE[li.dataset.venue] ?? { color: FALLBACK_COLORS[i % 4], rect: [100 + i * 200, 700, 150, 60], dot: [175 + i * 200, 730] }),
  }));
  const events = Array.from(section.querySelectorAll('.program-events [data-start]')).map((li) => {
    const start = toOffset(li.dataset.start);
    const end = li.dataset.end ? toOffset(li.dataset.end) : null;
    return {
      venue: li.dataset.venue,
      start,
      end,
      title: li.querySelector('strong')?.textContent.trim() ?? li.textContent.trim(),
      desc: li.querySelector('span')?.textContent.trim() ?? '',
      cabaret: li.dataset.tag === 'cabaret',
    };
  }).sort((a, b) => a.start - b.start);
  return { venues, events };
}

const venueName = (venues, id) => venues.find((v) => v.id === id)?.name ?? '';

// --- vue 1 : les courants (timetable horizontale façon festival) --------

function buildDive(root, { venues, events }) {
  const cut = events.find((e) => e.venue === 'all' && e.end !== null);          // feu d'artifice
  const finale = events.filter((e) => e.venue === 'all' && e.end === null).pop();
  const hours = Array.from({ length: Math.floor(NIGHT_LENGTH / 60) + 1 }, (_, i) => i * 60);

  const detail = el('div', { class: 'tt-detail', 'aria-live': 'polite' },
    el('p', { class: 'tt-detail-hint' }, 'Touchez un créneau pour en savoir plus.'));

  const showDetail = (e, pill) => {
    const v = venues.find((x) => x.id === e.venue);
    root.querySelectorAll('.tt-pill.is-active').forEach((p) => p.classList.remove('is-active'));
    pill?.classList.add('is-active');
    detail.style.setProperty('--c', v?.color ?? 'var(--fireworks)');
    detail.replaceChildren(
      el('span', { class: 'tt-detail-meta' },
        `${frLabel(e.start)}${e.end !== null ? ` – ${frLabel(e.end)}` : ''}${v ? ` · ${v.name}` : ''}`),
      el('h3', {}, e.title),
      e.cabaret ? el('span', { class: 'dive-badge' }, 'Places cabaret') : null,
      e.desc ? el('p', {}, e.desc) : null);
  };

  const hourRow = el('div', { class: 'tt-hours', 'aria-hidden': 'true' },
    ...hours.map((h) => el('span', { style: `--t:${h}` }, frLabel(h))),
    finale && finale.start % 60 ? el('span', { style: `--t:${finale.start}` }, frLabel(finale.start)) : null);

  const rows = venues.map((v) => {
    const track = el('div', { class: 'tt-track' });
    events.filter((e) => e.venue === v.id && e.end !== null).forEach((e) => {
      const pill = el('button', {
        type: 'button',
        class: `tt-pill${e.cabaret ? ' is-cabaret' : ''}${e.end - e.start <= 60 ? ' is-short' : ''}`,
        style: `--t:${e.start};--d:${e.end - e.start}`,
        'aria-label': `${e.title}, ${v.name}, de ${frLabel(e.start)} à ${frLabel(e.end)}`,
      },
      el('span', { class: 'tt-pill-title' }, e.title),
      el('span', { class: 'tt-pill-time' }, `${frLabel(e.start)} – ${frLabel(e.end)}`));
      pill.addEventListener('click', () => showDetail(e, pill));
      track.append(pill);
    });
    return el('div', { class: 'tt-row', style: `--c:${v.color}` },
      el('div', { class: 'tt-name' }, el('span', {}, v.name)), track);
  });

  const overlays = [];
  if (cut) {
    const band = el('button', { type: 'button', class: 'tt-cut', style: `--t:${cut.start};--d:${cut.end - cut.start}`, 'aria-label': `${cut.title}, de ${frLabel(cut.start)} à ${frLabel(cut.end)}` },
      el('span', {}, `✦ ${cut.title}`));
    band.addEventListener('click', () => showDetail({ ...cut, desc: `${cut.desc} Toutes les salles ferment le temps du spectacle.` }, null));
    overlays.push(band);
  }
  if (finale) {
    const end = el('button', { type: 'button', class: 'tt-end', style: `--t:${finale.start}`, 'aria-label': `${frLabel(finale.start)} : ${finale.title}` });
    end.addEventListener('click', () => showDetail(finale, null));
    overlays.push(end);
  }
  const now = el('div', { class: 'tt-now', hidden: true }, el('span', {}, 'Maintenant'));
  overlays.push(now);

  // petits poissons qui traversent la timeline (décor)
  const school = el('div', { class: 'tt-fish', 'aria-hidden': 'true' },
    ...[[0.16, 46, -4, 1, 26], [0.42, 62, -30, -1, 20], [0.63, 54, -12, 1, 30], [0.86, 70, -48, -1, 18], [0.3, 80, -60, 1, 16]]
      .map(([y, dur, delay, dir, size]) => el('span', { class: dir < 0 ? 'is-left' : '', style: `--y:${y};--dur:${dur}s;--delay:${delay}s;--s:${size}px` })));
  const inner = el('div', { class: 'tt-inner' }, school, hourRow, ...rows, el('div', { class: 'tt-overlay' }, ...overlays));
  const scroller = el('div', { class: 'tt-scroll', tabindex: 0, 'aria-label': 'Programme par salle et par heure' }, inner);
  const swipe = el('p', { class: 'tt-swipe', 'aria-hidden': 'true' }, '← Faites glisser la timeline →');
  root.append(el('div', { class: 'tt', style: `--span:${NIGHT_LENGTH}` }, scroller),
    swipe,
    detail);

  // échelle : remplit la largeur dispo sur grand écran, défile sur mobile
  const fit = () => {
    const names = parseFloat(getComputedStyle(inner).getPropertyValue('--names')) || 150;
    const avail = scroller.clientWidth - names - 24;
    const min = window.innerWidth < 760 ? 1.2 : 1.85   // ≈ 150 px par heure sur ordinateur, 180 px sur mobile
    inner.style.setProperty('--ppm', `${Math.max(min, avail / NIGHT_LENGTH)}px`);
    swipe.hidden = scroller.scrollWidth <= scroller.clientWidth + 2;
  };

  // glisser à la souris sur ordinateur
  let drag = null;
  scroller.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
    drag = { x: e.clientX, left: scroller.scrollLeft };
    scroller.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => { if (drag) scroller.scrollLeft = drag.left - (e.clientX - drag.x); });
  window.addEventListener('pointerup', () => { drag = null; scroller.classList.remove('is-dragging'); });
  fit();
  window.addEventListener('resize', fit);

  // ligne « maintenant » le soir du gala
  const tickNow = () => {
    const o = (Date.now() - new Date(`${GALA_DATE}T18:00:00`).getTime()) / 60000;
    now.hidden = !(o >= 0 && o <= NIGHT_LENGTH);
    if (!now.hidden) now.style.setProperty('--t', o);
  };
  tickNow();
  setInterval(tickNow, 60000);

  return fit;
}

// --- plan des salles (discret, sous la timeline) -------------------------

function buildPlan(root, { venues }) {
  const map = svg('svg', { viewBox: '60 100 1900 680', class: 'plan-svg', role: 'img', 'aria-label': 'Plan des salles du Gala ENAC' });
  map.append(svg('path', { class: 'plan-building', d: 'M115 120 H945 V640 H1645 V135 H1925 V680 H115 Z' }));
  map.append(svg('path', { class: 'plan-public', d: 'M330 480 H640 V640 H1645 V680 H330 Z' }));
  [[325, 330, 155, 140], [580, 330, 155, 140]].forEach(([x, y, w, h]) => {
    map.append(svg('rect', { x, y, width: w, height: h, rx: 6, class: 'plan-patio' }));
  });
  const label = (txt, x, y, cls = 'plan-small') => {
    const t = svg('text', { x, y, class: cls }); t.textContent = txt; map.append(t);
  };
  venues.forEach((v) => {
    const [x, y, w, h] = v.rect;
    const g = svg('g', { class: 'plan-zone', style: `--c:${v.color}` });
    g.append(svg('rect', { x, y, width: w, height: h, rx: 10 }));
    map.append(g);
    // nom centré dans la salle, coupé en deux lignes s'il est trop long pour la case
    const words = v.name.split(' ');
    const lines = w < 260 && words.length > 1 ? [words[0], words.slice(1).join(' ')] : [v.name];
    const t = svg('text', { x: x + w / 2, y: y + h / 2 - (lines.length - 1) * 16 + 10, class: 'plan-name' });
    lines.forEach((ln, k) => {
      const ts = svg('tspan', { x: x + w / 2, dy: k ? 32 : 0 });
      ts.textContent = ln;
      t.append(ts);
    });
    map.append(t);
  });
  LANDMARKS.filter((m) => m.icon === 'bar').forEach((m) => {
    map.append(svg('circle', { cx: m.x, cy: m.y, r: 9, class: 'plan-bar' }));
  });
  ENTRANCES.forEach(([x, y]) => {
    const g = svg('g', { class: 'plan-entrance', transform: `translate(${x} ${y})` });
    g.append(svg('path', { d: 'M-16 0 H14 M2 -12 L14 0 L2 12' }));
    map.append(g);
  });
  label('Patios', 530, 410);
  label('Vestiaires', 188, 470);
  label("Hall d'entrée", 530, 600);
  label('Entrées', 526, 752);

  root.append(
    el('h3', { class: 'plan-title' }, el('i', { class: 'fa-solid fa-map-location-dot', 'aria-hidden': 'true' }), ' Plan des salles'),
    el('div', { class: 'plan-map' }, map),
    el('p', { class: 'plan-legend' }, el('span', { class: 'plan-key' }), ' Bars'));
}

// --- onglets -------------------------------------------------------------

export function initProgram() {
  const section = document.getElementById('program');
  if (!section) return;
  const data = readData(section);
  if (!data.events.length) return;

  const dive = section.querySelector('#program-dive');
  const plan = section.querySelector('#program-plan');
  buildDive(dive, data);
  if (plan) buildPlan(plan, data);

  section.querySelector('.program-data').hidden = true;
  dive.hidden = false;
  if (plan) plan.hidden = false;
}
