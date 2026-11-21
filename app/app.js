// VICE LEDGER — GTA VI trophy tracker. Vanilla JS, no libraries, no network at runtime.
// Progress lives in localStorage; export/import move it as JSON. URL params drive screenshots:
//   ?select=<id> ?filter=<all|story|missable|collectibles|activities|strangers|unconfirmed>
//   ?spoiler=off ?unearned=1 ?earned=<comma ids, display-only> ?focus=<roadmap|detail>

const KEY = 'vice-ledger-progress-v1';
const params = new URLSearchParams(location.search);

const els = {
  progressText: document.getElementById('progressText'),
  progressPct: document.getElementById('progressPct'),
  seg: {
    bronze: document.getElementById('segBronze'),
    silver: document.getElementById('segSilver'),
    gold: document.getElementById('segGold'),
    platinum: document.getElementById('segPlatinum'),
  },
  spoiler: document.getElementById('spoiler'),
  exportBtn: document.getElementById('exportBtn'),
  importFile: document.getElementById('importFile'),
  step1: document.getElementById('step1Progress'),
  step2: document.getElementById('step2Progress'),
  step3: document.getElementById('step3Progress'),
  ledger: document.getElementById('ledger'),
  tally: document.getElementById('tally'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('gradeFilter'),
  unearnedOnly: document.getElementById('unearnedOnly'),
  listCount: document.getElementById('listCount'),
  list: document.getElementById('trophyList'),
  detail: document.getElementById('detail'),
  missableJump: document.getElementById('missableJump'),
};

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

// Earned set: localStorage normally; a ?earned= list overrides it for display only (screenshots).
const preview = params.get('earned');
let earned = new Set();
if (preview) {
  earned = new Set(preview.split(',').map((s) => Number(s)).filter((n) => byId.has(n)));
} else {
  try {
    earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').filter((n) => byId.has(n)));
  } catch {
    earned = new Set();
  }
}

let filter = params.get('filter') ?? 'all';
let selectedId = Number(params.get('select') ?? 7);
if (!byId.has(selectedId)) selectedId = 7;
const revealed = new Set();

if (params.get('spoiler') === 'off') els.spoiler.checked = false;
if (params.get('unearned') === '1') els.unearnedOnly.checked = true;
if (params.get('focus') === 'roadmap') document.body.classList.add('focus-roadmap');
if (params.get('focus') === 'detail') document.body.classList.add('focus-detail');

function save() {
  if (preview) return; // display-only preview never writes
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isHidden(t) {
  return els.spoiler.checked && t.hidden && !earned.has(t.id) && !revealed.has(t.id);
}

function kindLabel(t) {
  return { story: 'Story', strangers: 'Strangers', collectibles: 'Collectibles', activities: 'Activities', joke: 'Joke', meta: 'Meta' }[t.kind] ?? t.kind;
}

function gradeBadge(t) {
  const b = document.createElement('span');
  b.className = 'grade-badge grade-' + t.grade;
  b.textContent = t.grade;
  return b;
}

function renderProgress() {
  const total = trophies.length;
  const counts = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  for (const t of trophies) if (earned.has(t.id)) counts[t.grade]++;
  const n = earned.size;
  els.progressText.textContent = `${n} of ${total} earned`;
  els.progressPct.textContent = `${Math.round((n / total) * 100)}%`;
  for (const g of ['bronze', 'silver', 'gold', 'platinum']) {
    els.seg[g].style.width = `${(counts[g] / total) * 100}%`;
  }

  const story = trophies.filter((t) => t.kind === 'story' && earned.has(t.id)).length;
  els.step1.textContent = `Story ${story} of 12 earned`;
  const checklist = trophies.filter((t) => (t.kind === 'activities' || t.kind === 'collectibles' || t.kind === 'meta') && earned.has(t.id)).length;
  els.step2.textContent = `Checklist trophies ${checklist} of 28 earned`;
  const strangers = trophies.filter((t) => t.kind === 'strangers' && earned.has(t.id)).length;
  els.step3.textContent = `Strangers ${strangers} of 7 earned`;

  const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  els.tally.replaceChildren();
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    const li = document.createElement('li');
    li.textContent = `${g[0].toUpperCase() + g.slice(1)} ${counts[g]}/${totals[g]}`;
    els.tally.append(li);
  }

  // 100% completion ledger: each row fills to its milestone when its trophy is earned.
  const rows = [
    { label: 'Challenges', trophy: 32, value: 50, total: 80, need: 'need 70 of 80' },
    { label: 'Card sets', trophy: 30, value: 3, total: 18, need: 'need 15 of 18' },
    { label: 'Meditations', trophy: 28, value: 18, total: 18, need: 'need 15 of 18' },
    { label: 'Stunts', trophy: 15, value: 250, total: 397, need: 'need 300 of 397' },
    { label: 'Vehicles', trophy: 35, value: 100, total: 277, need: 'need 200 of 277' },
    { label: 'Animals', trophy: 29, value: 0, total: 255, need: 'need 100 of 255', note: 'tracked in game' },
  ];
  els.ledger.replaceChildren();
  for (const r of rows) {
    const li = document.createElement('li');
    const done = earned.has(r.trophy);
    const current = done ? r.value : 0;
    const label = document.createElement('div');
    label.className = 'ledger-label';
    const name = document.createElement('span');
    name.textContent = r.label;
    const nums = document.createElement('span');
    nums.textContent = done ? `${current}/${r.total} · ${r.need}` : `0/${r.total} · ${r.need}`;
    if (done) nums.classList.add('ledger-done');
    label.append(name, nums);
    const bar = document.createElement('div');
    bar.className = 'ledger-bar';
    const fill = document.createElement('i');
    fill.style.width = `${(current / r.total) * 100}%`;
    bar.append(fill);
    li.append(label, bar);
    els.ledger.append(li);
  }
}

function passesFilters(t) {
  if (filter === 'story' && t.kind !== 'story') return false;
  if (filter === 'missable' && t.missable !== 'possible') return false;
  if (filter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (filter === 'activities' && t.kind !== 'activities') return false;
  if (filter === 'strangers' && t.kind !== 'strangers') return false;
  if (filter === 'unconfirmed' && !t.unconfirmed) return false;
  if (els.gradeFilter.value !== 'all' && t.grade !== els.gradeFilter.value) return false;
  if (els.unearnedOnly.checked && earned.has(t.id)) return false;
  const q = els.search.value.trim().toLowerCase();
  if (q && !t.name.toLowerCase().includes(q)) return false;
  return true;
}

function renderList() {
  const visible = trophies.filter(passesFilters);
  els.listCount.textContent = `Showing ${visible.length} of ${trophies.length} trophies`;
  els.list.replaceChildren();
  for (const t of visible) {
    const li = document.createElement('li');
    if (t.id === selectedId) li.classList.add('selected');
    if (earned.has(t.id)) li.classList.add('earned');
    if (isHidden(t)) li.classList.add('spoiler-hidden');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    box.addEventListener('click', (e) => e.stopPropagation());

    const main = document.createElement('div');
    main.className = 'trophy-main';
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = isHidden(t) ? 'Hidden trophy' : t.name;
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = kindLabel(t);
    name.append(kind);
    if (t.missable === 'possible') {
      const m = document.createElement('span');
      m.className = 'missable-tag';
      m.textContent = 'Missable?';
      name.append(m);
    }
    if (t.hidden && !earned.has(t.id)) {
      const h = document.createElement('span');
      h.className = 'hidden-tag';
      h.textContent = 'Hidden';
      name.append(h);
    }
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = isHidden(t) ? 'Sealed until earned — spoiler shield is on.' : t.description;
    main.append(name, desc);
    if (isHidden(t)) {
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal-btn';
      reveal.textContent = 'Reveal this one';
      reveal.addEventListener('click', (e) => {
        e.stopPropagation();
        revealed.add(t.id);
        renderAll();
      });
      main.append(reveal);
    }

    li.append(box, gradeBadge(t), main);
    li.addEventListener('click', () => {
      selectedId = t.id;
      renderAll();
    });
    els.list.append(li);
  }
}

function renderDetail() {
  const t = byId.get(selectedId);
  els.detail.replaceChildren();
  if (!t) {
    const p = document.createElement('p');
    p.className = 'detail-empty';
    p.textContent = 'Pick a trophy from the ledger to read its guide.';
    els.detail.append(p);
    return;
  }
  const card = document.createElement('div');
  card.className = 'detail-card';

  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.append(gradeBadge(t));
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = kindLabel(t);
  meta.append(kind);
  if (t.missable === 'possible') {
    const m = document.createElement('span');
    m.className = 'missable-tag';
    m.textContent = 'Possibly missable';
    meta.append(m);
  }
  if (t.unconfirmed) {
    const u = document.createElement('span');
    u.className = 'kind-tag';
    u.textContent = 'Method unconfirmed';
    meta.append(u);
  }
  card.append(meta);

  const title = document.createElement('h2');
  title.textContent = isHidden(t) ? 'Hidden trophy' : t.name;
  card.append(title);

  const desc = document.createElement('p');
  desc.className = 'official-desc';
  desc.textContent = isHidden(t) ? 'Official description sealed — earn it or reveal it to read it.' : `“${t.description}”`;
  card.append(desc);

  if (isHidden(t)) {
    const reveal = document.createElement('button');
    reveal.type = 'button';
    reveal.className = 'reveal-btn';
    reveal.textContent = 'Reveal this trophy';
    reveal.addEventListener('click', () => {
      revealed.add(t.id);
      renderAll();
    });
    card.append(reveal);
    const note = document.createElement('p');
    note.textContent = 'Spoiler shield is on: hidden trophies stay sealed until earned. The guide below stays sealed with it.';
    card.append(note);
  } else {
    const h = document.createElement('h3');
    h.textContent = 'How to earn it';
    card.append(h);
    if (t.unconfirmed) {
      const block = document.createElement('div');
      block.className = 'unconfirmed-block';
      block.textContent = t.guide;
      card.append(block);
    } else {
      const g = document.createElement('p');
      g.textContent = t.guide;
      card.append(g);
    }
    const cite = document.createElement('span');
    cite.className = 'cite-chip';
    cite.textContent = 'Source: ' + t.source;
    card.append(cite);
  }

  const earnedState = document.createElement('p');
  earnedState.style.marginTop = '12px';
  earnedState.style.fontFamily = 'Arial, sans-serif';
  earnedState.style.fontSize = '14px';
  earnedState.textContent = earned.has(t.id) ? '✓ Earned — ticked in your ledger.' : 'Not earned yet — tick the box in the ledger when you get it.';
  card.append(earnedState);

  els.detail.append(card);
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
}

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    filter = chip.dataset.filter;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
    renderAll();
  });
  if (chip.dataset.filter === filter) {
    document.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
  }
});
els.search.addEventListener('input', renderAll);
els.gradeFilter.addEventListener('change', renderAll);
els.unearnedOnly.addEventListener('change', renderAll);
els.spoiler.addEventListener('change', renderAll);

els.missableJump.addEventListener('click', () => {
  filter = 'missable';
  selectedId = 28;
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.filter === 'missable'));
  renderAll();
});

els.exportBtn.addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b).map((id) => byId.get(id).name),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'vice-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

els.importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  let data;
  try {
    data = JSON.parse(await file.text());
  } catch {
    alert('That file is not valid JSON.');
    e.target.value = '';
    return;
  }
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) {
    alert('Import needs a list of trophy names.');
    e.target.value = '';
    return;
  }
  const ids = [];
  for (const name of names) {
    const found = trophies.find((t) => t.name === name || t.id === name);
    if (found) ids.push(found.id);
  }
  if (!ids.length) {
    alert('No trophy names in that file matched the list.');
    e.target.value = '';
    return;
  }
  if (confirm(`Import ${ids.length} earned trophies, replacing your current progress?`)) {
    earned = new Set(ids);
    save();
    renderAll();
  }
  e.target.value = '';
});

renderAll();
window.__shotReady = true;
