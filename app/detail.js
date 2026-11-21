// VICE LEDGER — detail pane: one trophy, its official text, its guide,
// its source chip, and its earned toggle. One module, one job.
import { UNCONFIRMED_IDS } from './list.js';

function gradeBadge(grade) {
  const label = grade.charAt(0).toUpperCase() + grade.slice(1);
  return `<span class="badge badge-${grade}">${label}</span>`;
}

export function renderDetail(state, trophy, handlers) {
  const pane = document.getElementById('detail');
  if (!trophy) {
    pane.innerHTML = '<p>Pick a trophy from the list to see its guide.</p>';
    return;
  }

  const earned = state.earned.has(trophy.id);
  const hidden = handlers.isHidden(trophy);
  const unconfirmed = UNCONFIRMED_IDS.has(trophy.id);
  const missable = trophy.missable === 'possible';

  if (hidden) {
    pane.innerHTML = `
      <h3>Hidden trophy</h3>
      <div class="detail-tags">${gradeBadge(trophy.grade)}<span class="tag tag-hidden">Hidden</span></div>
      <p class="official">This trophy is hidden on PlayStation until it is earned. Its name and description stay blurred while spoiler mode is on.</p>
      <p><button type="button" class="earned-btn" data-reveal="${trophy.id}">Reveal this trophy</button></p>
      <p class="ledger-note">Revealing only shows this one entry. Spoiler mode stays on for the rest of the list.</p>`;
    pane.querySelector('[data-reveal]').addEventListener('click', () => handlers.onReveal(trophy.id));
    return;
  }

  pane.innerHTML = `
    <h3>${trophy.name}</h3>
    <div class="detail-tags">${gradeBadge(trophy.grade)}<span class="tag">${trophy.kind}</span>${trophy.hidden ? '<span class="tag tag-hidden">Hidden</span>' : ''}${missable ? '<span class="tag tag-missable">Possibly missable</span>' : ''}${unconfirmed ? '<span class="tag tag-unconfirmed">Method unconfirmed</span>' : ''}</div>
    <p class="official">Official description: &ldquo;${trophy.description}&rdquo;</p>
    <p class="guide-text">${trophy.guide}</p>
    ${unconfirmed ? '<div class="unconfirmed-box">Method unconfirmed — no reliable steps have been published for this trophy yet. This guide will not invent them.</div>' : ''}
    ${missable ? '<div class="missable-note">Possibly missable — see the Missables card in the left rail before you play Chapter 1.</div>' : ''}
    <p><span class="source-chip">Source: ${trophy.source}</span></p>
    <p><button type="button" class="earned-btn" data-toggle="${trophy.id}" aria-pressed="${earned}">${earned ? '✓ Earned — mark as not earned' : 'Mark as earned'}</button></p>`;
  pane.querySelector('[data-toggle]').addEventListener('click', () => handlers.onToggle(trophy.id));
}
