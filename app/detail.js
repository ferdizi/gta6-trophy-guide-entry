'use strict';

/* The right pane: the selected trophy's official description, its own-words
   guide, its source chip, and its missable / unconfirmed warnings. */

VL.renderDetail = function () {
  const pane = document.getElementById('detailPane');
  pane.innerHTML = '';
  const trophy = VL.byId.get(VL.selected);
  if (!trophy) {
    const empty = document.createElement('p');
    empty.className = 'detail-empty';
    empty.textContent = 'Select a trophy from the list to see its official description, its guide, and its source.';
    pane.appendChild(empty);
    return;
  }
  const masked = VL.isMasked(trophy);

  const heading = document.createElement('h3');
  heading.textContent = masked ? 'Hidden trophy' : trophy.name;
  pane.appendChild(heading);

  const badges = document.createElement('div');
  badges.className = 'row-tags';
  badges.appendChild(VL.makeBadge(trophy.grade));
  const kind = document.createElement('span');
  kind.className = 'kind-tag';
  kind.textContent = kindLabel(trophy.kind);
  badges.appendChild(kind);
  if (trophy.hidden) {
    const hiddenTag = document.createElement('span');
    hiddenTag.className = 'hidden-tag';
    hiddenTag.textContent = 'Hidden';
    badges.appendChild(hiddenTag);
  }
  pane.appendChild(badges);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = masked
    ? 'Spoiler mode is on: earn this trophy, or reveal it in the list, to read its official description.'
    : 'Official description: “' + trophy.description + '”';
  pane.appendChild(official);

  if (!masked) {
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    pane.appendChild(guide);

    const source = document.createElement('span');
    source.className = 'source-chip';
    source.textContent = 'Source: ' + trophy.source;
    pane.appendChild(source);

    if (VL.isUnconfirmed(trophy)) {
      const warn = document.createElement('div');
      warn.className = 'unconfirmed-box';
      warn.textContent = 'Method unconfirmed — no reliable steps have been published for this trophy yet. This guide will not invent them.';
      pane.appendChild(warn);
    }
    if (trophy.missable === 'possible') {
      const note = document.createElement('div');
      note.className = 'missable-note';
      note.textContent = 'Possibly missable — see the Missables card in the left rail before you play Chapter 1.';
      pane.appendChild(note);
    }
  }

  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.textContent = VL.earned.has(trophy.id) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => {
    if (VL.earned.has(trophy.id)) VL.earned.delete(trophy.id); else VL.earned.add(trophy.id);
    saveStoredProgress();
    refreshAll();
  });
  actions.appendChild(toggle);
  pane.appendChild(actions);
};
