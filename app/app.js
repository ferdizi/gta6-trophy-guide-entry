'use strict';

/* VICE LEDGER — shared state and boot. The list, detail and roadmap panes
   live in their own files and hang their renderers off this object. */
const VL = {
  trophies: [],
  byId: new Map(),
  earned: new Set(),
  revealed: new Set(),
  filter: 'all',
  query: '',
  onlyUnearned: false,
  spoiler: true,
  selected: null,
};

const STORAGE_KEY = 'vice-ledger-earned-v1';
const GRADE_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  if (kind === 'strangers') return 'Strangers & Freaks';
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

function loadStoredProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const ids = JSON.parse(raw);
    if (Array.isArray(ids)) ids.forEach((id) => VL.earned.add(Number(id)));
  } catch (err) {
    /* A damaged save starts clean rather than breaking the guide. */
  }
}

function saveStoredProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...VL.earned].sort((a, b) => a - b)));
  } catch (err) {
    /* Private mode or a full store: progress just lives for this visit. */
  }
}

function applyDeepLinkParams() {
  const params = new URLSearchParams(location.search);
  const earned = params.get('earned');
  if (earned) {
    earned.split(',').map(Number).filter((id) => id >= 1 && id <= 55).forEach((id) => VL.earned.add(id));
    saveStoredProgress();
  }
  const select = Number(params.get('select'));
  if (select >= 1 && select <= 55) VL.selected = select;
  const filter = params.get('filter');
  if (filter) {
    VL.filter = filter;
    document.querySelectorAll('#filterChips .chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.filter === filter);
    });
  }
  if (params.get('unearned') === '1') {
    VL.onlyUnearned = true;
    document.getElementById('onlyUnearned').checked = true;
  }
  const reveal = params.get('reveal');
  if (reveal) {
    reveal.split(',').map(Number).filter((id) => id >= 1 && id <= 55).forEach((id) => VL.revealed.add(id));
  }
  if (params.get('view') === 'roadmap') document.body.classList.add('roadmap-view');
}

function refreshAll() {
  VL.renderProgress();
  VL.renderList();
  VL.renderDetail();
  VL.renderRail();
}

async function loadGuideData() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  VL.trophies = data.trophies;
  VL.trophies.forEach((trophy) => VL.byId.set(trophy.id, trophy));
  if (VL.selected === null) VL.selected = 28;
  refreshAll();
}

function exportProgressFile() {
  const payload = { app: 'vice-ledger', version: 1, earned: [...VL.earned].sort((a, b) => a - b) };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'vice-ledger-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

function importProgressFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no list');
      const valid = ids.map(Number).filter((id) => id >= 1 && id <= 55);
      if (!window.confirm('Import ' + valid.length + ' earned trophies? This replaces the progress saved here.')) return;
      VL.earned = new Set(valid);
      saveStoredProgress();
      refreshAll();
    } catch (err) {
      window.alert('That file is not a VICE LEDGER progress export.');
    }
  };
  reader.readAsText(file);
}

function wireToolbar() {
  document.getElementById('searchBox').addEventListener('input', (event) => {
    VL.query = event.target.value.trim().toLowerCase();
    VL.renderList();
  });
  document.querySelectorAll('#filterChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#filterChips .chip').forEach((other) => other.classList.remove('active'));
      chip.classList.add('active');
      VL.filter = chip.dataset.filter;
      VL.renderList();
    });
  });
  document.getElementById('onlyUnearned').addEventListener('change', (event) => {
    VL.onlyUnearned = event.target.checked;
    VL.renderList();
  });
  document.getElementById('spoilerToggle').addEventListener('change', (event) => {
    VL.spoiler = event.target.checked;
    VL.renderList();
    VL.renderDetail();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgressFile);
  document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
  document.getElementById('importFile').addEventListener('change', (event) => {
    if (event.target.files.length) importProgressFile(event.target.files[0]);
    event.target.value = '';
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Clear every earned check and every reveal?')) return;
    VL.earned.clear();
    VL.revealed.clear();
    saveStoredProgress();
    refreshAll();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadStoredProgress();
  applyDeepLinkParams();
  wireToolbar();
  loadGuideData();
});
