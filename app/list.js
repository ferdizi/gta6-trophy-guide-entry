'use strict';

/* The middle pane: the trophy list, its filters, its search box, and the
   spoiler mask that hides hidden trophies until they are earned or revealed. */

VL.isUnconfirmed = function (trophy) {
  return trophy.guide.indexOf('Method unconfirmed') === 0;
};

VL.rowMatchesFilter = function (trophy) {
  if (VL.onlyUnearned && VL.earned.has(trophy.id)) return false;
  if (VL.filter === 'story' && trophy.kind !== 'story') return false;
  if (VL.filter === 'missable' && trophy.missable !== 'possible') return false;
  if (VL.filter === 'collectibles' && trophy.kind !== 'collectibles') return false;
  if (VL.filter === 'activities' && trophy.kind !== 'activities') return false;
  if (VL.filter === 'strangers' && trophy.kind !== 'strangers') return false;
  if (VL.filter === 'unconfirmed' && !VL.isUnconfirmed(trophy)) return false;
  if (VL.query) {
    const haystack = (trophy.name + ' ' + trophy.description).toLowerCase();
    if (haystack.indexOf(VL.query) === -1) return false;
  }
  return true;
};

VL.isMasked = function (trophy) {
  return VL.spoiler && trophy.hidden && !VL.earned.has(trophy.id) && !VL.revealed.has(trophy.id);
};

VL.makeBadge = function (grade) {
  const badge = document.createElement('span');
  badge.className = 'badge badge-' + grade;
  badge.textContent = gradeLabel(grade);
  return badge;
};

VL.renderList = function () {
  const list = document.getElementById('trophyList');
  list.innerHTML = '';
  const shown = VL.trophies.filter((trophy) => VL.rowMatchesFilter(trophy));
  document.getElementById('listCount').textContent = shown.length + ' shown';

  shown.forEach((trophy) => {
    const row = document.createElement('li');
    row.className = 'trophy-row';
    if (VL.earned.has(trophy.id)) row.classList.add('earned');
    if (VL.selected === trophy.id) row.classList.add('selected');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = VL.earned.has(trophy.id);
    box.setAttribute('aria-label', 'Mark ' + trophy.name + ' earned');
    box.addEventListener('change', () => {
      if (box.checked) VL.earned.add(trophy.id); else VL.earned.delete(trophy.id);
      saveStoredProgress();
      refreshAll();
    });
    row.appendChild(box);

    const body = document.createElement('div');
    body.className = 'row-body';
    const masked = VL.isMasked(trophy);

    const name = document.createElement('div');
    name.className = 'row-name' + (masked ? ' masked' : '');
    name.textContent = masked ? 'Hidden trophy' : trophy.name;
    body.appendChild(name);

    const desc = document.createElement('div');
    desc.className = 'row-desc' + (masked ? ' masked' : '');
    desc.textContent = masked ? 'Earn this trophy to reveal its name and description.' : trophy.description;
    body.appendChild(desc);

    const tags = document.createElement('div');
    tags.className = 'row-tags';
    tags.appendChild(VL.makeBadge(trophy.grade));
    const kind = document.createElement('span');
    kind.className = 'kind-tag';
    kind.textContent = kindLabel(trophy.kind);
    tags.appendChild(kind);
    if (trophy.hidden) {
      const hiddenTag = document.createElement('span');
      hiddenTag.className = 'hidden-tag';
      hiddenTag.textContent = 'Hidden';
      tags.appendChild(hiddenTag);
    }
    if (trophy.missable === 'possible') {
      const miss = document.createElement('span');
      miss.className = 'missable-tag';
      miss.textContent = 'Possibly missable';
      tags.appendChild(miss);
    }
    body.appendChild(tags);

    if (masked) {
      const reveal = document.createElement('button');
      reveal.type = 'button';
      reveal.className = 'reveal-btn';
      reveal.textContent = 'Reveal';
      reveal.addEventListener('click', (event) => {
        event.stopPropagation();
        VL.revealed.add(trophy.id);
        VL.renderList();
      });
      body.appendChild(reveal);
    }

    row.appendChild(body);
    row.addEventListener('click', (event) => {
      if (event.target === box) return;
      VL.selected = trophy.id;
      VL.renderList();
      VL.renderDetail();
    });
    list.appendChild(row);
  });
};
