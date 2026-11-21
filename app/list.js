// VICE LEDGER — trophy list: filters, search, spoiler blur, checkboxes.
// One module, one job: turn the state and the trophy data into list rows.
export const FILTERS = [
  { key: 'all', label: 'All 55' },
  { key: 'story', label: 'Story' },
  { key: 'missable', label: 'Missable' },
  { key: 'collectibles', label: 'Collectibles' },
  { key: 'activities', label: 'Activities' },
  { key: 'strangers', label: 'Strangers & Freaks' },
  { key: 'unconfirmed', label: 'Method unconfirmed' },
];

// The five trophies whose unlock method no guide has confirmed yet.
export const UNCONFIRMED_IDS = new Set([44, 45, 49, 50, 51]);

function matchesFilter(trophy, filter) {
  if (filter === 'all') return true;
  if (filter === 'missable') return trophy.missable === 'possible';
  if (filter === 'unconfirmed') return UNCONFIRMED_IDS.has(trophy.id);
  return trophy.kind === filter;
}

function gradeBadge(grade) {
  const label = grade.charAt(0).toUpperCase() + grade.slice(1);
  return `<span class="badge badge-${grade}">${label}</span>`;
}

function tagList(trophy) {
  const tags = [];
  tags.push(`<span class="tag">${trophy.kind}</span>`);
  if (trophy.hidden) tags.push('<span class="tag tag-hidden">Hidden</span>');
  if (trophy.missable === 'possible') tags.push('<span class="tag tag-missable">Possibly missable</span>');
  if (UNCONFIRMED_IDS.has(trophy.id)) tags.push('<span class="tag tag-unconfirmed">Method unconfirmed</span>');
  return tags.join('');
}

function isSpoilerHidden(state, trophy) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id) && !state.revealed.has(trophy.id);
}

export function renderTrophyList(state, handlers) {
  const chips = document.getElementById('filter-chips');
  chips.innerHTML = FILTERS.map((f) => (
    `<button type="button" class="chip" data-filter="${f.key}" aria-pressed="${state.filter === f.key}">${f.label}</button>`
  )).join('');
  chips.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      renderTrophyList(state, handlers);
    });
  });

  const needle = state.search.trim().toLowerCase();
  const shown = state.trophies.filter((trophy) => {
    if (!matchesFilter(trophy, state.filter)) return false;
    if (state.onlyUnearned && state.earned.has(trophy.id)) return false;
    if (needle && !trophy.name.toLowerCase().includes(needle)) return false;
    return true;
  });

  document.getElementById('list-count').textContent = `${shown.length} shown`;

  const list = document.getElementById('trophy-list');
  list.innerHTML = shown.map((trophy) => {
    const earned = state.earned.has(trophy.id);
    const hidden = isSpoilerHidden(state, trophy);
    const selected = state.selectedId === trophy.id;
    return `<li class="trophy-row${earned ? ' earned' : ''}${selected ? ' selected' : ''}${hidden ? ' spoiler-hidden' : ''}" data-id="${trophy.id}">
      <input type="checkbox" ${earned ? 'checked' : ''} aria-label="Mark ${trophy.name} as earned">
      <div class="trophy-main">
        <div class="trophy-name">${trophy.name}</div>
        <div class="trophy-desc">${trophy.description}</div>
        <div class="trophy-tags">${gradeBadge(trophy.grade)}${tagList(trophy)}</div>
        ${hidden ? '<button type="button" class="reveal-btn">Reveal</button>' : ''}
      </div>
    </li>`;
  }).join('');

  list.querySelectorAll('.trophy-row').forEach((row) => {
    const id = Number(row.dataset.id);
    row.addEventListener('click', (event) => {
      if (event.target.matches('input[type="checkbox"]')) return;
      if (event.target.matches('.reveal-btn')) {
        handlers.onReveal(id);
        return;
      }
      handlers.onSelect(id);
    });
    row.querySelector('input[type="checkbox"]').addEventListener('change', () => handlers.onToggle(id));
  });
}
