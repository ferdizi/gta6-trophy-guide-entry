// VICE LEDGER — roadmap and 100% completion ledger. One module, one job:
// the three steps to the platinum and the checklist numbers the 100% run
// needs, written from the cited roadmap (PowerPyx via sixshore, shape
// confirmed by Push Square).
const STEPS = [
  {
    title: 'Step 1 — Story & optional missions',
    hours: '60–80 hours',
    body: 'Play the story; take optional missions as they appear; do the Chapter 1 meditation; scan every new vehicle with WAiNK; study animals through binoculars.',
    progress: 'Story trophies 0/12',
  },
  {
    title: 'Step 2 — The 100% checklist',
    hours: 'about 100 hours',
    body: 'The checklist appears after the story under Progress, Stats, 100% Completion. It needs 70 of 80 challenges, 15 of 18 card sets, 15 of 18 meditations, 300 of 397 stunts, 200 of 277 vehicles, 100 of 255 animals, 100 optional missions, all 39 illegal operations, all 8 bank vaults, and Bret\'s 15 target decks.',
    progress: 'Checklist items 0/10',
  },
  {
    title: 'Step 3 — Strangers & Freaks + cleanup',
    hours: 'about 10 hours',
    body: 'The 8 stranger strands are NOT part of 100%. Clean up anything left; the platinum follows.',
    progress: 'Stranger strands 0/8',
  },
];

const LEDGER_ROWS = [
  ['Challenges', '70 / 80'],
  ['Card sets', '15 / 18'],
  ['Meditations', '15 / 18'],
  ['Stunts', '300 / 397'],
  ['Vehicles', '200 / 277'],
  ['Animals', '100 / 255'],
  ['Optional missions', '100'],
  ['Illegal operations', '39 / 39'],
  ['Bank vaults', '8 / 8'],
  ['Target decks (Bret)', '15 / 15'],
];

export function renderRoadmap() {
  const steps = document.getElementById('roadmap-steps');
  steps.innerHTML = STEPS.map((step) => (
    `<li><strong>${step.title} · ${step.hours}.</strong> ${step.body} <span class="step-hours">${step.progress}</span></li>`
  )).join('');
  const ledger = document.getElementById('ledger-list');
  ledger.innerHTML = LEDGER_ROWS.map(([label, count]) => (
    `<li><span>${label}</span><span class="ledger-count">${count}</span></li>`
  )).join('');
}
