// VICE LEDGER — bootstrap, state, progress, export/import, deep links.
// Loads app/data/trophies.json, keeps earned progress in localStorage, and
// renders the list, detail and roadmap modules. No network at runtime: the
// only fetch is the app's own trophies.json file.
import { renderTrophyList, FILTERS } from './list.js';
import { renderDetail } from './detail.js';
import { renderRoadmap } from './roadmap.js';

const STORAGE_KEY = 'vice-ledger-v1';
const TOTAL = 55;

const state = {
  trophies: [],
  earned: new Set(),
  revealed: new Set(),
  filter: 'all',
  search: '',
  onlyUnearned: false,
  spoiler: true,
  selectedId: 28,
};

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) {
      for (const id of data.earned) {
        if (Number.isInteger(id) && id >= 1 && id <= TOTAL) state.earned.add(id);
      }
    }
    if (data.spoiler === false) state.spoiler = false;
  } catch {
    // A corrupt save is ignored; the checklist starts empty.
  }
}

function saveStored() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: [...state.earned].sort((a, b) => a - b),
      spoiler: state.spoiler,
    }));
  } catch {
    // Private mode or a full store: progress still works for this visit.
  }
}

function applyDeepLinks() {
  const params = new URLSearchParams(window.location.search);
  const earnedParam = params.get('earned');
  if (earnedParam) {
    for (const part of earnedParam.split(',')) {
      const id = Number(part.trim());
      if (Number.isInteger(id) && id >= 1 && id <= TOTAL) state.earned.add(id);
    }
  }
  const filter = params.get('filter');
  if (filter && FILTERS.some((f) => f.key === filter)) state.filter = filter;
  const select = Number(params.get('select'));
  if (Number.isInteger(select) && select >= 1 && select <= TOTAL) state.selectedId = select;
  const reveal = Number(params.get('reveal'));
  if (Number.isInteger(reveal) && reveal >= 1 && reveal <= TOTAL) {
    state.revealed.add(reveal);
    state.selectedId = reveal;
  }
  const search = params.get('search');
  if (search) state.search = search;
  if (params.get('unearned') === '1') state.onlyUnearned = true;
  saveStored();
}

function trophyById(id) {
  return state.trophies.find((t) => t.id === id) || null;
}

function isHiddenFromSpoiler(trophy) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id) && !state.revealed.has(trophy.id);
}

function updateProgress() {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const id of state.earned) {
    const t = trophyById(id);
    if (t && counts[t.grade] !== undefined) counts[t.grade] += 1;
  }
  document.getElementById('earned-count').textContent = String(state.earned.size);
  document.getElementById('grade-platinum').textContent = `${counts.platinum}/1`;
  document.getElementById('grade-gold').textContent = `${counts.gold}/2`;
  document.getElementById('grade-silver').textContent = `${counts.silver}/6`;
  document.getElementById('grade-bronze').textContent = `${counts.bronze}/46`;
  document.getElementById('seg-bronze').style.width = `${(counts.bronze / TOTAL) * 100}%`;
  document.getElementById('seg-silver').style.width = `${(counts.silver / TOTAL) * 100}%`;
  document.getElementById('seg-gold').style.width = `${(counts.gold / TOTAL) * 100}%`;
  document.getElementById('seg-platinum').style.width = `${(counts.platinum / TOTAL) * 100}%`;
}

function renderAll() {
  renderTrophyList(state, {
    onToggle: (id) => {
      if (state.earned.has(id)) state.earned.delete(id);
      else state.earned.add(id);
      saveStored();
      renderAll();
    },
    onSelect: (id) => {
      state.selectedId = id;
      renderAll();
    },
    onReveal: (id) => {
      state.revealed.add(id);
      state.selectedId = id;
      renderAll();
    },
  });
  renderDetail(state, trophyById(state.selectedId), {
    isHidden: isHiddenFromSpoiler,
    onToggle: (id) => {
      if (state.earned.has(id)) state.earned.delete(id);
      else state.earned.add(id);
      saveStored();
      renderAll();
    },
    onReveal: (id) => {
      state.revealed.add(id);
      renderAll();
    },
  });
  updateProgress();
}

function exportProgress() {
  const payload = {
    app: 'VICE LEDGER',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vice-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let data;
    try {
      data = JSON.parse(String(reader.result));
    } catch {
      window.alert('That file is not valid JSON.');
      return;
    }
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) {
      window.alert('That file has no earned list in it.');
      return;
    }
    const valid = ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= TOTAL);
    if (!window.confirm(`Import ${valid.length} earned trophies and replace your current progress?`)) return;
    state.earned = new Set(valid);
    saveStored();
    renderAll();
  };
  reader.readAsText(file);
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  state.trophies = data.trophies;
  loadStored();
  applyDeepLinks();

  // Toolbar wiring.
  const searchInput = document.getElementById('search');
  searchInput.value = state.search;
  searchInput.addEventListener('input', () => {
    state.search = searchInput.value;
    renderAll();
  });
  const onlyUnearned = document.getElementById('only-unearned');
  onlyUnearned.checked = state.onlyUnearned;
  onlyUnearned.addEventListener('change', () => {
    state.onlyUnearned = onlyUnearned.checked;
    renderAll();
  });
  const spoilerMode = document.getElementById('spoiler-mode');
  spoilerMode.checked = state.spoiler;
  spoilerMode.addEventListener('change', () => {
    state.spoiler = spoilerMode.checked;
    saveStored();
    renderAll();
  });
  document.getElementById('export-btn').addEventListener('click', exportProgress);
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', () => {
    if (importFile.files && importFile.files[0]) importProgress(importFile.files[0]);
    importFile.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!window.confirm('Clear all earned trophies?')) return;
    state.earned.clear();
    saveStored();
    renderAll();
  });
  document.querySelectorAll('[data-select]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedId = Number(button.dataset.select);
      state.revealed.add(state.selectedId);
      renderAll();
      document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });

  // Keyboard navigation: ArrowUp/ArrowDown move the selection through the
  // trophies currently visible in the list (after filters and search).
  // Typing in the search box or another field is left alone.
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const target = event.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
    const rows = [...document.querySelectorAll('.trophy-row')];
    if (rows.length === 0) return;
    const ids = rows.map((row) => Number(row.dataset.id));
    let index = ids.indexOf(state.selectedId);
    if (index === -1) index = 0;
    else if (event.key === 'ArrowDown') index = Math.min(ids.length - 1, index + 1);
    else index = Math.max(0, index - 1);
    event.preventDefault();
    state.selectedId = ids[index];
    renderAll();
    const selectedRow = document.querySelector(`.trophy-row[data-id="${state.selectedId}"]`);
    if (selectedRow) selectedRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  renderRoadmap();
  renderAll();
}

boot();
