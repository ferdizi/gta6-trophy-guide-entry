'use strict';

/* The header progress bar and the left rail's per-step tallies, kept live as
   trophies are checked off. */

VL.renderProgress = function () {
  const earnedByGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  VL.trophies.forEach((trophy) => {
    if (VL.earned.has(trophy.id)) earnedByGrade[trophy.grade] += 1;
  });
  document.getElementById('earnedCount').textContent = String(VL.earned.size);
  document.getElementById('segPlatinum').style.width = (earnedByGrade.platinum / GRADE_TOTALS.platinum) * 25 + '%';
  document.getElementById('segGold').style.width = (earnedByGrade.gold / GRADE_TOTALS.gold) * 25 + '%';
  document.getElementById('segSilver').style.width = (earnedByGrade.silver / GRADE_TOTALS.silver) * 25 + '%';
  document.getElementById('segBronze').style.width = (earnedByGrade.bronze / GRADE_TOTALS.bronze) * 25 + '%';
  document.getElementById('gradeTally').textContent =
    'Platinum ' + earnedByGrade.platinum + '/1 · Gold ' + earnedByGrade.gold + '/2 · Silver ' +
    earnedByGrade.silver + '/6 · Bronze ' + earnedByGrade.bronze + '/46';
};

VL.renderRail = function () {
  const countKind = (kind) => VL.trophies.filter((trophy) => trophy.kind === kind && VL.earned.has(trophy.id)).length;
  const storyDone = countKind('story');
  const strangerDone = countKind('strangers');
  const checklistIds = [14, 15, 30, 31, 32, 35];
  const checklistDone = checklistIds.filter((id) => VL.earned.has(id)).length;
  document.getElementById('stepOneProgress').textContent = 'Story trophies ' + storyDone + '/12';
  document.getElementById('stepTwoProgress').textContent = 'Checklist trophies ' + checklistDone + '/6';
  document.getElementById('stepThreeProgress').textContent = 'Stranger strands ' + strangerDone + '/7';
};
